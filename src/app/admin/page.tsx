"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
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

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/");
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);

          // Verificar se é admin
          if (!userData.is_admin) {
            toast.error("Acesso negado! Apenas administradores.");
            router.push("/");
            return;
          }
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        router.push("/");
      }
    };

    init();
  }, [router]);

  if (!user) {
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
            <p className="text-white font-semibold text-lg">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Background Fixo */}
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
                  🛠️ Painel do Administrador
                </h1>
                <p className="text-white/80 text-lg">
                  Bem-vindo,{" "}
                  <span className="font-semibold">
                    {user.full_name || user.name || user.email}
                  </span>
                </p>
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
                  {user.is_admin ? "Admin" : "Usuário"}
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
