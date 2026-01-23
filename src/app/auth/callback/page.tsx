"use client";

export const dynamic = 'force-dynamic';

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/app/services/auth";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const userParam = searchParams.get("user");

    console.log("[AUTH CALLBACK] URL completa:", window.location.href);
    console.log("[AUTH CALLBACK] SearchParams:", Object.fromEntries(searchParams.entries()));

    if (token && userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        
        console.log("[AUTH CALLBACK] Salvando token e user...");
        authService.saveToken(token);
        authService.saveUser(userData);
        
        const saved = localStorage.getItem('access_token');
        console.log("[AUTH CALLBACK] Token salvo:", !!saved);
        
        router.push("/dashboard");
      } catch (error) {
        console.error("[AUTH CALLBACK] Erro ao processar callback:", error);
        router.push("/");
      }
    } else {
      console.error("[AUTH CALLBACK] Token ou user não encontrado");
      console.error("[AUTH CALLBACK] Todos os params:", Object.fromEntries(searchParams.entries()));
      router.push("/");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"></div>
        <p className="text-white text-xl">Processando autenticação...</p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <CallbackContent />
    </Suspense>
  );
}