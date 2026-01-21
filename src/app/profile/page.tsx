"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/app/services/auth";
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
  name: string;
  full_name?: string;
  picture?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  provider?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
  });

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      console.log(" Usuário não autenticado");
      toast.error("Você precisa estar logado para acessar o perfil!");
      router.push("/");
      return;
    }

    const loadProfile = async () => {
      try {
        let user = authService.getUser();
        if (!user) {
          console.log(" Buscando perfil do backend...");
          user = await authService.getProfile();
          authService.saveUser(user);
        }

        console.log(" Usuário carregado:", user);

        setProfile({
          id: user.id,
          email: user.email,
          name: user.name || user.full_name || "Usuário",
          full_name: user.full_name || user.name,
          picture: user.picture,
          is_active: user.is_active ?? true,
          is_verified: user.is_verified ?? false,
          created_at: user.created_at || new Date().toISOString(),
          provider: user.provider || "credentials",
        });

        setFormData({
          name: user.name || user.full_name || "",
        });

        setLoading(false);
      } catch (error) {
        console.error(" Erro ao carregar perfil:", error);
        toast.error("Erro ao carregar perfil. Faça login novamente.");
        authService.logout();
      }
    };

    loadProfile();
  }, [router]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Nome não pode estar vazio!");
      return;
    }

    setSaving(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
      const token = authService.getToken();

      if (!token) {
        toast.error("Token não encontrado. Faça login novamente.");
        authService.logout();
        return;
      }

      console.log(" Atualizando perfil:", { name: formData.name });

      const response = await fetch(`${API_URL}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erro ao atualizar perfil");
      }

      const updatedUser = await response.json();
      console.log(" Perfil atualizado:", updatedUser);

      authService.saveUser(updatedUser);

      setProfile({
        ...profile!,
        name: updatedUser.name || updatedUser.full_name,
        full_name: updatedUser.full_name || updatedUser.name,
      });

      toast.success("Perfil atualizado com sucesso!");
      setIsEditing(false);
    } catch (error: any) {
      console.error(" Erro ao atualizar perfil:", error);
      toast.error(error.message || "Erro ao atualizar perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    toast.success("Logout realizado com sucesso!");
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

      <NavbarDashboard user={profile ? {
        ...profile,
        full_name: profile.full_name || ''
      } : null} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full mt-24">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl overflow-hidden">
            {profile.picture ? (
              <img
                src={profile.picture}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon className="w-16 h-16 text-gray-900" />
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">
            {profile.name}
          </h1>
          <p className="text-lg text-white/70">{profile.email}</p>
          {profile.provider === "google" && (
            <span className="inline-block mt-2 px-3 py-1 bg-white/10 text-white/80 rounded-full text-sm">
               Conectado via Google
            </span>
          )}
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
                <label className="text-sm text-white/60 mb-1 block">Nome</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    placeholder="Digite seu nome"
                  />
                ) : (
                  <p className="text-white text-lg font-medium">{profile.name}</p>
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
                    name: profile.name,
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