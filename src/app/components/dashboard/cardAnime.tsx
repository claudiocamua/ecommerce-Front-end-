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
  stock: number;
  category: string;
  brand: string;
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
  maxProducts = 4,
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

  const handleAddToCart = async (productId: string, quantity: number) => {
    try {
      await cartService.addItem(productId, quantity);
      toast.success(`${quantity}x produto adicionado ao carrinho!`);
    } catch (error: any) {
      toast.error(error.detail || "Erro ao adicionar ao carrinho");
    }
  };

  if (!products || filteredProducts.length === 0) {
    return null;
  }

  return (
    <div
      ref={cardRef}
      className={`
        transition-all duration-700 ease-out
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
      `}
    >
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-4">
          <h3 className="text-xl font-bold text-gray-900 text-center">
            {category}
          </h3>
        </div>

        <div className="p-4 grid grid-cols-2 gap-3">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group cursor-pointer"
              onClick={() => openProductModal(product)}
            >
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2 relative">
                {product.image_urls?.[0] ? (
                  <img
                    src={getImageUrl(product.image_urls[0]) || ""}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.onerror = null;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        product.name
                      )}&size=200&background=f59e0b&color=1f2937&bold=true`;
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    📷 Sem imagem
                  </div>
                )}

                {product.discount && product.discount > 0 && (
                  <div className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                    -{(product.discount * 100).toFixed(0)}%
                  </div>
                )}
              </div>

              <div className="text-center">
                <p className="text-sm font-semibold text-gray-900 line-clamp-1 mb-1">
                  {product.name}
                </p>
                <div className="flex flex-col items-center gap-1">
                  {product.discount && product.discount > 0 ? (
                    <>
                      <p key="old-price" className="text-xs text-gray-400 line-through">
                        R$ {product.price.toFixed(2)}
                      </p>
                      <p key="new-price" className="text-sm font-bold text-green-600">
                        R$ {(product.price * (1 - product.discount)).toFixed(2)}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm font-bold text-gray-900">
                      R$ {product.price.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/dashboard/products?category=${encodeURIComponent(category)}`);
            }}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors"
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