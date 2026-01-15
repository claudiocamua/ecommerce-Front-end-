"use client";

import Button from "../ui/Button";
import { useEffect, useState } from "react";

interface HeroProps {
    openAuthModal: (type: "login" | "register") => void;
}

export default function HeroSection({ openAuthModal }: HeroProps) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setIsMobile(window.innerWidth < 768);
        }
    }, []);

    return (
        <section className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center px-6 bg-grad-background-branco">
            <p className=" text-white text-lg md:text-xl text-neutro-frente max-w-2xl mb-8">
                Novidades chegando toda semana
            </p>
            <h1 className="font-display text-white text-4xl md:text-6xl font-bold text-texto mb-4">
                Descubra produtos <span className="text-primario">incríveis para você</span>
            </h1>

            <p className="text-lg md:text-xl text-white text-neutro-frente max-w-2xl mb-8">
                Explore nossa coleção exclusiva com os melhores preços e qualidade garantida. Entrega rápida para todo o Brasil.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
               

                <Button
                    className="botao--contorno"
                    onClick={() => (window.location.href = "/products")}
                >
                    Ver Produtos
                </Button>
            </div>
        </section>
    );
}
