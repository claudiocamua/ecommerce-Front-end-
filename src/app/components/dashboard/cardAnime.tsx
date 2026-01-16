"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cartService } from "@/app/services/cart";
import { toast } from "react-hot-toast";
import ProductModal from "@/app/components/ProductModal";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount?: number;
  discount_percentage?: number;
  stock: number;
  category: string;
  brand?: string;
  image_urls: string[];
  created_at: string;
}

interface CardAnimeProps {
  products: Product[];
  category: string;
  maxProducts?: number;
  animationDelay?: number;
  animationType?: number;
}

export default function CardAnime({
  products,
  category,
  maxProducts = 2,
  animationDelay = 0,
  animationType = 5,
}: CardAnimeProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getImageUrl = (imageUrl: string): string | null => {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    if (!imageUrl) return null;

    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }

    if (imageUrl.startsWith("/")) {
      return `${baseURL}${imageUrl}`;
    }

    return `${baseURL}/${imageUrl}`;
  };

  const filteredProducts = Array.isArray(products)
    ? products
        .filter((product) => product.category === category)
        .slice(0, maxProducts)
    : [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setIsVisible(true);
            }, animationDelay * 1000);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [animationDelay]);

  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeProductModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 200);
  };

  // ✅ CORRIGIDO: usar addToCart em vez de addItem
  const handleAddToCart = async (productId: string, quantity: number) => {
    try {
      console.log("🛒 Adicionando ao carrinho:", { productId, quantity });
      await cartService.addToCart(productId, quantity);
      toast.success(`${quantity}x produto adicionado ao carrinho!`, {
        icon: "🛒",
        duration: 2000,
      });
    } catch (error: any) {
      console.error("❌ Erro ao adicionar:", error);
      toast.error(error.message || error.detail || "Erro ao adicionar ao carrinho");
    }
  };

  if (!products || filteredProducts.length === 0) {
    return null;
  }

  const getDiscountedPrice = (product: Product) => {
    const discountValue = product.discount_percentage || product.discount || 0;
    if (discountValue > 0) {
      return product.price * (1 - discountValue / 100);
    }
    return product.price;
  };

  return (
    <div
      ref={cardRef}
      className={`
        transition-all duration-700 ease-out
        ${isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-95"}
      `}
    >
      {/* ✅ CARD COMPACTO COM 2 PRODUTOS */}
      <div className="bg-gradient-to-br from-white/95 via-white/90 to-white/85 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-300 border border-yellow-400/30">
        {/* Header do Card */}
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 p-3">
          <h3 className="text-lg font-bold text-gray-900 text-center tracking-tight">
            {category}
          </h3>
        </div>

        {/* Grid de 2 Produtos */}
        <div className="p-3 grid grid-cols-2 gap-2">
          {filteredProducts.map((product) => {
            const discountValue = product.discount_percentage || product.discount || 0;
            const finalPrice = getDiscountedPrice(product);

            return (
              <div
                key={product.id}
                className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                onClick={() => openProductModal(product)}
              >
                {/* Imagem do Produto */}
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2 relative shadow-md">
                  {product.image_urls?.[0] ? (
                    <img
                      src={getImageUrl(product.image_urls[0]) || ""}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.onerror = null;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          product.name
                        )}&size=200&background=f59e0b&color=1f2937&bold=true`;
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                      📷
                    </div>
                  )}

                  {/* Badge de Desconto */}
                  {discountValue > 0 && (
                    <div className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-lg animate-pulse">
                      -{discountValue.toFixed(0)}%
                    </div>
                  )}

                  {/* Overlay no Hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                </div>

                {/* Info do Produto */}
                <div className="text-center px-1">
                  <p className="text-xs font-semibold text-gray-900 line-clamp-1 mb-1 group-hover:text-yellow-600 transition-colors">
                    {product.name}
                  </p>
                  <div className="flex flex-col items-center gap-0.5">
                    {discountValue > 0 ? (
                      <>
                        <p className="text-[10px] text-gray-400 line-through">
                          R$ {product.price.toFixed(2)}
                        </p>
                        <p className="text-xs font-bold text-green-600">
                          R$ {finalPrice.toFixed(2)}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs font-bold text-gray-900">
                        R$ {product.price.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Botão Ver Todos */}
        <div className="p-3 pt-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/dashboard/products?categoria=${encodeURIComponent(category)}`);
            }}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-semibold py-2 px-3 rounded-lg transition-all duration-300 text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Ver todos em {category}
          </button>
        </div>
      </div>

      {/* Modal do Produto */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={closeProductModal}
          getImageUrl={getImageUrl}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
}