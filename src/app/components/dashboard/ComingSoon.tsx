"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Target,
  BarChart3,
  Gift,
  Pin,
  X,
} from "lucide-react";

export default function ComingSoon() {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detecta mobile corretamente
  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");

    const update = () => setIsMobile(media.matches);
    update();

    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const features = [
    {
      icon: Target,
      title: "Produtos em Destaque",
      description: "Veja os produtos mais populares",
      href: "/dashboard/destaques",
      gradient: "from-blue-500 via-cyan-500 to-blue-600",
    },
    {
      icon: BarChart3,
      title: "Estatísticas",
      description: "Acompanhe suas compras",
      href: "/dashboard/estatisticas",
      gradient: "from-green-500 via-emerald-500 to-green-600",
    },
    {
      icon: Gift,
      title: "Ofertas Exclusivas",
      description: "Promoções especiais para você",
      href: "/dashboard/ofertas",
      gradient: "from-pink-500 via-fuchsia-500 to-pink-600",
    },
  ];

  // Fecha sidebar automaticamente no mobile
  const handleLinkClick = () => {
    if (isMobile) {
      setOpen(false);
    }
  };

  return (
    <>
      {/* BOTÃO — APENAS MOBILE */}
      {isMobile && (
        <button
          onClick={() => setOpen(!open)}
          className="
            fixed
            top-20
            right-4
            z-50
            bg-primario
            text-white
            p-3
            rounded-full
            shadow-lg
            transition-all
            hover:scale-110
            active:scale-95
          "
        >
          {open ? <X size={22} /> : <Pin size={22} />}
        </button>
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed
          top-40
          right-0
          h-[calc(38vh-4rem)]
          w-35
          bg-cartao
          border-borda
          shadow-lg
          p-6
          z-40

          transform
          transition-transform
          duration-300
          ease-in-out

          ${
            isMobile
              ? open
                ? "translate-x-0"
                : "translate-x-full"
              : "translate-x-0"
          }
        `}
      >
        <h2 className="text-xl font-bold text-texto mb-6 text-center">
          Em Breve...
        </h2>

        <div className="space-y-4 overflow-y-auto h-full pr-1">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Link
                key={feature.title}
                href={feature.href}
                onClick={handleLinkClick}
                className="
                  group
                  relative
                  block
                  rounded-xl
                  p-[2px]
                  transition-all
                "
              >
                {/* GRADIENTE ANIMADO */}
                <div
                  className={`
                    absolute
                    inset-0
                    rounded-xl
                    bg-gradient-to-r
                    ${feature.gradient}
                    opacity-0
                    blur
                    transition-opacity
                    duration-300
                    group-hover:opacity-100
                    animate-gradient
                  `}
                />

                {/* CARD */}
                <div
                  className="
                    relative
                    z-10
                    bg-cartao
                    border-dashed
                    border-borda
                    rounded-xl
                    p-5
                    text-center
                    cursor-pointer
                    transition-all
                    duration-300
                    ease-out

                    hover:border-transparent
                    hover:-translate-y-1
                  "
                >
                  <div
                    className="
                      flex
                      justify-center
                      mb-3
                      text-texto

                      transition-transform
                      duration-300
                      group-hover:scale-125
                    "
                  >
                    <Icon size={32} strokeWidth={1.8} />
                  </div>

                  <h3 className="font-semibold text-texto mb-1">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-neutro-frente">
                    {feature.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
}
