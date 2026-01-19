"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { XCircleIcon } from "@heroicons/react/24/outline";
import Footer from "@/app/components/layout/Footer";

export default function PaymentErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("status");
  const errorMessage = searchParams.get("message");

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-12 text-center border border-red-500/30 max-w-2xl w-full">
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
              <XCircleIcon className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-red-400 mb-4">
             Pagamento Recusado
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Infelizmente, não foi possível processar seu pagamento.
          </p>

          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 mb-8 space-y-3 text-left">
            <h2 className="text-lg font-bold text-red-400 mb-4"> Detalhes do Erro</h2>
            
            {paymentId && (
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/70">ID do Pagamento:</span>
                <span className="font-mono text-white font-semibold">{paymentId}</span>
              </div>
            )}
            
            {status && (
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/70">Status:</span>
                <span className="text-red-400 font-semibold uppercase">{status}</span>
              </div>
            )}
            
            {errorMessage && (
              <div className="flex flex-col gap-1">
                <span className="text-white/70">Motivo:</span>
                <span className="text-white font-semibold">{errorMessage}</span>
              </div>
            )}
          </div>

          <div className="bg-white/5 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-bold text-white mb-4"> Possíveis Causas</h3>
            <ul className="text-sm text-white/90 space-y-2 text-left">
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">•</span>
                <span>Saldo insuficiente na conta ou cartão</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">•</span>
                <span>Dados do cartão incorretos ou expirado</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">•</span>
                <span>Limite de crédito excedido</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">•</span>
                <span>Cartão bloqueado pelo banco</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">•</span>
                <span>Problemas temporários com o processador de pagamento</span>
              </li>
            </ul>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/checkout")}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-xl hover:from-yellow-600 hover:to-orange-600 font-bold transition-all shadow-lg hover:shadow-xl"
            >
               Tentar Novamente
            </button>
            
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-white/10 border-2 border-white/20 text-white px-8 py-4 rounded-xl hover:bg-white/20 font-bold transition-all"
            >
              Voltar ao Dashboard
            </button>
          </div>

          {/* Suporte */}
          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-400/30 rounded-lg">
            <p className="text-sm text-white/80">
               Precisa de ajuda? Entre em contato com nosso{" "}
              <button
                onClick={() => router.push("/suporte")}
                className="text-blue-400 hover:text-blue-300 underline font-semibold"
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