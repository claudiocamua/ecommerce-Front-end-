"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/app/services/auth";
import { productsService } from "@/app/services/products";
import Footer from "@/app/components/layout/Footer";
import { toast } from "react-hot-toast";
import NavbarDashboard from "@/app/components/dashboard/NavbarDashboard";
import ProductModal from "@/app/components/ProductModal";
import { cartService } from "@/app/services/cart";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

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

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Estados para o modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ Função auxiliar para montar URL da imagem
  const getImageUrl = (imageUrl: string): string | null => {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    
    if (!imageUrl) return null;
    
    // Se já for uma URL completa, retorna ela mesma
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // Se começar com /, concatena com baseURL
    if (imageUrl.startsWith('/')) {
      return `${baseURL}${imageUrl}`;
    }
    
    // Caso contrário, adiciona / antes
    return `${baseURL}/${imageUrl}`;
  };

  // Carregar dados do usuário
  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (!authService.isAuthenticated()) {
          router.push("/");
          return;
        }

        const userData = authService.getUser();
        if (userData) {
          setUser(userData);
        } else {
          const userDataFromAPI = await authService.getProfile();
          authService.saveUser(userDataFromAPI);
          setUser(userDataFromAPI);
        }
      } catch (err) {
        console.error("❌ Erro ao carregar usuário:", err);
        toast.error("Erro ao carregar dados. Faça login novamente.");
        authService.logout();
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  // Carregar produtos
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await productsService.getProducts({
          skip: 0,
          limit: 100,
        });

        let productsList: Product[] = [];
        
        if (Array.isArray(data)) {
          productsList = data;
        } else if (data?.products && Array.isArray(data.products)) {
          productsList = data.products;
        }
        
        setProducts(productsList);
        setFilteredProducts(productsList);

        const uniqueCategories = [
          ...new Set(productsList.map((p) => p.category).filter(Boolean)),
        ];
        
        setCategories(uniqueCategories);

        const categoryFromUrl = searchParams.get("categoria");
        if (categoryFromUrl) {
          setSelectedCategory(categoryFromUrl);
        }
      } catch (error) {
        console.error("❌ Erro ao carregar produtos:", error);
        toast.error("Erro ao carregar produtos");
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    if (user) {
      loadProducts();
    }
  }, [user, searchParams]);

  // Filtrar produtos
  useEffect(() => {
    if (!Array.isArray(products) || products.length === 0) {
      setFilteredProducts([]);
      return;
    }

    let result = [...products];

    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          p.category.toLowerCase().includes(search) ||
          p.brand.toLowerCase().includes(search)
      );
    }

    setFilteredProducts(result);
  }, [products, selectedCategory, searchTerm]);

  const handleClearFilters = () => {
    setSelectedCategory("");
    setSearchTerm("");
    router.push("/dashboard/products");
  };

  // Função para abrir o modal
  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Função para fechar o modal
  const closeProductModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 200);
  };

  // Função para adicionar ao carrinho
  const handleAddToCart = async (productId: string, quantity: number) => {
    try {
      await cartService.addItem(productId, quantity);
      toast.success(`${quantity}x produto adicionado ao carrinho!`);
    } catch (error: any) {
      toast.error(error.detail || "Erro ao adicionar ao carrinho");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mb-4"></div>
        <p className="text-white font-semibold">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* ✅ BACKGROUND IMAGE FIXO */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/image-fundo-3.jpg')" }}
      />
      {/* Overlay escuro */}
      <div className="fixed inset-0 -z-10 bg-black/50" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavbarDashboard user={user} />

        <div className="flex-1 overflow-y-auto">
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-3">
                Todos os Produtos
              </h1>
              <p className="text-lg text-white/90">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "produto encontrado" : "produtos encontrados"}
              </p>
            </div>

            {/* Barra de Busca e Filtros */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-8 shadow-2xl border border-white/20">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Campo de Busca */}
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/60" />
                  <input
                    type="text"
                    placeholder="Buscar por nome, categoria, marca..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-lg bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all"
                  />
                </div>

                {/* Filtros Desktop */}
                <div className="hidden lg:flex gap-3">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-6 py-4 bg-white/10 text-white text-lg border-2 border-white/20 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 min-w-[250px] cursor-pointer transition-all"
                  >
                    <option value="" className="bg-gray-800">📁 Todas as categorias</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-gray-800">
                        {cat}
                      </option>
                    ))}
                  </select>

                  {(selectedCategory || searchTerm) && (
                    <button
                      onClick={handleClearFilters}
                      className="px-6 py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl"
                    >
                      <XMarkIcon className="w-5 h-5" />
                      Limpar
                    </button>
                  )}
                </div>

                {/* Botão de Filtros (Mobile) */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center justify-center gap-2 px-6 py-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all font-semibold"
                >
                  <FunnelIcon className="w-5 h-5" />
                  Filtros {(selectedCategory || searchTerm) && "✓"}
                </button>
              </div>

              {/* Filtros Mobile (Dropdown) */}
              {showFilters && (
                <div className="lg:hidden mt-4 pt-4 border-t-2 border-white/20 space-y-4">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-4 text-lg bg-white/10 border-2 border-white/20 text-white rounded-xl"
                  >
                    <option value="" className="bg-gray-800">📁 Todas as categorias</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-gray-800">
                        {cat}
                      </option>
                    ))}
                  </select>

                  {(selectedCategory || searchTerm) && (
                    <button
                      onClick={handleClearFilters}
                      className="w-full px-6 py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all flex items-center justify-center gap-2 font-semibold"
                    >
                      <XMarkIcon className="w-5 h-5" />
                      Limpar Filtros
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Grid de Produtos */}
            {loadingProducts ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto mb-4"></div>
                  <p className="text-white text-lg font-semibold">Carregando produtos...</p>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-16 text-center shadow-2xl border border-white/20">
                <div className="text-8xl mb-6">😔</div>
                <h3 className="text-3xl font-bold text-white mb-4">
                  Nenhum produto encontrado
                </h3>
                <p className="text-white/70 text-lg mb-8">
                  Tente ajustar os filtros ou limpar a busca para ver mais produtos
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-8 py-4 bg-yellow-400 text-gray-900 rounded-xl hover:bg-yellow-500 transition-all font-bold text-lg shadow-lg hover:shadow-xl"
                >
                  Limpar Filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  const finalPrice = product.discount
                    ? product.price * (1 - product.discount)
                    : product.price;

                  return (
                    <div
                      key={product.id}
                      className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-yellow-400"
                      onClick={() => openProductModal(product)}
                    >
                      {/* Imagem */}
                      <div className="aspect-square bg-gray-100 relative overflow-hidden">
                        {product.image_urls?.[0] ? (
                          <img
                            src={getImageUrl(product.image_urls[0]) || ""}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              target.onerror = null;
                              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&size=400&background=1f2937&color=facc15&bold=true`;
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            📷 Sem imagem
                          </div>
                        )}

                        {product.discount && product.discount > 0 && (
                          <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-2 rounded-full text-sm font-bold shadow-lg">
                            -{(product.discount * 100).toFixed(0)}%
                          </div>
                        )}

                        {product.stock === 0 && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
                            <span className="text-white font-bold text-xl bg-red-600 px-6 py-3 rounded-full">
                              Sem Estoque
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-5">
                        <p className="text-xs text-yellow-600 font-semibold mb-2 uppercase tracking-wide">
                          {product.category}
                        </p>
                        <h3 className="font-bold text-xl mb-2 line-clamp-2 text-gray-800 group-hover:text-yellow-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>

                        <div className="border-t border-gray-200 pt-4 mb-3">
                          {product.discount && product.discount > 0 ? (
                            <div className="space-y-1">
                              <p className="text-sm text-gray-400 line-through">
                                De: R$ {product.price.toFixed(2)}
                              </p>
                              <p className="text-3xl font-bold text-green-600">
                                R$ {finalPrice.toFixed(2)}
                              </p>
                              <p className="text-xs text-green-600 font-semibold">
                                Economize R$ {(product.price - finalPrice).toFixed(2)}
                              </p>
                            </div>
                          ) : (
                            <p className="text-3xl font-bold text-gray-900">
                              R$ {product.price.toFixed(2)}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold">
                            {product.stock > 0 ? (
                              <span className="text-green-600">✓ Disponível</span>
                            ) : (
                              <span className="text-red-600">✗ Esgotado</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {product.stock > 0 && `${product.stock} un.`}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="h-24"></div>
          </main>
        </div>

        <Footer />
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
