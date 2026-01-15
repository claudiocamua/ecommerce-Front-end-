"use client";

import Navbar from "./components/layout/navbar";
import HeroSection from "./components/layout/HeroSection";
import { useState } from "react";
import ModalAuth from "./components/auth/ModalAuth";
import Footer from "./components/layout/Footer";

export default function Home() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authType, setAuthType] = useState<"login" | "register">("login");

  function openAuthModal(type: "login" | "register") {
    setAuthType(type);
    setAuthOpen(true);
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* ✅ BACKGROUND IMAGE FIXO */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/image-fundo-1.jpg')" }}
      />
      {/* Overlay escuro */}
      <div className="fixed inset-0 -z-10 bg-black/40" />

      <div className="relative z-10 flex-1 overflow-y-auto">
        <Navbar setAuthOpen={setAuthOpen} setAuthType={setAuthType} />
        
        <div className="flex-1 overflow-y-auto">
          <HeroSection openAuthModal={openAuthModal} />

          {/* Seção de Benefícios */}
          <section className="w-full bg-black/50 border-borda py-16">
            <div className="container-custom">
              <h2 className="text-3xl md:text-4xl font-bold text-yellow-400 text-center mb-12">
                Por que comprar conosco?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-yellow-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-xl mb-2">
                      Entrega Rápida
                    </h3>
                    <p className="text-white/80">
                      Frete grátis para compras acima de R$ 200
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-yellow-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-xl mb-2">
                      Compra Segura
                    </h3>
                    <p className="text-white/80">
                      Seus dados sempre protegidos
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-yellow-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-xl mb-2">
                      Troca Fácil
                    </h3>
                    <p className="text-white/80">
                      30 dias para trocar ou devolver
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Seção de Avaliações */}
          <section className="w-full bg-black/50 py-16 border-borda">
            <div className="container-custom">
              <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
                O que nossos clientes dizem
              </h2>
              
              <div className="max-w-3xl mx-auto">
                <div className="flex justify-center gap-2 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-8 h-8 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <blockquote className="text-center">
                  <p className="text-xl md:text-2xl text-white mb-6 italic">
                    "Excelente experiência de compra! Produtos de qualidade e
                    entrega super rápida. Recomendo demais!"
                  </p>
                  <footer className="text-white/90 font-semibold">
                    — Maria S., Cliente satisfeita
                  </footer>
                </blockquote>
              </div>
            </div>
          </section>

          {/* Seção de Redes Sociais */}
          <section className="w-full bg-black/50 py-16 border-borda">
            <div className="container-custom">
              <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
                Fique por dentro das novidades
              </h2>

              <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-32 h-32 border-2 border-yellow-400 rounded-lg p-4 flex items-center justify-center bg-white">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://wa.me/55"
                      alt="QR Code WhatsApp"
                      className="w-full h-full"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-white text-lg mb-1">WhatsApp</h3>
                    <p className="text-sm text-white/80">
                      Escaneie para falar conosco
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                  <a
                    href="https://instagram.com/seuusuario"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-32 h-32 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-lg flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
                  >
                    <svg
                      className="w-16 h-16 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  <div className="text-center">
                    <h3 className="font-semibold text-white text-lg mb-1">Instagram</h3>
                    <p className="text-sm text-white/80">@seuusuario</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Footer />
        </div>

        <ModalAuth
          open={authOpen}
          type={authType}
          onClose={() => setAuthOpen(false)}
        />
      </div>
    </div>
  );
}
