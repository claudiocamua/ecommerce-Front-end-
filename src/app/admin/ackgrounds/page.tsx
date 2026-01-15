"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { PhotoIcon, TrashIcon, CheckCircleIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface Background {
  page: string;
  url: string;
  updated_at?: string;
}

const PAGES = [
  { key: "home", label: "Página Principal (Home)", icon: "🏠" },
  { key: "dashboard", label: "Dashboard do Cliente", icon: "📊" },
  { key: "admin", label: "Painel Admin", icon: "⚙️" },
  { key: "products", label: "Produtos (Loja)", icon: "🛍️" },
  { key: "cart", label: "Carrinho de Compras", icon: "🛒" },
  { key: "checkout", label: "Finalizar Pedido", icon: "💳" },
  { key: "profile", label: "Perfil do Usuário", icon: "👤" },
  { key: "orders", label: "Meus Pedidos", icon: "📦" },
];

export default function BackgroundsPage() {
  const [backgrounds, setBackgrounds] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewPage, setPreviewPage] = useState<string | null>(null);

  useEffect(() => {
    loadBackgrounds();
  }, []);

  const loadBackgrounds = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/backgrounds/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        const bgMap: Record<string, string> = {};
        if (Array.isArray(data)) {
          data.forEach((bg: Background) => {
            const fullUrl = bg.url.startsWith("http")
              ? bg.url
              : `${process.env.NEXT_PUBLIC_API_URL}${bg.url}`;
            bgMap[bg.page] = fullUrl;
          });
        }
        
        setBackgrounds(bgMap);
      }
    } catch (error) {
      console.error("Erro ao carregar backgrounds:", error);
      toast.error("Erro ao carregar backgrounds");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (page: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    setUploading(page);

    try {
      const token = localStorage.getItem("access_token");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("page", page);

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
        const fullUrl = result.background_url.startsWith("http")
          ? result.background_url
          : `${process.env.NEXT_PUBLIC_API_URL}${result.background_url}`;

        setBackgrounds((prev) => ({
          ...prev,
          [page]: `${fullUrl}?t=${Date.now()}`,
        }));

        toast.success(`Background da ${PAGES.find(p => p.key === page)?.label} atualizado!`);
      }
    } catch (error: any) {
      console.error("Erro ao fazer upload:", error);
      toast.error(error.message || "Erro ao atualizar background");
    } finally {
      setUploading(null);
    }
  };

  const handleDelete = async (page: string) => {
    if (!confirm(`Deseja remover o background da ${PAGES.find(p => p.key === page)?.label}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/backgrounds/${page}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Erro ao remover background");

      setBackgrounds((prev) => {
        const newBgs = { ...prev };
        delete newBgs[page];
        return newBgs;
      });

      toast.success("Background removido!");
    } catch (error: any) {
      console.error("Erro ao remover background:", error);
      toast.error("Erro ao remover background");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <PhotoIcon className="w-8 h-8 text-blue-600" />
                Gerenciar Backgrounds do Site
              </h1>
              <p className="text-gray-600 mt-1">
                Configure a imagem de fundo de cada página do site - Clique na imagem para preview
              </p>
            </div>
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Voltar
            </Link>
          </div>
        </div>

        {/* Grid de páginas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PAGES.map((page) => (
            <div
              key={page.key}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Preview */}
              <div
                className="h-48 bg-cover bg-center relative cursor-pointer group"
                style={{
                  backgroundImage: backgrounds[page.key]
                    ? `url(${backgrounds[page.key]})`
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
                onClick={() => setPreviewPage(page.key)}
              >
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">{page.icon}</div>
                    <h3 className="text-white text-lg font-bold px-2">
                      {page.label}
                    </h3>
                    <p className="text-white/80 text-sm mt-1">Clique para preview</p>
                  </div>
                </div>
                {backgrounds[page.key] && (
                  <div className="absolute top-2 right-2">
                    <CheckCircleIcon className="w-6 h-6 text-green-400 drop-shadow-lg" />
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="p-4 space-y-3">
                <p className="text-sm text-gray-600 text-center">
                  {backgrounds[page.key]
                    ? "Background personalizado"
                    : "Usando padrão"}
                </p>

                <div className="flex gap-2">
                  <label
                    htmlFor={`upload-${page.key}`}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors ${
                      uploading === page.key ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <PhotoIcon className="w-5 h-5" />
                    {uploading === page.key ? "Enviando..." : "Trocar"}
                  </label>
                  <input
                    type="file"
                    id={`upload-${page.key}`}
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(page.key, file);
                    }}
                    className="hidden"
                    disabled={uploading === page.key}
                  />

                  {backgrounds[page.key] && (
                    <button
                      onClick={() => handleDelete(page.key)}
                      className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Remover background"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Preview */}
      {previewPage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewPage(null)}
        >
          <div className="max-w-6xl w-full bg-white rounded-lg overflow-hidden">
            <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">
                Preview: {PAGES.find(p => p.key === previewPage)?.label}
              </h3>
              <button
                onClick={() => setPreviewPage(null)}
                className="text-white hover:text-gray-300"
              >
                ✕ Fechar
              </button>
            </div>
            <div
              className="h-[70vh] bg-cover bg-center"
              style={{
                backgroundImage: backgrounds[previewPage]
                  ? `url(${backgrounds[previewPage]})`
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              <div className="h-full bg-black/40 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl mb-4">
                    {PAGES.find(p => p.key === previewPage)?.icon}
                  </div>
                  <h1 className="text-white text-4xl font-bold">
                    {PAGES.find(p => p.key === previewPage)?.label}
                  </h1>
                  <p className="text-white/80 mt-2">Exemplo de visualização</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}