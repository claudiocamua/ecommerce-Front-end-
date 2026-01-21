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
    const user = searchParams.get("user");

    if (token && user) {
      try {
        const userData = JSON.parse(decodeURIComponent(user));
        authService.saveToken(token);
        authService.saveUser(userData);
        router.push("/dashboard");
      } catch (error) {
        console.error("Erro ao processar callback:", error);
        router.push("/");
      }
    } else {
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
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white text-xl">Carregando...</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}