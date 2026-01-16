"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // ✅ ADICIONAR
import { XMarkIcon, ShoppingCartIcon, CreditCardIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast"; // ✅ ADICIONAR

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  brand?: string; // ✅ OPCIONAL
  discount?: number; // ✅ OPCIONAL
  discount_percentage?: number; // ✅ ADICIONADO
  image_urls: string[];
  created_at: string;
}

interface ProductModalProps {
  product: {
    id: string; // ✅ Certifique-se de que existe
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
  onAddToCart: (productId: string, quantity: number) => Promise<void>; // ✅ Correto
}

export default function ProductModal({ product, isOpen, onClose, getImageUrl, onAddToCart }: ProductModalProps) {
  const router = useRouter(); // ✅ ADICIONAR
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [adding, setAdding] = useState(false); // ✅ ADICIONAR

  if (!isOpen) return null;

  // ✅ CORRIGIDO: Usar discount_percentage
  const discountValue = product.discount_percentage || product.discount || 0;
  const finalPrice = discountValue > 0
    ? product.price * (1 - discountValue / 100)
    : product.price;

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      setAdding(true);
      await onAddToCart(product.id, quantity); // ✅ CERTIFIQUE-SE DE USAR product.id
      toast.success(`${quantity}x ${product.name} adicionado ao carrinho!`);
      onClose();
    } catch (error: any) {
      console.error("❌ Erro no modal:", error);
      toast.error(error.message || "Erro ao adicionar ao carrinho");
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (product.stock === 0) {
      toast.error("Produto sem estoque");
      return;
    }

    setAdding(true);
    try {
      await onAddToCart(product.id, quantity);
      toast.success("Produto adicionado! Redirecionando...");
      onClose();
      router.push("/cart");
    } catch (error: any) {
      toast.error(error.message || "Erro ao adicionar ao carrinho");
      setAdding(false);
    }
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % product.image_urls.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + product.image_urls.length) % product.image_urls.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fadeIn" onClick={onClose}>
      <div
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-xl max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-slideUp border border-yellow-400/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão Fechar */}
        <div className="sticky top-0 bg-gradient-to-b from-gray-900 to-transparent z-10 flex justify-end p-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-600 rounded-full transition text-gray-400 hover:text-white"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 p-6 pt-0">
          {/* Galeria de Imagens */}
          <div>
            <div className="aspect-square bg-gray-900 rounded-lg mb-3 relative overflow-hidden border border-gray-700">
              {product.image_urls?.[selectedImage] ? (
                <img
                  src={getImageUrl(product.image_urls[selectedImage]) || ""}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 font-semibold">
                  Sem imagem
                </div>
              )}

              {product.image_urls?.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 p-2 rounded-full shadow-lg transition text-white"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 p-2 rounded-full shadow-lg transition text-white"
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </>
              )}

              {discountValue > 0 && (
                <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  -{discountValue.toFixed(0)}% OFF
                </div>
              )}
            </div>

            {/* Miniaturas */}
            {product.image_urls && product.image_urls.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.image_urls.slice(0, 4).map((img, index) => (
                  <div
                    key={img}  // ✅ USAR URL DA IMAGEM COMO KEY ÚNICA
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-gray-800 rounded cursor-pointer overflow-hidden border-2 transition ${
                      selectedImage === index ? "border-yellow-400 scale-105" : "border-gray-700 hover:border-gray-600"
                    }`}
                  >
                    <img
                      src={getImageUrl(img) || ""}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Informações do Produto */}
          <div className="flex flex-col">
            <div className="mb-2">
              <span className="inline-block bg-yellow-400/20 text-yellow-400 text-xs font-semibold px-3 py-1 rounded-full border border-yellow-400/30">
                {product.category}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-white mb-3">
              {product.name}
            </h1>

            <p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-3">
              {product.description}
            </p>

            {/* Preço */}
            <div className="mb-4 pb-4 border-b border-gray-700">
              {discountValue > 0 ? (
                <>
                  <p className="text-xs text-gray-500 line-through mb-1">
                    R$ {product.price.toFixed(2)}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-green-400">
                      R$ {finalPrice.toFixed(2)}
                    </p>
                    <span className="text-xs text-gray-400 font-semibold">
                      Economize R$ {(product.price - finalPrice).toFixed(2)}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-3xl font-bold text-yellow-400">
                  R$ {product.price.toFixed(2)}
                </p>
              )}
            </div>

            {/* Estoque */}
            <div className="mb-4">
              {product.stock > 0 ? (
                <div className="flex items-center gap-2 text-white bg-green-600/90 px-3 py-2 rounded-lg text-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">
                    {product.stock} {product.stock === 1 ? "unidade disponível" : "unidades disponíveis"}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-white bg-red-600/90 px-3 py-2 rounded-lg text-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">Produto esgotado</span>
                </div>
              )}
            </div>

            {/* Quantidade */}
            {product.stock > 0 && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-400 mb-2">
                  Quantidade
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 flex items-center justify-center border border-gray-600 rounded-lg hover:bg-gray-700 font-bold text-white transition"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.min(product.stock, Math.max(1, parseInt(e.target.value) || 1)))
                    }
                    className="w-16 text-center border border-gray-600 bg-gray-800 text-white rounded-lg py-2 font-semibold text-sm"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-9 h-9 flex items-center justify-center border border-gray-600 rounded-lg hover:bg-gray-700 font-bold text-white transition"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="space-y-2">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || adding}
                className={`w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition shadow-lg ${
                  product.stock > 0 && !adding
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-700 text-gray-500 cursor-not-allowed"
                }`}
              >
                {adding ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Adicionando...
                  </>
                ) : (
                  <>
                    <ShoppingCartIcon className="w-5 h-5" />
                    Adicionar ao Carrinho
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0 || adding}
                className={`w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition shadow-lg ${
                  product.stock > 0 && !adding
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-700 text-gray-500 cursor-not-allowed"
                }`}
              >
                <CreditCardIcon className="w-5 h-5" />
                Comprar Agora
              </button>
            </div>

            {/* Informações Adicionais */}
            {product.brand && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-xs text-gray-400">
                  <span className="font-semibold">Marca:</span> {product.brand}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}