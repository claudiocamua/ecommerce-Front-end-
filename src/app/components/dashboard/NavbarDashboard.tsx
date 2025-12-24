"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { authService } from "@/services/auth";
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
} from "lucide-react";

interface UserProps {
  full_name: string;
  email: string;
}

interface NavbarDashboardProps {
  user: UserProps;
}

export default function NavbarDashboard({ user }: NavbarDashboardProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    toast.success("Logout realizado com sucesso!");
    router.push("/");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cartao border-b border-borda shadow-md">
        <div className="container-custom">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primario">
                MinhaLoja.
              </span>
            </Link>
            <WelcomeHeader userName={user.full_name} />

            <div className="hidden md:flex items-center gap-6">
              <Link href="/profile" className="nav-link flex items-center gap-2">
                <User size={25} /> Meu Perfil
              </Link>
              <Link href="/products" className="nav-link flex items-center gap-2">
                <ShoppingBag size={25} /> Produtos
              </Link>
              <Link href="/cart" className="nav-link flex items-center gap-2">
                <ShoppingCart size={25} /> Carrinho
              </Link>
              <Link href="/orders" className="nav-link flex items-center gap-2">
                <Package size={25} /> Pedidos
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:block relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primario/10 hover:bg-primario/20 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primario text-white flex items-center justify-center font-semibold">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:inline font-medium text-texto">
                    {user.full_name.split(" ")[0]}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      isProfileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-74   border-borda rounded-lg shadow-xl">
                    <div className="px-4 py-3 border-b border-borda">
                      <p className="font-semibold text-texto">
                        {user.full_name}
                      </p>
                      <p className="text-sm text-neutro-frente">
                        {user.email}
                      </p>
                    </div>

                    <Link
                      href="/profile"
                      className="dropdown-item flex items-center gap-2"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User size={16} /> Meu Perfil
                    </Link>

                    <Link
                      href="/orders"
                      className="dropdown-item flex items-center gap-2"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Package size={16} /> Meus Pedidos
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="dropdown-item flex items-center gap-2 text-red-600 border-t border-borda"
                    >
                      <LogOut size={16} /> Sair
                    </button>
                  </div>
                )}
              </div>

             
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="only-mobile p-2 rounded-lg hover:bg-primario/10 transition-colors"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {isMenuOpen && (
        <div
          className={`
            fixed z-50 left-1/2 top-1/4
            transform -translate-x-1/6 -translate-y-1/2
            bg-white  border-borda shadow-lg
            rounded-xl w-0 max-w-xs
            p-6 flex flex-col gap-4
            transition-all duration-300
          `}
        >
          <Link href="/products" className="mobile-link flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
            <ShoppingBag size={25} /> Produtos
          </Link>
          <Link href="/cart" className="mobile-link flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
            <ShoppingCart size={25} /> Carrinho
          </Link>
          <Link href="/orders" className="mobile-link flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
            <Package size={25} /> Pedidos
          </Link>
          <Link href="/profile" className="mobile-link flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
            <User size={25} /> Meu Perfil
          </Link>
          <button
            onClick={handleLogout}
            className="mobile-link flex items-center gap-2 text-red-600 border-t border-borda pt-4 mt-2"
          >
            <LogOut size={25} /> Sair
          </button>
        </div>
      )}

      <div className="h-20" />
    </>
  );
}
