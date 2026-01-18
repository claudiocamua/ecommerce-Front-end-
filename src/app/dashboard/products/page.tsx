"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/app/services/auth";
import Footer from "@/app/components/layout/Footer";
import { toast } from "react-hot-toast";
import NavbarDashboard from "@/app/components/dashboard/NavbarDashboard";
import ProductModal from "@/app/components/ProductModal";
import { cartService } from "@/app/services/cart";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ArrowPathIcon, 
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
  discount_percentage?: number; 
  stock: number;
  category: string;
  brand?: string; 
  image_urls: string[];
  created_at: string;
}
// Página de Produtos no Dashboard
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
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getImageUrl = (imageUrl: string): string | null => {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    
    if (!imageUrl) return null;
    
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    if (imageUrl.startsWith('/')) {
      return `${baseURL}${imageUrl}`;
    }
    
    return `${baseURL}/${imageUrl}`;
  };

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
        console.error(" Erro ao carregar usuário:", err);
        toast.error("Erro ao carregar dados. Faça login novamente.");
        authService.logout();
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  // CARREGAR PRODUTOS COM PAGINAÇÃO
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        console.log(" Buscando produtos...");

        const token = authService.getToken();
        const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        
        let allProducts: Product[] = [];
        let currentPage = 1;
        let totalPages = 1;

        do {
          console.log(` Buscando página ${currentPage}...`);
          
          const res = await fetch(`${baseURL}/products/?page=${currentPage}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) {
            const errorData = await res.json();
            console.error(" Erro da API:", errorData);
            throw new Error("Erro ao carregar produtos");
          }

          // MAPEAR _id PARA id
          const data = await res.json();
          
          if (data.products && Array.isArray(data.products)) {
            const mappedProducts = data.products.map((p: any) => ({
              ...p,
              id: p._id || p.id, 
            }));
            allProducts = [...allProducts, ...mappedProducts];
            totalPages = data.pages || 1;
            console.log(` Página ${currentPage}/${totalPages}: ${mappedProducts.length} produtos`);
          } else if (Array.isArray(data)) {
            const mappedProducts = data.map((p: any) => ({
              ...p,
              id: p._id || p.id, 
            }));
            allProducts = [...allProducts, ...mappedProducts];
            console.log(` Página ${currentPage}: ${mappedProducts.length} produtos (sem paginação)`);
            break;
          }

          currentPage++;
        } while (currentPage <= totalPages);

        console.log(` TOTAL: ${allProducts.length} produtos carregados de ${totalPages} páginas`);
        console.log(" Primeiros 3 produtos:", allProducts.slice(0, 3));
        
        setProducts(allProducts);
        setFilteredProducts(allProducts);

        const allCategories = allProducts.map((p) => p.category).filter(Boolean);
        const uniqueCategories = [...new Set(allCategories)].sort();
        
        console.log(" Categorias únicas encontradas:", uniqueCategories);
        console.log(" Total de categorias:", uniqueCategories.length);
        setCategories(uniqueCategories);

        const categoryFromUrl = searchParams.get("categoria");
        if (categoryFromUrl) {
          console.log("🔗 Categoria da URL:", categoryFromUrl);
          setSelectedCategory(categoryFromUrl);
        }

        toast.success(`${allProducts.length} produtos carregados`);
      } catch (error) {
        console.error(" Erro ao carregar produtos:", error);
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

  // FUNÇÃO DE ATUALIZAÇÃO DE PRODUTOS
  const handleRefresh = async () => {
    if (loadingProducts) return; 

    try {
      setLoadingProducts(true);
      const token = authService.getToken();
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      let allProducts: Product[] = [];
      let currentPage = 1;
      let totalPages = 1;

      do {
        const res = await fetch(`${baseURL}/products/?page=${currentPage}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Erro ao carregar produtos");

        const data = await res.json();
        
        if (data.products && Array.isArray(data.products)) {
          const mappedProducts = data.products.map((p: any) => ({
            ...p,
            id: p._id || p.id,
          }));
          allProducts = [...allProducts, ...mappedProducts];
          totalPages = data.pages || 1;
        } else if (Array.isArray(data)) {
          const mappedProducts = data.map((p: any) => ({
            ...p,
            id: p._id || p.id,
          }));
          allProducts = [...allProducts, ...mappedProducts];
          break;
        }

        currentPage++;
      } while (currentPage <= totalPages);

      setProducts(allProducts);
      setFilteredProducts(allProducts);
    
      // Atualizar categorias
      const allCategories = allProducts.map((p) => p.category).filter(Boolean);
      const uniqueCategories = [...new Set(allCategories)].sort();
      setCategories(uniqueCategories);

      toast.success(` Atualizado! ${allProducts.length} produtos`);
    } catch (error) {
      console.error(" Erro ao atualizar:", error);
      toast.error("Erro ao atualizar produtos");
    } finally {
      setLoadingProducts(false);
    }
  };

  // APLICAR FILTROS
  useEffect(() => {
    console.log(" Aplicando filtros...");
    console.log(" Busca:", searchTerm);
    console.log(" Categoria:", selectedCategory);

    if (!Array.isArray(products) || products.length === 0) {
      console.log(" Nenhum produto disponível para filtrar");
      setFilteredProducts([]);
      return;
    }

    let result = [...products];

    if (selectedCategory) {
      result = result.filter((p) => {
        const match = p.category === selectedCategory;
        if (!match) {
          console.log(` Produto "${p.name}" não corresponde à categoria "${selectedCategory}"`);
        }
        return match;
      });
      console.log(` ${result.length} produtos após filtro de categoria`);
    }

    if (searchTerm && searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      result = result.filter((p) => {
        const nameMatch = p.name?.toLowerCase().includes(search);
        const descMatch = p.description?.toLowerCase().includes(search);
        const catMatch = p.category?.toLowerCase().includes(search);
        const brandMatch = p.brand?.toLowerCase().includes(search);
        
        return nameMatch || descMatch || catMatch || brandMatch;
      });
      console.log(` ${result.length} produtos após filtro de busca`);
    }

    console.log(` Total de produtos filtrados: ${result.length}`);
    setFilteredProducts(result);
  }, [products, selectedCategory, searchTerm]);

  // LIMPAR FILTROS
  const handleClearFilters = () => {
    console.log(" Limpando filtros...");
    setSelectedCategory("");
    setSearchTerm("");
    router.push("/dashboard/products");
  };

  const openProductModal = (product: Product) => {
    console.log(" Produto selecionado:", product);
    console.log(" ID do produto:", product.id); 
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeProductModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 200);
  };

  // ADICIONAR AO CARRINHO
  const handleAddToCart = async (productId: string, quantity: number) => {
    try {
      console.log(" Tentando adicionar ao carrinho:", { productId, quantity });
      await cartService.addToCart(productId, quantity); 
      toast.success(` ${quantity}x produto adicionado ao carrinho!`);
    } catch (error: any) {
      console.error(" Erro ao adicionar:", error);
      toast.error(error.message || "Erro ao adicionar ao carrinho");
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
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/image-fundo-3.jpg')" }}
      />
      <div className="fixed inset-0 -z-10 bg-black/50" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavbarDashboard user={user} />

        <div className="flex-1 overflow-y-auto">
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-3">
                Todos os Produtos
              </h1>
              <p className="text-lg text-white/90">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "produto encontrado" : "produtos encontrados"}
                {products.length > 0 && ` de ${products.length} total`}
              </p>
            </div>
            {/*FILTROS DE BUSCA E CATEGORIA */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-8 shadow-2xl border border-white/20">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  
                  <input
                    type="text"
                    placeholder="Buscar por nome, descrição, categoria..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-lg bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all"
                  />
                </div>

                <div className="hidden lg:flex gap-3">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-6 py-4 bg-white/10 text-white text-lg border-2 border-white/20 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 min-w-[250px] cursor-pointer transition-all"
                  >
                    <option value="" className="bg-gray-800"> Todas as categorias ({categories.length})</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-gray-800">
                        {cat}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleRefresh}
                    disabled={loadingProducts}
                    className="px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Recarregar produtos"
                  >
                    <ArrowPathIcon className={`w-5 h-5 ${loadingProducts ? 'animate-spin' : ''}`} />
                    Atualizar
                  </button>

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

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center justify-center gap-2 px-6 py-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all font-semibold"
                >
                  <FunnelIcon className="w-5 h-5" />
                  Filtros {(selectedCategory || searchTerm) && "✓"}
                </button>
              </div>

              {showFilters && (
                <div className="lg:hidden mt-4 pt-4 border-t-2 border-white/20 space-y-4">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-4 text-lg bg-white/10 border-2 border-white/20 text-white rounded-xl"
                  >
                    <option value="" className="bg-gray-800">Todas as categorias</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-gray-800">
                        {cat}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleRefresh}
                    disabled={loadingProducts}
                    className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
                  >
                    <ArrowPathIcon className={`w-5 h-5 ${loadingProducts ? 'animate-spin' : ''}`} />
                    Atualizar Produtos
                  </button>

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

            {loadingProducts ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto mb-4"></div>
                  <p className="text-white text-lg font-semibold">Carregando produtos...</p>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-16 text-center shadow-2xl border border-white/20">
                <h3 className="text-3xl font-bold text-white mb-4">
                  Nenhum produto encontrado
                </h3>
                <p className="text-white/70 text-lg mb-8">
                  {searchTerm || selectedCategory 
                    ? "Tente ajustar os filtros ou limpar a busca para ver mais produtos"
                    : "Nenhum produto cadastrado no sistema"
                  }
                </p>
                {(searchTerm || selectedCategory) && (
                  <button
                    onClick={handleClearFilters}
                    className="px-8 py-4 bg-yellow-400 text-gray-900 rounded-xl hover:bg-yellow-500 transition-all font-bold text-lg shadow-lg hover:shadow-xl"
                  >
                    Limpar Filtros
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  // Cálculo do preço com desconto
                  const discountValue = product.discount_percentage || product.discount || 0;
                  const finalPrice = discountValue > 0
                    ? product.price * (1 - discountValue / 100)
                    : product.price;

                  return (
                    <div
                      key={product.id}
                      className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-yellow-400"
                      onClick={() => openProductModal(product)}
                    >
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
                             Sem imagem
                          </div>
                        )}

                        {discountValue > 0 && (
                          <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-2 rounded-full text-sm font-bold shadow-lg">
                            -{discountValue.toFixed(0)}%
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
                          {discountValue > 0 ? (
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
