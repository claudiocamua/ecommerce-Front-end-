"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import Footer from "@/app/components/layout/Footer";
import { toast } from "react-hot-toast";
import {
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
  ShieldCheckIcon,
  PencilSquareIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";
import NavbarDashboard from "../components/dashboard/NavbarDashboard";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        console.log(" Usuário não encontrado no store");
        toast.error("Você precisa estar logado para acessar o perfil!");
        router.push("/");
        return;
      }

      console.log(" Usuário encontrado:", user);

      setProfile({
        id: user.id,
        email: user.email,
        full_name: user.full_name || "Usuário",
        is_active: user.is_active || true,
        is_verified: user.is_verified || false,
        created_at: user.created_at || new Date().toISOString(),
      });

      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
      });

      setLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [user, router]);

  const handleSave = async () => {
    if (!formData.full_name.trim()) {
      toast.error("Nome completo não pode estar vazio!");
      return;
    }

    setSaving(true);

    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const token = localStorage.getItem("access_token");

      if (!token) {
        toast.error("Token não encontrado. Faça login novamente.");
        router.push("/");
        return;
      }

      console.log(" Atualizando perfil:", { full_name: formData.full_name });

      // Chamada ao backend para atualizar o perfil
      const res = await fetch(`${baseURL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: formData.full_name,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error(" Erro do backend:", errorData);
        throw new Error(errorData.detail || "Erro ao atualizar perfil");
      }

      const data = await res.json();
      console.log(" Resposta completa do backend:", data);

      const updatedUser = data.user;

      useAuthStore.getState().setUser(updatedUser);

      setProfile({
        ...profile!,
        full_name: updatedUser.full_name,
      });

      toast.success("Perfil atualizado com sucesso!");
      setIsEditing(false);
    } catch (error: any) {
      console.error(" Erro completo:", error);
      toast.error(error.message || "Erro ao atualizar perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logout realizado com sucesso!");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mb-4"></div>
        <p className="text-white font-semibold">Carregando perfil...</p>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/image-fundo-1.jpg')" }}
      />
      <div className="fixed inset-0 -z-10 bg-black/60" />

      <NavbarDashboard user={user} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full mt-24">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl">
            <UserIcon className="w-16 h-16 text-gray-900" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">
            {profile.full_name}
          </h1>
          <p className="text-lg text-white/70">{profile.email}</p>
        </div>

        {/* Informações do Perfil */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-6 shadow-2xl border border-white/20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Informações do Perfil</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 rounded-xl hover:bg-yellow-500 transition-all font-semibold"
            >
              <PencilSquareIcon className="w-5 h-5" />
              {isEditing ? "Cancelar" : "Editar"}
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <UserIcon className="w-6 h-6 text-yellow-400 mt-1" />
              <div className="flex-1">
                <label className="text-sm text-white/60 mb-1 block">Nome Completo</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    placeholder="Digite seu nome completo"
                  />
                ) : (
                  <p className="text-white text-lg font-medium">{profile.full_name}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4">
              <EnvelopeIcon className="w-6 h-6 text-yellow-400 mt-1" />
              <div className="flex-1">
                <label className="text-sm text-white/60 mb-1 block">Email</label>
                <p className="text-white text-lg font-medium">{profile.email}</p>
                <p className="text-xs text-white/40 mt-1">
                  (Email não pode ser alterado)
                </p>
              </div>
            </div>

            {/* Data de Cadastro */}
            <div className="flex items-start gap-4">
              <CalendarIcon className="w-6 h-6 text-yellow-400 mt-1" />
              <div className="flex-1">
                <label className="text-sm text-white/60 mb-1 block">Membro desde</label>
                <p className="text-white text-lg font-medium">
                  {formatDate(profile.created_at)}
                </p>
              </div>
            </div>

            {/* Status da Conta */}
            <div className="flex items-start gap-4">
              <ShieldCheckIcon className="w-6 h-6 text-yellow-400 mt-1" />
              <div className="flex-1">
                <label className="text-sm text-white/60 mb-1 block">Status da Conta</label>
                <div className="flex gap-3 mt-2">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      profile.is_active
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {profile.is_active ? "✓ Ativa" : "✗ Inativa"}
                  </span>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      profile.is_verified
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {profile.is_verified ? "✓ Verificada" : "⚠ Não Verificada"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="mt-8 flex gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-6 py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? " Salvando..." : " Salvar Alterações"}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    full_name: profile.full_name,
                    email: profile.email,
                  });
                }}
                disabled={saving}
                className="px-6 py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-bold text-lg disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => router.push("/orders")}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-semibold shadow-lg"
          >
            <CalendarIcon className="w-6 h-6" />
            Meus Pedidos
          </button>
          <button
            onClick={() => router.push("/change-password")}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all font-semibold shadow-lg"
          >
            <KeyIcon className="w-6 h-6" />
            Alterar Senha
          </button>
        </div>

        {/* Logout */}
        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="w-full px-6 py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-bold text-lg shadow-lg"
          >
            Sair da Conta
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}