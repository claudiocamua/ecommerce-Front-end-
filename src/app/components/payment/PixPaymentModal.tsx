"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon, ClipboardDocumentIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

interface PixPaymentModalProps {
  qrCode: string;
  qrCodeBase64?: string;
  orderId: string;
  amount: number;
  onClose: () => void;
}

export default function PixPaymentModal({
  qrCode,
  qrCodeBase64,
  orderId,
  amount,
  onClose,
}: PixPaymentModalProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Iniciar contagem regressiva
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirecionar após 5 segundos
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onClose]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(qrCode);
    toast.success("✅ Código PIX copiado!");
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
      style={{ zIndex: 9999 }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="w-10 h-10" />
            <div>
              <h2 className="text-2xl font-bold">Pagamento PIX Aprovado!</h2>
              <p className="text-green-100 text-sm">Transação processada com sucesso</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Informações do Pedido */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Pedido:</span>
              <span className="font-bold text-gray-900">#{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Valor:</span>
              <span className="font-bold text-green-600 text-lg">
                R$ {amount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* QR Code Image */}
          {qrCodeBase64 && (
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 shadow-sm">
                <img
                  src={`data:image/png;base64,${qrCodeBase64}`}
                  alt="QR Code PIX"
                  className="w-64 h-64"
                />
              </div>
            </div>
          )}

          {/* Código PIX (Copia e Cola) */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">
              Ou use o código PIX:
            </p>
            <div className="bg-gray-100 rounded-lg p-3 border border-gray-200">
              <code className="text-xs text-gray-600 break-all block mb-2">
                {qrCode.substring(0, 100)}...
              </code>
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ClipboardDocumentIcon className="w-5 h-5" />
                Copiar Código PIX
              </button>
            </div>
          </div>

          {/* Mensagem de Sucesso com Countdown */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center space-y-2">
            <p className="text-green-800 font-semibold">
              🎉 Seu pagamento foi aprovado automaticamente!
            </p>
            <p className="text-green-700 text-sm">
              ✉️ Um email de confirmação foi enviado para você.
            </p>
            <div className="mt-3 bg-white rounded-lg p-3 border border-green-300">
              <p className="text-sm text-gray-700 mb-1">
                Redirecionando para seus pedidos em:
              </p>
              <p className="text-3xl font-bold text-green-600">
                {countdown}s
              </p>
            </div>
          </div>

          {/* Botão */}
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            Ver Detalhes do Pedido Agora
          </button>
        </div>
      </div>
    </div>
  );
}