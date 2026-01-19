"use client";

import { useEffect } from "react";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";

interface MercadoPagoCheckoutProps {
  preferenceId: string;
  onReady?: () => void;
  onError?: (error: any) => void;
}

export default function MercadoPagoCheckout({
  preferenceId,
  onReady,
  onError,
}: MercadoPagoCheckoutProps) {
  useEffect(() => {
    // Inicializar SDK do Mercado Pago
    const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || "APP_USR-04f50596-6def-4dc9-a168-c813811fa933";
    
    try {
      initMercadoPago(publicKey, {
        locale: "pt-BR",
      });
      console.log(" SDK Mercado Pago inicializado com sucesso");
    } catch (error) {
      console.error(" Erro ao inicializar Mercado Pago:", error);
    }
  }, []);

  return (
    <div className="mercadopago-checkout">
      <Wallet
        initialization={{
          preferenceId: preferenceId,
          redirectMode: "self",
        }}
        customization={{
          visual: {
            buttonBackground: "black",
            borderRadius: "6px",
          },
          texts: {
            valueProp: "security_safety",
          },
        }}
        onReady={() => {
          console.log(" Botão Mercado Pago renderizado");
          onReady?.();
        }}
        onError={(error) => {
          console.error(" Erro no botão Mercado Pago:", error);
          onError?.(error);
        }}
      />
    </div>
  );
}