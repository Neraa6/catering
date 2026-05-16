import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ✅ Interface untuk data laporan
export interface ReportStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalPackages: number;
}

export interface ReportOrder {
  no_resi: string;
  pelanggan: string;
  tanggal: string;
  total: number;
  status: string;
}

export interface ReportData {
  stats: ReportStats;
  orders: ReportOrder[];
  role: "admin" | "owner";
}

// ✅ Type guard untuk validasi data
export function isValidReportData(data: unknown): data is ReportData {
  return (
    typeof data === "object" &&
    data !== null &&
    "stats" in data &&
    "orders" in data &&
    "role" in data &&
    typeof (data as ReportData).role === "string" &&
    Array.isArray((data as ReportData).orders)
  );
}

// ✅ Interface untuk extended jsPDF dengan autoTable property
interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

// ✅ Type guard helper untuk jsPDF extended
function isJsPDFWithAutoTable(doc: unknown): doc is JsPDFWithAutoTable {
  return (
    typeof doc === "object" &&
    doc !== null &&
    "lastAutoTable" in doc &&
    typeof (doc as JsPDFWithAutoTable).lastAutoTable === "object" &&
    (doc as JsPDFWithAutoTable).lastAutoTable !== null &&
    "finalY" in (doc as JsPDFWithAutoTable).lastAutoTable! &&
    typeof (doc as JsPDFWithAutoTable).lastAutoTable?.finalY === "number"
  );
}

// ✅ Helper untuk get finalY dengan safe unknown handling
function getAutoTableFinalY(doc: unknown): number {
  if (isJsPDFWithAutoTable(doc)) {
    return doc.lastAutoTable?.finalY ?? 0;
  }
  return 0; // fallback value
}

export async function exportToExcel(data: ReportData, filename: string): Promise<void> {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Ringkasan
  const summary: (string | number)[][] = [
    ["LAPORAN CULINER YUK"],
    [`Role: ${data.role.toUpperCase()}`],
    [`Dicetak: ${new Date().toLocaleDateString("id-ID")}`],
    [],
    ["STATISTIK"],
    ["Total Pesanan", data.stats.totalOrders],
    ["Total Pendapatan", `Rp ${data.stats.totalRevenue.toLocaleString("id-ID")}`],
    ["Total Pelanggan", data.stats.totalCustomers],
    ["Total Paket", data.stats.totalPackages],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summary), "Ringkasan");

  // Sheet 2: Pesanan
  const orders: Record<string, string | number>[] = data.orders.map((o) => ({
    "No. Resi": o.no_resi,
    Pelanggan: o.pelanggan,
    Tanggal: o.tanggal,
    Total: `Rp ${o.total.toLocaleString("id-ID")}`,
    Status: o.status.replace(/_/g, " "),
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(orders), "Pesanan");

  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export async function exportToPDF(data: ReportData, filename: string): Promise<void> {
  const doc: jsPDF = new jsPDF();
  const pageWidth: number = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(18);
  doc.setTextColor(74, 33, 10);
  doc.text("CULINER YUK", pageWidth / 2, 20, { align: "center" });
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Laporan ${data.role === "owner" ? "Owner" : "Admin"}`, pageWidth / 2, 28, { align: "center" });
  doc.setFontSize(10);
  doc.text(`Dicetak: ${new Date().toLocaleDateString("id-ID")}`, pageWidth / 2, 35, { align: "center" });

  // Stats Table
  doc.setFontSize(14);
  doc.setTextColor(74, 33, 10);
  doc.text("Statistik", 14, 50);
  
  const stats: [string, string][] = [
    ["Total Pesanan", data.stats.totalOrders.toString()],
    ["Total Pendapatan", `Rp ${data.stats.totalRevenue.toLocaleString("id-ID")}`],
    ["Total Pelanggan", data.stats.totalCustomers.toString()],
    ["Total Paket", data.stats.totalPackages.toString()],
  ];
  autoTable(doc, { startY: 55, head: [["Metric", "Nilai"]], body: stats, theme: "striped", headStyles: { fillColor: [74, 33, 10] } });

  // Orders Table - ✅ GANTI (doc as any) DENGAN HELPER TYPE-SAFE
  const finalY: number = getAutoTableFinalY(doc as unknown) + 10;
  doc.setFontSize(14);
  doc.text("Pesanan Terbaru", 14, finalY);
  
  const orders: [string, string, string, string, string][] = data.orders.map((o) => [
    o.no_resi,
    o.pelanggan,
    o.tanggal,
    `Rp ${o.total.toLocaleString("id-ID")}`,
    o.status.replace(/_/g, " "),
  ]);
  autoTable(doc, { 
    startY: finalY + 5, 
    head: [["No. Resi", "Pelanggan", "Tanggal", "Total", "Status"]], 
    body: orders, 
    theme: "striped", 
    headStyles: { fillColor: [74, 33, 10] }, 
    styles: { fontSize: 9 } 
  });

  doc.save(`${filename}.pdf`);
}