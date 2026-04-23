"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: string;
  nama_paket: string;
  harga_paket: number;
  jumlah_pax: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (paket: any) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  // 1. INISIALISASI DARI LOCAL STORAGE
  // Ini penting supaya data tidak hilang saat refresh
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem("culiner-cart");
      if (savedCart) {
        try {
          return JSON.parse(savedCart);
        } catch (e) {
          return [];
        }
      }
    }
    return [];
  });

  // 2. SIMPAN KE LOCAL STORAGE SETIAP KALI ITEMS BERUBAH
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("culiner-cart", JSON.stringify(items));
    }
  }, [items]);

  const addToCart = (paket: any) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === paket.id.toString());
      if (existing) {
        return prev.map((item) =>
          item.id === paket.id.toString()
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: paket.id.toString(),
          nama_paket: paket.nama_paket,
          harga_paket: Number(paket.harga_paket),
          jumlah_pax: paket.jumlah_pax,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const totalPrice = items.reduce(
    (sum, item) => sum + item.harga_paket * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}