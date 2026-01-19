"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ClockIcon } from "@heroicons/react/24/outline";
import Footer from "@/app/components/layout/Footer";

export default function PaymentPendingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const paymentId = searchParams.get("payment_id");
  const orderId = searchParams.get("order_id");
  const status = searchParams.get("status");

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-12 text-center border border-yellow-500/30 max-w-2xl w-full">
          {/* Ícone de Pendente */}
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center">
              <ClockIcon className="w-16 h-16 text-white animate-spin-slow" />
            </div>
          </div>

          {/* Título */}
          <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-4">
            ⏳ Pagamento Pendente
          </h1>

          {/* Mensagem */}
          <p className="text-xl text-white/90 mb-8">
            Seu pedido foi registrado e está aguardando confirmação do pagamento.
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
                <span className="text-yellow-400 font-semibold uppercase">{status}</span>
              </div>
            )}
          </div>

          {/* Informações sobre Pagamento Pendente */}
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-bold text-white mb-4"> O que isso significa?</h3>
            <div className="text-sm text-white/90 space-y-3 text-left">
              <p>
                Seu pedido foi criado com sucesso, mas o pagamento ainda não foi confirmado.
                Isso pode acontecer nos seguintes casos:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">•</span>
                  <span><strong>Boleto:</strong> Aguardando compensação bancária (até 3 dias úteis)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">•</span>
                  <span><strong>PIX:</strong> Aguardando você realizar o pagamento</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">•</span>
                  <span><strong>Transferência:</strong> Em análise pelo banco</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Próximos Passos */}
          <div className="bg-white/5 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-bold text-white mb-4"> Próximos Passos</h3>
            <ul className="text-sm text-white/90 space-y-2 text-left">
              <li className="flex items-start gap-2">
                <span className="text-green-400">1.</span>
                <span>Complete o pagamento se ainda não o fez</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">2.</span>
                <span>Aguarde a confirmação (geralmente instantânea para PIX)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">3.</span>
                <span>Você receberá um e-mail assim que o pagamento for confirmado</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">4.</span>
                <span>Acompanhe o status no seu dashboard</span>
              </li>
            </ul>
          </div>

          {/* Aviso Importante */}
          <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4 mb-8">
            <p className="text-sm text-white/90">
              ℹ <strong>Importante:</strong> Não tente pagar novamente. Seu pedido já foi registrado
              e será processado assim que recebermos a confirmação do pagamento.
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-indigo-700 font-bold transition-all shadow-lg hover:shadow-xl"
            >
              Acompanhar Pedido
            </button>
            
            <button
              onClick={() => router.push("/products")}
              className="bg-white/10 border-2 border-white/20 text-white px-8 py-4 rounded-xl hover:bg-white/20 font-bold transition-all"
            >
              Continuar Comprando
            </button>
          </div>

          {/* Suporte */}
          <div className="mt-8 p-4 bg-purple-500/10 border border-purple-400/30 rounded-lg">
            <p className="text-sm text-white/80">
               Dúvidas sobre seu pedido? Entre em contato com nosso{" "}
              <button
                onClick={() => router.push("/suporte")}
                className="text-purple-400 hover:text-purple-300 underline font-semibold"
              >
                suporte
              </button>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}