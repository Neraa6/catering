// app/order-success/page.tsx
import { Suspense } from "react";
import OrderSuccessClient from "./order-success-client";

// ✅ Fallback component saat loading
function OrderSuccessLoading() {
  return (
    <main className="min-h-screen bg-brown-50">
      <div className="pt-32 pb-20 px-6 max-w-2xl mx-auto text-center">
        <div className="w-20 h-20 bg-brown-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <div className="w-10 h-10 bg-brown-200 rounded-full"></div>
        </div>
        <div className="h-8 bg-brown-200 rounded w-3/4 mx-auto mb-4 animate-pulse"></div>
        <div className="h-4 bg-brown-100 rounded w-1/2 mx-auto mb-8 animate-pulse"></div>
        <div className="bg-white rounded-xl p-6 border border-brown-200 animate-pulse">
          <div className="h-4 bg-brown-100 rounded w-full mb-2"></div>
          <div className="h-4 bg-brown-100 rounded w-2/3"></div>
        </div>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    // ✅ WRAP DENGAN SUSPENSE BOUNDARY
    <Suspense fallback={<OrderSuccessLoading />}>
      <OrderSuccessClient />
    </Suspense>
  );
}