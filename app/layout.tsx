import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/contexts/cart-context";

export const metadata: Metadata = {
  title: "Culiner Yuk | Aplikasi Catering Online",
  description: "Pesan catering berkualitas dengan cepat, aman, dan rasa terjamin.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}