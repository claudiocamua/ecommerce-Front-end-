"use client";

import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  ClipboardDocumentIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

interface BoletoPaymentModalProps {
  ticketUrl: string;
  barcode?: string;
  orderId: string;
  amount: number;
  expirationDate: string;
  onClose: () => void;
}

export default function BoletoPaymentModal({
  ticketUrl,
  barcode,
  orderId,
  amount,
  expirationDate,
  onClose,
}: BoletoPaymentModalProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Iniciar contagem regressiva
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onClose]);

  const copyBarcode = () => {
    if (barcode) {
      navigator.clipboard.writeText(barcode);
      toast.success("✅ Código de barras copiado!");
    }
  };

  const downloadBoleto = () => {
    window.open(ticketUrl, "_blank");
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
      style={{ zIndex: 9999 }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3">
            <DocumentTextIcon className="w-10 h-10" />
            <div>
              <h2 className="text-2xl font-bold">Boleto Bancário Gerado</h2>
              <p className="text-blue-100 text-sm">
                Efetue o pagamento até o vencimento
              </p>
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
              <span className="font-bold text-blue-600 text-lg">
                R$ {amount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vencimento:</span>
              <span className="font-bold text-orange-600">
                {new Date(expirationDate).toLocaleDateString("pt-BR")}
              </span>
            </div>
          </div>

          {/* Código de Barras */}
          {barcode && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">
                Código de Barras:
              </p>
              <div className="bg-gray-100 rounded-lg p-3 border border-gray-200">
                <code className="text-xs text-gray-600 break-all block mb-2 font-mono">
                  {barcode}
                </code>
                <button
                  onClick={copyBarcode}
                  className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <ClipboardDocumentIcon className="w-5 h-5" />
                  Copiar Código de Barras
                </button>
              </div>
            </div>
          )}

          {/* Botão Download */}
          <button
            onClick={downloadBoleto}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-blue-700 font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Baixar Boleto (PDF)
          </button>

          {/* Email de Confirmação */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-blue-800 text-sm">
              ✉️ Um email com os detalhes do boleto foi enviado para você.
            </p>
          </div>

          {/* Countdown */}
          <div className="bg-white rounded-lg p-3 border border-blue-200 text-center">
            <p className="text-sm text-gray-700 mb-1">
              Redirecionando para seus pedidos em:
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {countdown}s
            </p>
          </div>

          {/* Avisos Importantes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="font-semibold text-yellow-800 mb-2">
              ⚠️ Importante:
            </p>
            <ul className="space-y-1 text-sm text-yellow-700">
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>Pague até a data de vencimento</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>
                  O pedido será processado após confirmação (até 2 dias úteis)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>
                  O boleto pode ser pago em qualquer banco ou lotérica
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}