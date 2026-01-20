"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { authService } from "@/app/services/auth"; 
import {
  CubeIcon,
  TagIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(" [ADMIN PAGE] Iniciando verificação...");

    if (!authService.isAuthenticated()) {
      console.log(" [ADMIN PAGE] Não autenticado!");
      toast.error("Você precisa estar logado!");
      router.push("/login");
      return;
    }
    // Verifica se o usuário é admin
    const userData = authService.getUser();
    console.log(" [ADMIN PAGE] Dados do usuário:", userData);
    console.log(" [ADMIN PAGE] is_admin:", userData?.is_admin);
    console.log(" [ADMIN PAGE] Tipo de is_admin:", typeof userData?.is_admin);

    if (!userData?.is_admin) {
      console.log(" [ADMIN PAGE] Usuário não é admin!");
      toast.error(" Acesso negado! Apenas administradores.");
      router.push("/dashboard");
      return;
    }

    console.log(" [ADMIN PAGE] Usuário é admin! Carregando painel...");
    setUser(userData);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="relative min-h-screen flex flex-col">
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/image-fundo-4.jpg')" }}
        />
        <div className="fixed inset-0 -z-10 bg-black/50" />

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-white font-semibold text-lg">
              Verificando permissões...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; 
  }

  return (
    <div className="relative min-h-screen">
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/image-fundo-4.jpg')" }}
      />
      <div className="fixed inset-0 -z-10 bg-black/50" />

      <div className="relative z-10 min-h-screen">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-6 mb-8 border border-white/20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">
                   Painel do Administrador
                </h1>
                <p className="text-white/80 text-lg">
                  Bem-vindo,{" "}
                  <span className="font-semibold">
                    {user.full_name || user.name || user.email}
                  </span>
                </p>
                {/*  BADGE DE ADMIN */}
                <span className="inline-block mt-2 px-3 py-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full">
                  ADMINISTRADOR ATIVO
                </span>
              </div>

              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/20 font-semibold shadow-lg"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Voltar ao Dashboard
              </Link>
            </div>
          </div>

          {/* Cards de Gerenciamento */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Produtos */}
            <Link
              href="/admin/products"
              className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 hover:bg-white/20 transition-all hover:scale-105 border border-white/20 group"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="bg-blue-500/20 p-4 rounded-xl border border-blue-400/30 group-hover:scale-110 transition-transform">
                  <CubeIcon className="w-12 h-12 text-blue-300" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 text-center">
                Produtos
              </h2>
              <p className="text-white/70 text-center">
                Cadastrar e editar produtos
              </p>
            </Link>

            {/* Promoções */}
            <Link
              href="/admin/promocoes"
              className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 hover:bg-white/20 transition-all hover:scale-105 border border-white/20 group"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="bg-green-500/20 p-4 rounded-xl border border-green-400/30 group-hover:scale-110 transition-transform">
                  <TagIcon className="w-12 h-12 text-green-300" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 text-center">
                Promoções
              </h2>
              <p className="text-white/70 text-center">
                Gerenciar promoções
              </p>
            </Link>

            {/* Pedidos */}
            <Link
              href="/admin/orders"
              className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 hover:bg-white/20 transition-all hover:scale-105 border border-white/20 group"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="bg-purple-500/20 p-4 rounded-xl border border-purple-400/30 group-hover:scale-110 transition-transform">
                  <ShoppingBagIcon className="w-12 h-12 text-purple-300" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 text-center">
                Pedidos
              </h2>
              <p className="text-white/70 text-center">
                Visualizar e gerenciar pedidos
              </p>
            </Link>

            {/* Usuários/Administradores */}
            <Link
              href="/admin/usuarios"
              className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 hover:bg-white/20 transition-all hover:scale-105 border border-white/20 group"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="bg-yellow-500/20 p-4 rounded-xl border border-yellow-400/30 group-hover:scale-110 transition-transform">
                  <UserGroupIcon className="w-12 h-12 text-yellow-300" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 text-center">
                Administradores
              </h2>
              <p className="text-white/70 text-center">
                Gerenciar administradores
              </p>
            </Link>
          </div>

          {/* Informações Adicionais */}
          <div className="mt-8 bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-6 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  4
                </div>
                <p className="text-white/70">Módulos Ativos</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-400 mb-2">
                  Administrador
                </div>
                <p className="text-white/70">Nível de Acesso</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  Online
                </div>
                <p className="text-white/70">Status do Sistema</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
