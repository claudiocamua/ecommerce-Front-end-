"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  CubeIcon,
  TagIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  PhotoIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [backgroundUrl, setBackgroundUrl] = useState<string>("/image-fundo-3.jpg");
  const [uploading, setUploading] = useState(false);

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

          // Carregar imagem de fundo
          await loadBackground();
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

  const loadBackground = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/backgrounds/admin/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        if (data.background_url) {
          const fullUrl = data.background_url.startsWith('http')
            ? data.background_url
            : `${process.env.NEXT_PUBLIC_API_URL}${data.background_url}`;
          
          setBackgroundUrl(fullUrl);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar background:", error);
    }
  };

  const handleBackgroundChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem("access_token");
      
      if (!token) {
        throw new Error("Token não encontrado. Faça login novamente.");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("page", "admin"); // ✅ Especificar página admin

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/upload-background/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Erro ao fazer upload");
      }

      const result = await response.json();

      if (result.background_url) {
        const fullUrl = result.background_url.startsWith('http')
          ? result.background_url
          : `${process.env.NEXT_PUBLIC_API_URL}${result.background_url}`;
        
        const newUrl = `${fullUrl}?t=${Date.now()}`;
        setBackgroundUrl(newUrl);
        
        toast.success("Imagem de fundo atualizada com sucesso!");
      }
    } catch (error: any) {
      console.error("❌ Erro ao fazer upload:", error);
      toast.error(error.message || "Erro ao atualizar imagem de fundo");
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${backgroundUrl})`,
      }}
    >
      <div className="min-h-screen bg-black/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Painel do Administrador
                </h1>
                <p className="text-white/80">
                  Bem-vindo, {user.full_name || user.name || user.email}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                  Voltar para o Dashboard
                </Link>
              </div>
            </div>
          </div>

          {/* Cards de Gerenciamento */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Produtos */}
            <Link
              href="/admin/products"
              className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl p-6 hover:bg-white/20 transition-all hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <CubeIcon className="w-12 h-12 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Produtos</h2>
              <p className="text-white/70">Cadastrar e editar produtos</p>
            </Link>

            {/* Promoções */}
            <Link
              href="/admin/promocoes"
              className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl p-6 hover:bg-white/20 transition-all hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <TagIcon className="w-12 h-12 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Promoções</h2>
              <p className="text-white/70">Gerenciar promoções</p>
            </Link>

            {/* Pedidos */}
            <Link
              href="/admin/orders"
              className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl p-6 hover:bg-white/20 transition-all hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <ShoppingBagIcon className="w-12 h-12 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Pedidos</h2>
              <p className="text-white/70">Visualize e gerencie todos os pedidos</p>
            </Link>

            {/* Usuários */}
            <Link
              href="/admin/usuarios"
              className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl p-6 hover:bg-white/20 transition-all hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <UserGroupIcon className="w-12 h-12 text-yellow-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Administradores
              </h2>
              <p className="text-white/70">Gerenciar administradores</p>
            </Link>

            {/*Backgrounds */}
            <Link
              href="/admin/ackgrounds"
              className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl p-6 hover:bg-white/20 transition-all hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <PhotoIcon className="w-12 h-12 text-pink-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Backgrounds</h2>
              <p className="text-white/70">Gerenciar fundos das páginas</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
