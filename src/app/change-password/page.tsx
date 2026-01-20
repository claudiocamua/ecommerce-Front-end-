"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import Navbar from "@/app/components/layout/navbar";
import Footer from "@/app/components/layout/Footer";
import { toast } from "react-hot-toast";
import { KeyIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import NavbarDashboard from "../components/dashboard/NavbarDashboard";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  // Manipulação do envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error("Preencha todos os campos!");
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error("A nova senha deve ter no mínimo 8 caracteres!");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("As senhas não coincidem!");
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      toast.error("A nova senha deve ser diferente da atual!");
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Senha alterada com sucesso!");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      
      setTimeout(() => {
        router.push("/profile");
      }, 1000);
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error);
      toast.error(error?.response?.data?.detail || "Erro ao alterar senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    router.push("/");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <NavbarDashboard user={user} />

      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full mt-24">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl">
            <KeyIcon className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-purple-400 mb-2">
            Alterar Senha
          </h1>
          <p className="text-lg text-white/70">Crie uma senha forte e segura</p>
        </div>

        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20"
        >
          <div className="space-y-6">
            {/* Senha Atual */}
            <div>
              <label className="text-white font-semibold mb-2 block">
                Senha Atual
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, currentPassword: e.target.value })
                  }
                  className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 pr-12"
                  placeholder="Digite sua senha atual"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showCurrentPassword ? (
                    <EyeSlashIcon className="w-6 h-6" />
                  ) : (
                    <EyeIcon className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>

            {/* Nova Senha */}
            <div>
              <label className="text-white font-semibold mb-2 block">
                Nova Senha
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 pr-12"
                  placeholder="Digite sua nova senha"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showNewPassword ? (
                    <EyeSlashIcon className="w-6 h-6" />
                  ) : (
                    <EyeIcon className="w-6 h-6" />
                  )}
                </button>
              </div>
              <p className="text-white/50 text-sm mt-2">
                Mínimo de 8 caracteres
              </p>
            </div>

            {/* Confirmar Senha */}
            <div>
              <label className="text-white font-semibold mb-2 block">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 pr-12"
                  placeholder="Confirme sua nova senha"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="w-6 h-6" />
                  ) : (
                    <EyeIcon className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="mt-8 flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Alterando..." : "Alterar Senha"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="px-6 py-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all font-bold text-lg"
            >
              Cancelar
            </button>
          </div>
        </form>

        {/* Dicas de Segurança */}
        <div className="mt-8 bg-blue-500/10 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/20">
          <h3 className="text-blue-300 font-bold text-lg mb-3">
             Dicas para uma senha segura:
          </h3>
          <ul className="text-white/80 space-y-2 text-sm">
            <li>✓ Use pelo menos 8 caracteres</li>
            <li>✓ Combine letras maiúsculas e minúsculas</li>
            <li>✓ Adicione números e símbolos</li>
            <li>✓ Evite senhas óbvias (datas, nomes, etc.)</li>
            <li>✓ Não reutilize senhas de outras contas</li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
}