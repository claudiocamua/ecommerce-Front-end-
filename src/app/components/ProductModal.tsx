"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  XMarkIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

interface ProductModalProps {
  product: {
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
  };
  isOpen: boolean;
  onClose: () => void;
  getImageUrl: (url: string) => string | null;
  onAddToCart: (productId: string, quantity: number) => Promise<void>;
}

export default function ProductModal({
  product,
  isOpen,
  onClose,
  getImageUrl,
  onAddToCart,
}: ProductModalProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [adding, setAdding] = useState(false);

  if (!isOpen) return null;

  const discountValue =
    product.discount_percentage || product.discount || 0;

  const finalPrice =
    discountValue > 0
      ? product.price * (1 - discountValue / 100)
      : product.price;

  const handleAddToCart = async () => {
    try {
      setAdding(true);
      await onAddToCart(product.id, quantity);
      toast.success(`${quantity}x ${product.name} adicionado!`);
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Erro ao adicionar");
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (product.stock === 0) {
      toast.error("Produto sem estoque");
      return;
    }

    try {
      setAdding(true);
      await onAddToCart(product.id, quantity);
      onClose();
      router.push("/cart");
    } catch (error: any) {
      toast.error(error.message || "Erro ao comprar");
      setAdding(false);
    }
  };

  const nextImage = () => {
    setSelectedImage(
      (prev) => (prev + 1) % product.image_urls.length
    );
  };

  const prevImage = () => {
    setSelectedImage(
      (prev) =>
        (prev - 1 + product.image_urls.length) %
        product.image_urls.length
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center 
      justify-center p-2 md:p-4 bg-black/70 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-black 
        rounded-t-2xl md:rounded-xl 
        max-w-4xl w-full 
        h-[92vh] md:h-auto 
        md:max-h-[85vh] 
        overflow-hidden shadow-2xl 
        animate-slideUp border border-yellow-400/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-gray-900 flex justify-end p-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-600 rounded-full transition text-gray-400 hover:text-white"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 md:p-6 overflow-y-auto max-h-[85vh]">
          {/* IMAGENS */}
          <div>
            <div className="aspect-square md:aspect-[4/5] bg-gray-900 rounded-lg mb-3 relative overflow-hidden border border-gray-700">
              {product.image_urls?.[selectedImage] ? (
                <img
                  src={
                    getImageUrl(
                      product.image_urls[selectedImage]
                    ) || ""
                  }
                  alt={product.name}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Sem imagem
                </div>
              )}

              {product.image_urls.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 
                    -translate-y-1/2 bg-black/60 p-2 
                    rounded-full text-white"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>

                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 
                    -translate-y-1/2 bg-black/60 p-2 
                    rounded-full text-white"
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </>
              )}

              {discountValue > 0 && (
                <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  -{discountValue.toFixed(0)}%
                </div>
              )}
            </div>

            {/* MINIATURAS */}
            {product.image_urls.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.image_urls.map((img, index) => (
                  <div
                    key={img}
                    onClick={() =>
                      setSelectedImage(index)
                    }
                    className={`aspect-square rounded overflow-hidden cursor-pointer border-2 ${
                      selectedImage === index
                        ? "border-yellow-400 scale-105"
                        : "border-gray-700"
                    }`}
                  >
                    <img
                      src={getImageUrl(img) || ""}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* INFO */}
          <div className="flex flex-col">
            <span className="inline-block mb-2 bg-yellow-400/20 text-yellow-400 text-xs font-semibold px-3 py-1 rounded-full">
              {product.category}
            </span>

            <h1 className="text-xl md:text-2xl font-bold text-white mb-2">
              {product.name}
            </h1>

            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              {product.description}
            </p>

            {/* PREÇO */}
            <div className="mb-4 pb-4 border-b border-gray-700">
              {discountValue > 0 ? (
                <>
                  <p className="text-xs line-through text-gray-500">
                    R$ {product.price.toFixed(2)}
                  </p>

                  <p className="text-3xl font-bold text-green-400">
                    R$ {finalPrice.toFixed(2)}
                  </p>
                </>
              ) : (
                <p className="text-3xl font-bold text-yellow-400">
                  R$ {product.price.toFixed(2)}
                </p>
              )}
            </div>

            {/* ESTOQUE */}
            <div className="mb-4">
              {product.stock > 0 ? (
                <p className="bg-green-600 text-white px-3 py-2 rounded text-sm">
                  {product.stock} disponíveis
                </p>
              ) : (
                <p className="bg-red-600 text-white px-3 py-2 rounded text-sm">
                  Produto esgotado
                </p>
              )}
            </div>

            {/* QUANTIDADE */}
            {product.stock > 0 && (
              <div className="mb-4">
                <label className="text-xs text-gray-400">
                  Quantidade
                </label>

                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() =>
                      setQuantity(Math.max(1, quantity - 1))
                    }
                    className="w-10 h-10 border rounded text-white"
                  >
                    -
                  </button>

                  <input
                    type="number"
                    min={1}
                    max={product.stock}
                    value={quantity}
                    className="w-16 text-center bg-gray-800 text-white border rounded"
                    onChange={(e) =>
                      setQuantity(
                        Math.min(
                          product.stock,
                          Math.max(
                            1,
                            Number(e.target.value)
                          )
                        )
                      )
                    }
                  />

                  <button
                    onClick={() =>
                      setQuantity(
                        Math.min(
                          product.stock,
                          quantity + 1
                        )
                      )
                    }
                    className="w-10 h-10 border rounded text-white"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* BOTÕES */}
            <div className="space-y-2 sticky bottom-0 bg-gray-900 py-3">
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="w-full min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center gap-2"
              >
                {adding ? "Adicionando..." : (
                  <>
                    <ShoppingCartIcon className="w-5 h-5" />
                    Adicionar
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={adding}
                className="w-full min-h-[48px] bg-green-600 hover:bg-green-700 text-white rounded flex items-center justify-center gap-2"
              >
                <CreditCardIcon className="w-5 h-5" />
                Comprar agora
              </button>
            </div>

            {product.brand && (
              <p className="text-xs text-gray-400 mt-4">
                <strong>Marca:</strong> {product.brand}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
