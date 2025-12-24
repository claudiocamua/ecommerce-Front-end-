"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth";
import Footer from "../components/layout/Footer";
import { toast } from "react-hot-toast";
import NavbarDashboard from "../components/dashboard/NavbarDashboard";
import UserInfo from "../components/dashboard/UserInfo";
import ComingSoon from "../components/dashboard/ComingSoon";

interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (!authService.isAuthenticated()) {
          router.push("/");
          return;
        }
        const userData = authService.getUser();

        if (userData) {
          setUser(userData);
          setLoading(false);
        } else {
          toast.loading("Carregando dados do usuário...", { id: "loading-user" });

          const userDataFromAPI = await authService.getProfile();
          authService.saveUser(userDataFromAPI);
          setUser(userDataFromAPI);

          toast.success("Dados carregados!", { id: "loading-user" });
          setLoading(false);
        }
      } catch (err: any) {
        console.error(" Erro ao carregar usuário:", err);
        setError("Erro ao carregar dados do usuário");
        toast.error("Erro ao carregar dados. Faça login novamente.");

        // Limpar dados e redirecionar
        authService.logout();
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    };

    loadUserData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primario mb-4"></div>
        <p className="text-texto font-semibold">Carregando ...</p>
        <p className="text-neutro-frente text-sm mt-2">
          Isso pode levar alguns segundos na primeira vez
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <div className="text-red-600 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-texto mb-2">
          Ops! Algo deu errado
        </h2>
        <p className="text-neutro-frente mb-4">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-primario text-white rounded-lg hover:bg-primario-dark"
        >
          Voltar para a home
        </button>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div
      className="relative h-screen flex flex-col bg-cover bg-center"
      style={{ backgroundImage: "url('/image-fundo-1.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/50 pointer-events-none z-0" />

      <div className="relative z-10 flex flex-col h-full">
        <NavbarDashboard user={user} />

        <div className="flex-1 overflow-y-auto">
          <main className="container-custom py-8 min-h-[calc(100vh-400px)]">
            <ComingSoon />
          </main>
        </div>

        <section className="w-full bg-black/50 border-t border-borda py-8">
          <div className="container-custom">
            <UserInfo user={user} />
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}