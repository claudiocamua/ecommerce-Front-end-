"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { productsService } from "@/services/products";
import { cartService } from "@/services/cart";
import { authService } from "@/services/auth";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  brand: string;
  image_urls: string[];
  created_at: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (params.id) {
      loadProduct();
    }
  }, [params.id]);

  const loadProduct = async () => {
    try {
      const data = await productsService.getProductById(params.id as string);
      setProduct(data);
    } catch (error: any) {
      toast.error("Produto não encontrado");
      router.push("/products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!authService.isAuthenticated()) {
      toast.error("Faça login para adicionar ao carrinho");
      router.push("/login");
      return;
    }

    setAddingToCart(true);
    try {
      await cartService.addItem(product!.id, quantity);
      toast.success("Produto adicionado ao carrinho!");
    } catch (error: any) {
      toast.error(error.detail || "Erro ao adicionar ao carrinho");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <Link href="/" className="text-blue-600 hover:underline">
            Início
          </Link>
          {" > "}
          <Link href="/products" className="text-blue-600 hover:underline">
            Produtos
          </Link>
          {" > "}
          <span className="text-gray-600">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Galeria de Imagens */}
          <div>
            <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
              <div className="aspect-square bg-gray-200 flex items-center justify-center">
                {product.image_urls && product.image_urls.length > 0 ? (
                  <img
                    src={product.image_urls[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 text-6xl">📦</div>
                )}
              </div>
            </div>

            {/* Miniaturas */}
            {product.image_urls && product.image_urls.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.image_urls.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-white rounded-lg shadow overflow-hidden ${
                      selectedImage === index ? "ring-2 ring-blue-600" : ""
                    }`}
                  >
                    <img
                      src={url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informações */}
          <div>
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-4xl font-bold text-blue-600">
                  R$ {product.price.toFixed(2)}
                </span>
              </div>

              <div className="mb-6">
                <h2 className="font-semibold text-gray-900 mb-2">Descrição</h2>
                <p className="text-gray-600">{product.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Categoria</p>
                  <p className="font-semibold">{product.category}</p>
                </div>
                {product.brand && (
                  <div>
                    <p className="text-sm text-gray-600">Marca</p>
                    <p className="font-semibold">{product.brand}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Estoque</p>
                  <p className="font-semibold">
                    {product.stock > 0
                      ? `${product.stock} unidades`
                      : "Esgotado"}
                  </p>
                </div>
              </div>

              {/* Adicionar ao Carrinho */}
              {product.stock > 0 ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantidade
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="text-xl font-semibold w-12 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() =>
                          setQuantity(Math.min(product.stock, quantity + 1))
                        }
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
                  >
                    {addingToCart ? "Adicionando..." : "Adicionar ao Carrinho 🛒"}
                  </button>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <p className="text-red-600 font-semibold">Produto Esgotado</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}