"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import Footer from "@/app/components/layout/Footer";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);

  const paymentId = searchParams.get("payment_id");
  const orderId = searchParams.get("order_id");
  const status = searchParams.get("status");

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-12 text-center border border-white/20 max-w-2xl w-full">
          {/* Ícone de Sucesso */}
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircleIcon className="w-16 h-16 text-white" />
            </div>
          </div>

          {/* Título */}
          <h1 className="text-4xl md:text-5xl font-bold text-green-400 mb-4">
             Pagamento Aprovado!
          </h1>

          {/* Mensagem */}
          <p className="text-xl text-white/90 mb-8">
            Seu pedido foi confirmado com sucesso!
          </p>

          {/* Informações do Pedido */}
          <div className="bg-white/5 rounded-2xl p-6 mb-8 space-y-3 text-left">
            <h2 className="text-lg font-bold text-yellow-400 mb-4"> Detalhes do Pedido</h2>
            
            {orderId && (
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/70">Número do Pedido:</span>
                <span className="font-mono text-white font-semibold">#{orderId}</span>
              </div>
            )}
            
            {paymentId && (
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/70">ID do Pagamento:</span>
                <span className="font-mono text-white font-semibold">{paymentId}</span>
              </div>
            )}
            
            {status && (
              <div className="flex justify-between">
                <span className="text-white/70">Status:</span>
                <span className="text-green-400 font-semibold uppercase">{status}</span>
              </div>
            )}
          </div>

          {/* Próximos Passos */}
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-bold text-white mb-4"> Próximos Passos</h3>
            <ul className="text-sm text-white/90 space-y-2 text-left">
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Você receberá um e-mail de confirmação em breve</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Acompanhe o status do pedido no seu dashboard</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Estimativa de entrega: 5-7 dias úteis</span>
              </li>
            </ul>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl hover:from-green-600 hover:to-green-700 font-bold transition-all shadow-lg hover:shadow-xl"
            >
              Ir para Dashboard
            </button>
            
            <button
              onClick={() => router.push("/products")}
              className="bg-white/10 border-2 border-white/20 text-white px-8 py-4 rounded-xl hover:bg-white/20 font-bold transition-all"
            >
              Continuar Comprando
            </button>
          </div>

          {/* Contador de Redirecionamento */}
          <p className="text-sm text-white/60 mt-8">
            Redirecionando para o dashboard em {countdown} segundos...
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}