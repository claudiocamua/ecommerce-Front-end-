"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    console.log(" [AUTH CALLBACK] URL completa:", window.location.href);
    console.log(" [AUTH CALLBACK] SearchParams:", Object.fromEntries(searchParams.entries()));

    const token = searchParams.get("token");
    const user_id = searchParams.get("user_id");
    const error = searchParams.get("error");
    const details = searchParams.get("details");

    console.log(" [AUTH CALLBACK] Parâmetros recebidos:", { 
      token: token?.substring(0, 20), 
      user_id, 
      error, 
      details 
    });

    if (error) {
      console.error("  [AUTH CALLBACK] Erro:", error, details);
      router.push(`/?error=${error}&details=${details || ''}`);
      return;
    }

    if (token && user_id) {
      console.log("  [AUTH CALLBACK] Token recebido, salvando...");
      
      localStorage.setItem("token", token);
      localStorage.setItem("user_id", user_id);
      
      console.log(" [AUTH CALLBACK] Token salvo! Verificando:", localStorage.getItem("token")?.substring(0, 20));
      console.log(" [AUTH CALLBACK] Redirecionando para dashboard em 2 segundos...");
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } else {
      console.error(" [AUTH CALLBACK] Token ou user_id não encontrado");
      console.error(" [AUTH CALLBACK] Todos os params:", Object.fromEntries(searchParams.entries()));
      router.push("/?error=auth_failed");
    }
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-fundo">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2 text-white">Autenticando...</h2>
        <p className="text-gray-400">Aguarde enquanto completamos seu login</p>
        <p className="text-xs text-gray-500 mt-4">Verifique o console (F12) para logs</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <CallbackContent />
    </Suspense>
  );
}