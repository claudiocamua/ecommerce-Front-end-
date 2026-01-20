"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/app/components/layout/navbar";
import Footer from "@/app/components/layout/Footer";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount?: number;
  discount_percentage?: number;
  stock: number;
  category: string;
  brand: string;
  image_urls: string[];
  created_at: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);

  // Função para obter a URL completa da imagem
  const getImageUrl = (imageUrl: string): string => {
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    if (imageUrl.startsWith('/')) {
      return `${baseURL}${imageUrl}`;
    }
    
    return `${baseURL}/${imageUrl}`;
  };

  // Carregar todos os produtos (sem autenticação)
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

        let allProductsList: Product[] = [];
        let currentPage = 1;
        let totalPages = 1;

        // Carregar todas as páginas
        do {
          const res = await fetch(`${baseURL}/products/?page=${currentPage}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!res.ok) {
            throw new Error("Erro ao carregar produtos");
          }

          const data = await res.json();

          if (data.products && Array.isArray(data.products)) {
            const mappedProducts = data.products.map((p: any) => ({
              ...p,
              id: p._id || p.id,
            }));
            allProductsList = [...allProductsList, ...mappedProducts];
            totalPages = data.pages || 1;
          } else if (Array.isArray(data)) {
            const mappedProducts = data.map((p: any) => ({
              ...p,
              id: p._id || p.id,
            }));
            allProductsList = [...allProductsList, ...mappedProducts];
            break;
          }

          currentPage++;
        } while (currentPage <= totalPages);

        console.log(` Produtos carregados: ${allProductsList.length}`);
        setProducts(allProductsList);
        setFilteredProducts(allProductsList);

        // Extrair categorias únicas
        const uniqueCategories = [
          ...new Set(allProductsList.map((p) => p.category).filter(Boolean)),
        ];
        setCategories(uniqueCategories);

        // Aplicar filtros da URL
        const searchQuery = searchParams.get("search");
        const categoryQuery = searchParams.get("category");
        
        if (searchQuery) {
          setSearchTerm(searchQuery);
          setActiveSearch(searchQuery);
        }
        if (categoryQuery) {
          setSelectedCategory(categoryQuery);
        }
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        toast.error("Erro ao carregar produtos");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [searchParams]);

  // Filtrar produtos com base na categoria selecionada e termo de busca ativo
  useEffect(() => {
    let result = [...products];

    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (activeSearch) {
      const search = activeSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          p.category.toLowerCase().includes(search) ||
          (p.brand && p.brand.toLowerCase().includes(search))
      );
    }

    setFilteredProducts(result);
  }, [products, selectedCategory, activeSearch]);

  const handleClearFilters = () => {
    setSelectedCategory("");
    setSearchTerm("");
    setActiveSearch("");
    router.push("/products");
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setActiveSearch(searchTerm);
  };

  const handleProductClick = (productId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!user) {
      toast.error("Faça login ou cadastre-se para ver os detalhes do produto!", {
        duration: 4000,
      });
      window.dispatchEvent(new CustomEvent('openAuthModal', { detail: 'login' }));
      return;
    }

    console.log(" Redirecionando para produto:", productId);
    router.push(`/products/${productId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mb-4"></div>
        <p className="text-white font-semibold">Carregando produtos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full mt-20">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-3">
            Todos os Produtos
          </h1>
          <p className="text-lg text-white/90">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "produto encontrado" : "produtos encontrados"}
          </p>
        </div>

        <div className="flex items-center justify-center w-full mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="relative w-full sm:w-auto">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-8 py-4 bg-transparent text-lg border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 min-w-[280px] cursor-pointer shadow-lg transition-all hover:border-yellow-400 text-white"
                  style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1.5rem'
                  }}
                >
                  <option value="" className="bg-black">Todas as categorias</option>
                  {categories.map((cat) => (
                    <option className="bg-black" key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {(selectedCategory || activeSearch) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="w-full sm:w-auto px-8 py-4 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-all flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl"
                >
                  <XMarkIcon className="w-5 h-5" />
                  Limpar Filtros
                </button>
              )}
            </div>

            {activeSearch && (
              <div className="text-center">
                <p className="text-gray-900 bg-yellow-400/90 px-6 py-3 rounded-full inline-block font-semibold shadow-lg">
                   Buscando por: "{activeSearch}"
                </p>
              </div>
            )}
          </form>
        </div>

        <div className="relative z-0">
          {filteredProducts.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-16 text-center shadow-2xl">
              <h3 className="text-3xl font-bold text-gray-700 mb-4">
                Nenhum produto encontrado
              </h3>
              <p className="text-gray-500 text-lg mb-8">
                {activeSearch ? `Nenhum resultado para "${activeSearch}"` : "Tente ajustar os filtros"}
              </p>
              <button
                onClick={handleClearFilters}
                className="px-8 py-4 bg-yellow-400 text-gray-900 rounded-xl hover:bg-yellow-500 transition-all font-bold text-lg"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                // Usar discount_percentage
                const discountValue = product.discount_percentage || product.discount || 0;
                const finalPrice = discountValue > 0
                  ? product.price * (1 - discountValue / 100)
                  : product.price;

                return (
                  <div
                    key={product.id}
                    onClick={(e) => handleProductClick(product.id, e)}
                    className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-yellow-400"
                  >
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      {product.image_urls?.[0] ? (
                        <img
                          src={getImageUrl(product.image_urls[0])}
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
                        <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-2 rounded-full text-sm font-bold">
                          -{discountValue.toFixed(0)}%
                        </div>
                      )}

                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                          <span className="text-white font-bold text-xl bg-red-600 px-6 py-3 rounded-full">
                            Sem Estoque
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <p className="text-xs text-yellow-600 font-semibold mb-2 uppercase">
                        {product.category}
                      </p>
                      <h3 className="font-bold text-xl mb-2 line-clamp-2 text-gray-800 group-hover:text-yellow-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
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
                          </div>
                        ) : (
                          <p className="text-3xl font-bold text-gray-900">
                            R$ {product.price.toFixed(2)}
                          </p>
                        )}
                      </div>

                      <p className="text-sm font-semibold">
                        {product.stock > 0 ? (
                          <span className="text-green-600">✓ Disponível ({product.stock} un.)</span>
                        ) : (
                          <span className="text-red-600">✗ Esgotado</span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}