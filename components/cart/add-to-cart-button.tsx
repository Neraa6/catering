"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { ShoppingCart, Check } from "lucide-react";

interface AddToCartButtonProps {
  paket: {
    id: bigint | string;
    nama_paket: string;
    harga_paket: bigint | number;
    jumlah_pax: number;
  };
}

export default function AddToCartButton({ paket }: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart({
      id: paket.id.toString(),
      nama_paket: paket.nama_paket,
      harga_paket: Number(paket.harga_paket),
      jumlah_pax: paket.jumlah_pax,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={added}
      className="w-full h-12 text-lg font-semibold bg-brand-500 hover:bg-brand-600 text-white disabled:opacity-70"
    >
      {added ? (
        <>
          <Check className="mr-2 h-5 w-5" />
          Ditambahkan!
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-5 w-5" />
          Tambah ke Keranjang
        </>
      )}
    </Button>
  );
}