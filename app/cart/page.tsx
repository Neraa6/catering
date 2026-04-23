"use client";

import { useCart } from "@/contexts/cart-context";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    router.push("/checkout");
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto text-center">
          <div className="w-24 h-24 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-brand-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Keranjang Masih Kosong</h1>
          <p className="text-gray-600 mb-8">
            Yuk, pilih paket catering yang cocok untuk acara Anda!
          </p>
          <Link href="/#paket">
            <Button className="bg-brand-500 hover:bg-brand-600 text-white">
              Lihat Paket Catering
            </Button>
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-24 pb-20 px-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Keranjang Belanja</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="border-brand-100">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl">🍱</span>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{item.nama_paket}</h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {item.jumlah_pax} Pax • Rp {(item.harga_paket / item.jumlah_pax).toLocaleString("id-ID")}/pax
                      </p>
                      <p className="font-bold text-brand-500">
                        Rp {item.harga_paket.toLocaleString("id-ID")}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button
              variant="outline"
              onClick={clearCart}
              className="text-gray-600 hover:text-red-600 hover:border-red-300"
            >
              Kosongkan Keranjang
            </Button>
          </div>

          {/* Summary */}
          <div>
            <Card className="sticky top-24 border-brand-200">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-bold">Ringkasan Pesanan</h2>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Item</span>
                    <span className="font-semibold">{items.length} paket</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total Harga</span>
                    <span className="text-brand-500">
                      Rp {totalPrice.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <Button
                    onClick={handleCheckout}
                    className="w-full bg-brand-500 hover:bg-brand-600 text-white h-12 text-lg"
                  >
                    Lanjut ke Checkout
                  </Button>
                  <Link href="/#paket">
                    <Button variant="outline" className="w-full">
                      Tambah Paket Lain
                    </Button>
                  </Link>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Harga belum termasuk ongkos kirim
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}