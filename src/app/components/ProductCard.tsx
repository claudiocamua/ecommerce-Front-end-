"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { cartService } from "../services/cart";
import { toast } from "react-hot-toast";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    original_price?: number;
    discount?: number;
    image_urls?: string[];
    category?: string;
    stock: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock <= 0) {
      toast.error("Produto sem estoque");
      return;
    }

    setAdding(true);
    try {
      await cartService.addToCart(product.id, 1);
      toast.success("Produto adicionado ao carrinho!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao adicionar ao carrinho");
    } finally {
      setAdding(false);
    }
  };

  // ✅ USAR image_urls[0] ao invés de image
  const imageUrl = product.image_urls?.[0] || "/placeholder-product.png";

  console.log("🖼️ ProductCard - URL da imagem:", {
    productId: product.id,
    productName: product.name,
    imageUrl,
    allUrls: product.image_urls
  });

  return (
    <Link href={`/products/${product.id}`}>
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden hover:bg-gray-800/70 transition-all hover:scale-105 group relative">
        {product.discount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold z-10">
            -{product.discount}%
          </div>
        )}

        <div className="relative h-48 bg-gray-900/50">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              console.error("❌ ProductCard - Erro ao carregar:", {
                productId: product.id,
                imageUrl,
              });
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder-product.png";
            }}
          />
        </div>

        <div className="p-4">
          {product.category && (
            <p className="text-xs text-blue-400 uppercase mb-2">
              {product.category}
            </p>
          )}

          <h3 className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-yellow-400 font-bold text-xl">
              R$ {product.price.toFixed(2)}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-gray-500 line-through text-sm">
                R$ {product.original_price.toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={adding || product.stock <= 0}
            className={`w-full py-2 rounded-lg font-semibold transition-colors ${
              product.stock <= 0
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            } disabled:opacity-50`}
          >
            {adding ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Adicionando...
              </span>
            ) : product.stock <= 0 ? (
              "Sem Estoque"
            ) : (
              "🛒 Adicionar"
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}