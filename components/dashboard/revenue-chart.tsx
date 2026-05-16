/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// ✅ Type-safe interface untuk data chart
interface ChartDataPoint {
  labels: string[];
  revenue: number[];
  orders: number[];
}

interface RevenueChartProps {
  year: number;
}

// ✅ Type guard helper
function isChartDataPoint(data: unknown): data is ChartDataPoint {
  return (
    typeof data === "object" &&
    data !== null &&
    "labels" in data &&
    "revenue" in data &&
    "orders" in data &&
    Array.isArray((data as ChartDataPoint).labels) &&
    Array.isArray((data as ChartDataPoint).revenue) &&
    Array.isArray((data as ChartDataPoint).orders)
  );
}

export default function RevenueChart({ year }: RevenueChartProps) {
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [data, setData] = useState<ChartDataPoint>({ labels: [], revenue: [], orders: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, [year]);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/owner/revenue?year=${year}`);
      const result: unknown = await response.json();
      
      if (response.ok && isChartDataPoint(result)) {
        setData(result);
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Chart data (shared)
  const chartData: ChartData<"line" | "bar", number[]> = {
    labels: data.labels,
    datasets: [
      {
        label: "Pendapatan (Rp)",
        data: data.revenue,
        borderColor: "rgb(120, 53, 15)",
        backgroundColor: "rgba(120, 53, 15, 0.8)",
        borderWidth: 2,
      },
    ],
  };

  // ✅ Options khusus Line Chart
  const lineOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "top" },
    tooltip: {
      callbacks: {
        // ✅ Format tooltip dengan Intl.NumberFormat yang benar
        label: (context) => {
          const label = context.dataset.label || "";
          const value = context.parsed.y as number;
          
          // Format sebagai Rupiah
          return `${label}: ${new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(value)}`;
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      // ✅ Format Y-axis labels dengan Rupiah
      ticks: {
        callback: (value: unknown) => {
          // Pastikan value adalah number
          const numValue = typeof value === "number" ? value : 0;
          
          return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
            // ✅ Hilangkan desimal untuk angka besar (opsional)
          }).format(numValue);
        },
        // ✅ Optional: Batasi jumlah label agar tidak penuh
        maxTicksLimit: 6,
      },
    },
  },
};
  // ✅ Options khusus Bar Chart
  const barOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y as number;
            return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value as number),
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brown-200 border-t-brown-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Chart Toggle */}
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setChartType("line")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${chartType === "line" ? "bg-brown-500 text-white" : "bg-brown-100 text-brown-700"}`}
        >
          Line
        </button>
        <button
          onClick={() => setChartType("bar")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${chartType === "bar" ? "bg-brown-500 text-white" : "bg-brown-100 text-brown-700"}`}
        >
          Bar
        </button>
      </div>

      <div className="h-80">
        {chartType === "line" ? (
          <Line data={chartData as ChartData<"line">} options={lineOptions} />
        ) : (
          <Bar data={chartData as ChartData<"bar">} options={barOptions} />
        )}
      </div>
    </div>
  );
}