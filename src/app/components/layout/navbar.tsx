"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Package, User, LogOut } from "lucide-react";
import { cn } from "../../../lib/utils";
import Button from "../ui/Button";
import ModalAuth from "../auth/ModalAuth";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "@/app/services/auth";

export default function Navbar() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authType, setAuthType] = useState<"login" | "register">("login");
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { user, logout } = useAuthStore();

  useEffect(() => {
    const handleOpenAuth = (e: CustomEvent) => {
      setAuthType(e.detail || 'login');
      setAuthOpen(true);
    };

    window.addEventListener('openAuthModal', handleOpenAuth as EventListener);
    
    return () => {
      window.removeEventListener('openAuthModal', handleOpenAuth as EventListener);
    };
  }, []);

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  const navLinks = [
    { href: "/", label: "Início" },
    { href: "/products", label: "Produtos" },
  ];

  function handleLogout() {
    logout();
  }

  function openLogin() {
    setAuthType("login");
    setAuthOpen(true);
  }

  function openRegister() {
    setAuthType("register");
    setAuthOpen(true);
  }

  function closeAuth() {
    setAuthOpen(false);
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md shadow-md border-border">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link
            href="/"
            className="text-4xl font-bold text-primary hover:text-primary transition-colors"
          >
            MinhaLoja<span className="text-gold">.</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-3xl hover:text-foreground font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {!isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Button
                  className="botao--contorno"
                  variant="ghost"
                  onClick={() =>
                    authOpen && authType === "login"
                      ? closeAuth()
                      : openLogin()
                  }
                >
                  {authOpen && authType === "login" ? "Fechar" : "Entrar"}
                </Button>

                <Button
                  className="botao botao--primario"
                  onClick={() =>
                    authOpen && authType === "register"
                      ? closeAuth()
                      : openRegister()
                  }
                >
                  {authOpen && authType === "register"
                    ? "Fechar"
                    : "Cadastrar"}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/orders" className="p-2 hover:text-primary">
                  <Package className="w-6 h-6" />
                </Link>
                <Link href="/profile" className="p-2 hover:text-primary">
                  <User className="w-6 h-6" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:text-destructive"
                >
                  <LogOut className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2">
              {isOpen ? (
                <X className="w-6 h-6 text-gold" />
              ) : (
                <Menu className="w-6 h-6 text-gold" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 border-t border-border bg-background",
          isOpen ? "max-h-96" : "max-h-0"
        )}
      >
        <div className="container-custom py-4 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}

          <hr className="border-border" />

          {!isAuthenticated ? (
            <div className="flex flex-col gap-3">
              <Button onClick={openLogin}>Entrar</Button>
              <Button variant="ghost" onClick={openRegister}>
                Cadastrar
              </Button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="text-destructive font-medium"
            >
              Sair
            </button>
          )}
        </div>
      </div>

      <ModalAuth open={authOpen} type={authType} onClose={closeAuth} />
    </nav>
  );
}
