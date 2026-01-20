"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

export default function PedidoConfirmadoPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Iniciar contagem regressiva
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirecionar após 5 segundos
          router.push('/dashboard/orders');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md w-full animate-slideUp">
        {/* Ícone de Sucesso */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-500 rounded-full p-6 animate-pulse">
            <CheckCircleIcon className="w-16 h-16 text-white" />
          </div>
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Pedido Confirmado!
        </h1>

        {/* Mensagem */}
        <p className="text-gray-600 mb-2">
           Seu pagamento foi aprovado com sucesso.
        </p>

        {/* Número do Pedido */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-700 mb-1">Número do Pedido</p>
          <p className="text-lg font-bold text-green-900">
            #{orderId?.slice(-8) || orderId}
          </p>
        </div>

        {/* Email */}
        <p className="text-sm text-gray-600 mb-6">
           Um email de confirmação foi enviado para você com todos os detalhes do pedido.
        </p>

        {/* Countdown */}
        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700 mb-2">
            Redirecionando para seus pedidos em:
          </p>
          <p className="text-4xl font-bold text-green-600">
            {countdown}s
          </p>
        </div>

        {/* Botões */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push('/dashboard/orders')}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-xl hover:bg-green-700 font-semibold transition-all shadow-lg hover:shadow-xl"
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