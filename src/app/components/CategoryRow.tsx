"use client";

import { useState } from "react";
import { ShoppingCartIcon, CubeIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { useLazyCategory } from "../hooks/useLazyCategory";
import SkeletonHorizontal from "./SkeletonHorizontal";
import ProductModal from "./ProductModal";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  brand: string;
  discount: number;
  image_urls: string[];
  created_at: string;
}

interface CategoryRowProps {
  category: string;
  products: Product[];
  getImageUrl: (url: string) => string | null;
  onAddToCart: (e: React.MouseEvent, productId: string) => void;
  onProductClick?: (product: Product) => void;
}

export default function CategoryRow({ 
  category, 
  products, 
  getImageUrl, 
  onAddToCart, 
  onProductClick 
}: CategoryRowProps) {
  const { ref, visible } = useLazyCategory();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleProductClick = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedProduct(product);
    onProductClick?.(product);
  };

  const handleAddToCartFromModal = async (productId: string, quantity: number) => {
    // Criar evento sintético
    const syntheticEvent = {
      preventDefault: () => {},
      stopPropagation: () => {},
    } as React.MouseEvent;
    
    // Chamar onAddToCart com a quantidade correta
    onAddToCart(syntheticEvent, productId);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  return (
    <>
      <section ref={ref} className="mb-8">
        <h2 className="text-xl font-bold mb-3 text-yellow-400">{category}</h2>

        {visible ? (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-yellow-400 scrollbar-track-gray-700">
            {products.map((product) => {
              const finalPrice = product.price * (1 - (product.discount || 0));
              const imageUrl = getImageUrl(product.image_urls?.[0]);

              return (
                <div
                  key={product.id}
                  onClick={(e) => handleProductClick(e, product)}
                  className="w-[220px] flex-shrink-0 bg-gray-800 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-all overflow-hidden cursor-pointer group"
                >
                  <div className="aspect-square bg-gray-200 relative">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <CubeIcon className="w-12 h-12" />
                      </div>
                    )}

                    {product.discount > 0 && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                        -{(product.discount * 100).toFixed(0)}%
                      </div>
                    )}

                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">Esgotado</span>
                      </div>
                    )}

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-bold text-sm bg-yellow-500 px-4 py-2 rounded-lg">
                        Ver Detalhes
                      </span>
                    </div>
                  </div>

                  <div className="p-3">
                    <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wide">
                      {product.category}
                    </p>
                    <h3 className="font-bold text-sm mb-1 line-clamp-2 leading-tight h-10 text-white">
                      {product.name}
                    </h3>

                    <div className="mb-2">
                      {product.discount > 0 ? (
                        <>
                          <p className="text-xs text-gray-400 line-through">
                            R$ {product.price.toFixed(2)}
                          </p>
                          <p className="text-lg font-bold text-green-400">
                            R$ {finalPrice.toFixed(2)}
                          </p>
                        </>
                      ) : (
                        <p className="text-lg font-bold text-blue-400">
                          R$ {product.price.toFixed(2)}
                        </p>
                      )}
                    </div>

                    <p className="text-[10px] text-gray-400 flex items-center gap-1">
                      {product.stock > 0 ? (
                        <>
                          <CheckCircleIcon className="w-3 h-3 text-green-500" />
                          <span className="text-green-500">{product.stock} disponíveis</span>
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="w-3 h-3 text-red-500" />
                          <span className="text-red-500">Indisponível</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <SkeletonHorizontal />
        )}
      </section>

      {/* Modal de Produto */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={handleCloseModal}
          getImageUrl={getImageUrl}
          onAddToCart={handleAddToCartFromModal}
        />
      )}
    </>
  );
}
