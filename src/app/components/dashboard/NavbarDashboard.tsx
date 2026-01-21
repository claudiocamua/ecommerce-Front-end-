"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { authService } from "@/app/services/auth";
import WelcomeHeader from "./WelcomeHeader";

import {
  Menu,
  X,
  Home,
  ShoppingBag,
  ShoppingCart,
  Package,
  User,
  LogOut,
  ChevronDown,
  Shield,
} from "lucide-react";

interface UserProps {
  is_admin?: boolean;
  full_name: string;
  email: string;
}

interface NavbarDashboardProps {
  user: UserProps | null;
}

export default function NavbarDashboard({ user }: NavbarDashboardProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, [user, router]);

  const handleLogout = () => {
    authService.logout();
    toast.success("Logout realizado com sucesso!");
    router.push("/"); 
  };

  const userName = user?.full_name || user?.email || "Usuário";
  const userInitial = userName.charAt(0).toUpperCase();
  const userFirstName = userName.split(" ")[0];
  const isAdmin = user?.is_admin === true;

  console.log("🔍 [NAVBAR] Dados completos do user:", user);
  console.log("🔍 [NAVBAR] user.is_admin:", user?.is_admin);
  console.log("🔍 [NAVBAR] Tipo de is_admin:", typeof user?.is_admin);
  console.log("🔍 [NAVBAR] isAdmin calculado:", isAdmin);

  if (!isMounted) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cartao border-b border-borda shadow-md">
        <div className="container-custom">
          <div className="flex justify-between items-center h-16">
            <div className="text-2xl font-bold text-primario">MinhaLoja.</div>
            <div className="w-6 h-6 animate-pulse bg-gray-200 rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  if (!user) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cartao border-b border-borda shadow-md">
        <div className="container-custom">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-primario" prefetch={false}>
              MinhaLoja.
            </Link>
            <div className="flex gap-4">
              <Link href="/" className="px-4 py-2 text-sm font-medium text-texto hover:text-primario" prefetch={false}>
                Entrar
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cartao border-b border-borda shadow-md">
        <div className="container-custom">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2" prefetch={false}>
              <span className="text-2xl font-bold text-primario">
                MinhaLoja.
              </span>
            </Link>
            <WelcomeHeader userName={userName} />

            <div className="hidden md:flex items-center gap-6">
              <Link href="/profile" className="nav-link flex items-center gap-2" prefetch={false}>
                <User size={20} /> Meu Perfil
              </Link>
              <Link href="/dashboard/products" className="nav-link flex items-center gap-2" prefetch={false}>
                <ShoppingBag size={20} /> Produtos
              </Link>
              <Link href="/cart" className="nav-link flex items-center gap-2" prefetch={false}>
                <ShoppingCart size={20} /> Carrinho
              </Link>
              <Link href="/dashboard/orders" className="nav-link flex items-center gap-2" prefetch={false}>
                <Package size={20} /> Pedidos
              </Link>
              
              {isAdmin && (
                <Link 
                  href="/admin" 
                  className="nav-link flex items-center gap-2 text-yellow-400 hover:text-yellow-500 font-bold"
                  prefetch={false}
                  onClick={() => console.log(" Clicou em Admin - isAdmin:", isAdmin)}
                >
                  <Shield size={20} /> Admin
                </Link>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:block relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primario/10 hover:bg-primario/20 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primario text-white flex items-center justify-center font-semibold">
                    {userInitial}
                  </div>
                  <span className="hidden lg:inline font-medium text-texto">
                    {userFirstName}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      isProfileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-cartao border border-borda rounded-lg shadow-xl">
                    <div className="px-4 py-3 border-b border-borda">
                      <p className="font-semibold text-texto">
                        {userName}
                      </p>
                      <p className="text-sm text-neutro-frente">
                        {user.email}
                      </p>
                      {isAdmin && (
                        <span className="inline-block mt-2 px-2 py-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded">
                          ADMIN
                        </span>
                      )}
                    </div>

                    <Link
                      href="/profile"
                      className="dropdown-item flex items-center gap-2"
                      prefetch={false}
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User size={16} /> Meu Perfil
                    </Link>

                    <Link
                      href="/dashboard/orders"
                      className="dropdown-item flex items-center gap-2"
                      prefetch={false}
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Package size={16} /> Meus Pedidos
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="dropdown-item flex items-center gap-2 text-yellow-600 border-t border-borda"
                        prefetch={false}
                        onClick={() => {
                          setIsProfileOpen(false);
                          console.log(" Clicou em Admin (dropdown) - isAdmin:", isAdmin);
                        }}
                      >
                        <Shield size={16} /> Administração
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="dropdown-item flex items-center gap-2 text-red-600 border-t border-borda w-full text-left"
                    >
                      <LogOut size={16} /> Sair
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-primario/10 transition-colors"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)} />
          <div className="fixed top-16 right-0 left-0 bg-cartao border-b border-borda shadow-lg p-6 flex flex-col gap-4">
            <Link href="/dashboard/products" className="mobile-link flex items-center gap-2" prefetch={false} onClick={() => setIsMenuOpen(false)}>
              <ShoppingBag size={20} /> Produtos
            </Link>
            <Link href="/cart" className="mobile-link flex items-center gap-2" prefetch={false} onClick={() => setIsMenuOpen(false)}>
              <ShoppingCart size={20} /> Carrinho
            </Link>
            <Link href="/dashboard/orders" className="mobile-link flex items-center gap-2" prefetch={false} onClick={() => setIsMenuOpen(false)}>
              <Package size={20} /> Pedidos
            </Link>
            <Link href="/profile" className="mobile-link flex items-center gap-2" prefetch={false} onClick={() => setIsMenuOpen(false)}>
              <User size={20} /> Meu Perfil
            </Link>
            
            {isAdmin && (
              <Link
                href="/admin"
                className="mobile-link flex items-center gap-2 text-yellow-500 font-bold border-t border-borda pt-4"
                prefetch={false}
                onClick={() => setIsMenuOpen(false)}
              >
                <Shield size={20} /> Administração
              </Link>
            )}
            
            <button
              onClick={handleLogout}
              className="mobile-link flex items-center gap-2 text-red-600 border-t border-borda pt-4 mt-2 w-full text-left"
            >
              <LogOut size={20} /> Sair
            </button>
          </div>
        </div>
      )}

      <div className="h-16" />
    </>
  );
}
