"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/app/services/auth";
import Footer from "../components/layout/Footer";
import { toast } from "react-hot-toast";
import NavbarDashboard from "../components/dashboard/NavbarDashboard";
import UserInfo from "../components/dashboard/UserInfo";
import ComingSoon from "../components/dashboard/ComingSoon";
import CardAnime from "../components/dashboard/cardAnime";
import { SparklesIcon } from "@heroicons/react/24/outline";

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

interface CategoryProducts {
  category: string;
  products: Product[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [topCategories, setTopCategories] = useState<CategoryProducts[]>([]);

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
          setLoading(false);
        } else {
          const userDataFromAPI = await authService.getProfile();
          authService.saveUser(userDataFromAPI);
          setUser(userDataFromAPI);
          setLoading(false);
        }
      } catch (err) {
        toast.error("Sessão expirada");
        authService.logout();
        router.push("/");
      }
    };

    loadUserData();
  }, [router]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const token = authService.getToken();
        const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

        console.log("Buscando produtos de:", baseURL);

        const res = await fetch(`${baseURL}/products/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Erro HTTP ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        console.log("Dados recebidos:", data);

        const products = data.products || data || [];
        console.log("Total de produtos:", products.length);

        if (!Array.isArray(products)) {
          console.error("Produtos não é um array:", products);
          throw new Error("Formato de dados inválido");
        }

        const mapped = products.map((p: any) => ({
          ...p,
          id: p._id || p.id,
          price: Number(p.price) || 0,
          category: p.category || "Sem categoria",
        }));

        console.log("Produtos mapeados:", mapped.length);
        setAllProducts(mapped);

        // Agrupar produtos por categoria usando objeto simples
        const categoriesObj: { [key: string]: Product[] } = {};
        
        mapped.forEach((product: Product) => {
          const cat = product.category;
          if (!categoriesObj[cat]) {
            categoriesObj[cat] = [];
          }
          categoriesObj[cat].push(product);
        });

        console.log("Categorias encontradas:", Object.keys(categoriesObj));

        // Processar cada categoria
        const categoriesArray: CategoryProducts[] = Object.entries(categoriesObj)
          .map(([category, products]) => {
            const productsCopy = [...products];
            
            productsCopy.sort((a, b) => {
              const priceA = Number(a.price) || 0;
              const priceB = Number(b.price) || 0;
              return priceB - priceA;
            });

            // Pegar apenas os 2 primeiros
            const top2 = productsCopy.slice(0, 2);

            console.log(`Categoria "${category}":`, {
              total: products.length,
              top2: top2.map(p => ({ name: p.name, price: p.price }))
            });

            return {
              category,
              products: top2,
            };
          })
          .filter(cat => cat.products.length > 0); 

        // Ordenar categorias por preço médio (maior primeiro)
        categoriesArray.sort((a, b) => {
          const avgA = a.products.reduce((sum, p) => sum + (Number(p.price) || 0), 0) / a.products.length;
          const avgB = b.products.reduce((sum, p) => sum + (Number(p.price) || 0), 0) / b.products.length;
          return avgB - avgA;
        });

        // Pegar top 4 categorias
        const top4 = categoriesArray.slice(0, 4);

        console.log("Top 4 categorias:", top4.map(c => ({
          category: c.category,
          avgPrice: (c.products.reduce((s, p) => s + p.price, 0) / c.products.length).toFixed(2)
        })));

        setTopCategories(top4);

      } catch (error: any) {
        console.error("Erro ao carregar produtos:", error);
        toast.error(error.message || "Erro ao carregar produtos");
        setTopCategories([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    if (user) {
      loadProducts();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-yellow-400 mb-4"></div>
        <p className="text-white font-semibold">Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        {error}
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="relative min-h-screen flex flex-col">
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage: "url('/image-fundo-2.jpg')",
        }}
      />
      <div className="fixed inset-0 -z-10 bg-black/60" />

      <NavbarDashboard user={user} />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400 flex items-center justify-center gap-2">
            <SparklesIcon className="w-8 h-8 animate-pulse" />
            Produtos Premium em Destaque
            <SparklesIcon className="w-8 h-8 animate-pulse" />
          </h1>
          <p className="text-white/80 mt-2">Os produtos mais valiosos de cada categoria</p>
        </div>

        <ComingSoon />

        {/* LISTAGEM DE CATEGORIAS COM PRODUTOS MAIS CAROS */}
        {loadingProducts ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mb-4" />
            <p className="text-white/70">Carregando produtos premium...</p>
          </div>
        ) : topCategories.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-yellow-400/30 max-w-md mx-auto">
              <p className="text-white/70 text-lg mb-2">Nenhum produto disponível</p>
              <p className="text-white/50 text-sm">Adicione produtos no painel administrativo</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            {topCategories.map((categoryData, index) => (
              <CardAnime
                key={`${categoryData.category}-${index}`}
                products={categoryData.products}
                category={categoryData.category}
                maxProducts={2}
                animationDelay={0.1 + index * 0.1}
                animationType={5}
              />
            ))}
          </div>
        )}

        {/* Estatísticas */}
        {!loadingProducts && topCategories.length > 0 && (
          <div className="mt-12 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-yellow-400/30">
            <h2 className="text-xl font-bold text-yellow-400 mb-4 text-center">
              Estatísticas dos Produtos Premium
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {topCategories.map((cat, idx) => {
                const avgPrice = cat.products.reduce((sum, p) => sum + (Number(p.price) || 0), 0) / cat.products.length;
                const maxPrice = Math.max(...cat.products.map(p => Number(p.price) || 0));
                
                return (
                  <div key={`stat-${cat.category}-${idx}`} className="bg-black/30 p-4 rounded-lg text-center">
                    <p className="text-white/70 text-sm mb-1 line-clamp-1">{cat.category}</p>
                    <p className="text-yellow-400 font-bold text-lg">
                      R$ {avgPrice.toFixed(2)}
                    </p>
                    <p className="text-white/50 text-xs mt-1">
                      Até R$ {maxPrice.toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* USER INFO */}
      <section className="bg-black/60 border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <UserInfo user={user} />
        </div>
      </section>

      <Footer />
    </div>
  );
}
