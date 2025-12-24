"use client";

import { useState, useEffect } from "react";
import { productsService } from "@/services/products";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";

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

interface ProductsResponse {
  total: number;
  page: number;
  page_size: number;
  products: Product[];
}

export default function ProductsPage() {
  const [productsData, setProductsData] =
    useState<ProductsResponse | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    page_size: 12,
    category: "",
    search: "",
    min_price: "",
    max_price: "",
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [filters.page, filters.category]);

  const loadCategories = async () => {
    try {
      const data = await productsService.getCategories();
      setCategories(data.categories);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: filters.page,
        page_size: filters.page_size,
      };

      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      if (filters.min_price) params.min_price = parseFloat(filters.min_price);
      if (filters.max_price) params.max_price = parseFloat(filters.max_price);

      const data = await productsService.getProducts(params);
      setProductsData(data);
    } catch (error) {
      toast.error("Erro ao carregar produtos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
    loadProducts();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/image-fundo-2.jpg')" }}
    >
      <div className="fixed inset-0 bg-black/35 pointer-events-none z-0" />

      <Navbar />
      <main style={{ paddingTop: "2cm" }} className="pb-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-yellow-400 mb-8">
            Produtos
          </h1>

          <form onSubmit={handleSearch} className="space-y-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Nome do produto..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full text-black bg-white px-4 py-3 border rounded-lg"
              />

              <select
                value={filters.category}
                onChange={(e) =>
                  handleFilterChange("category", e.target.value)
                }
                className="w-full md:w-60 px-4 py-3 border rounded-lg bg-white text-black"
              >
                <option value="">Todas as categorias</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Preço mínimo"
                value={filters.min_price}
                onChange={(e) =>
                  setFilters({ ...filters, min_price: e.target.value })
                }
                className="w-full md:w-40 px-4 py-3 border rounded-lg bg-white text-black"
              />

              <input
                type="number"
                placeholder="Preço máximo"
                value={filters.max_price}
                onChange={(e) =>
                  setFilters({ ...filters, max_price: e.target.value })
                }
                className="w-full md:w-40 px-4 py-3 border rounded-lg bg-white text-black"
              />

              <button
                type="submit"
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                🔍
              </button>
            </div>
          </form>

          {[1, 2, 3].map((listIndex) => (
            <section key={listIndex} className="mb-12">
              <h2 className="text-xl font-bold mb-4 text-white">
                Lista {listIndex}
              </h2>

              <div className="flex gap-6 overflow-x-auto pb-4">
                {productsData?.products.slice(0, 10).map((product) => (
                  <Link
                    key={product.id + listIndex}
                    href={`/products/${product.id}`}
                    className="min-w-[220px] bg-white rounded-lg shadow hover:scale-105 transition-transform"
                  >
                    <div className="aspect-square bg-gray-200 relative">
                      {product.image_urls?.[0] ? (
                        <img
                          src={product.image_urls[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          📦 Sem imagem
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {product.description}
                      </p>
                      <span className="text-xl font-bold text-blue-600">
                        R$ {product.price.toFixed(2)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        <Footer />
      </main>
    </div>
  );
}
