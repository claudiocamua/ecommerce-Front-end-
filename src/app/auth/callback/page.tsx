"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { authService } from "@/app/services/auth";

export default function AuthCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  // Extrair token e possível erro dos parâmetros de busca
  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      console.error(" Erro na autenticação:", error);
      toast.error("Erro ao fazer login com Google");
      router.push("/");
      return;
    }

    if (token) {
      console.log(" Token recebido do Google OAuth");

      authService.saveToken(token);
      authService
        .getProfile()
        .then((user) => {
          console.log(" Perfil do usuário obtido:", user);
          authService.saveUser(user);

          toast.success("Login realizado com sucesso! Redirecionando...");
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 1000);
        })
        .catch((profileError) => {
          console.error(" Erro ao buscar perfil:", profileError);
          toast.error("Erro ao carregar dados do usuário");
          router.push("/");
        });
    } else {
      console.error(" Nenhum token recebido");
      toast.error("Erro ao processar login");
      router.push("/");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold mb-2">Processando login...</h1>
        <p className="text-white/60">
          Aguarde enquanto validamos suas credenciais
        </p>
      </div>
    </div>
  );
}