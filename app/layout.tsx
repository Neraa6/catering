import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/contexts/cart-context";
import { AuthProvider } from "@/contexts/auth-context";

export const metadata: Metadata = {
  title: "Culiner Yuk | Premium Catering Service",
  description: "Pesan catering berkualitas dengan cita rasa mewah untuk setiap momen spesial Anda.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <body>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}