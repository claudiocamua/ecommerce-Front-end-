"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ClockIcon } from "@heroicons/react/24/solid";

export default function PedidoPendentePage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/dashboard/orders');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md w-full animate-slideUp">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-500 rounded-full p-6 animate-pulse">
            <ClockIcon className="w-16 h-16 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Pedido Registrado!
        </h1>

        <p className="text-gray-600 mb-2">
           Aguardando confirmação de pagamento.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-700 mb-1">Número do Pedido</p>
          <p className="text-lg font-bold text-blue-900">
            #{orderId?.slice(-8) || orderId}
          </p>
        </div>

        <p className="text-sm text-gray-600 mb-6">
           Você receberá um email assim que o pagamento for confirmado.
        </p>

        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700 mb-2">
            Redirecionando para seus pedidos em:
          </p>
          <p className="text-4xl font-bold text-blue-600">
            {countdown}s
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push('/dashboard/orders')}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 font-semibold transition-all shadow-lg"
          >
            Ver Meus Pedidos Agora
          </button>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-300 font-semibold transition-all"
          >
            Continuar Comprando
          </button>
        </div>
      </div>
    </div>
  );
}