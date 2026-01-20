"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../../services/auth";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface Product {
  id?: string;        
  _id?: string;       
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  discount_percentage?: number;
  image_urls: string[];
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const token = authService.getToken();
      
      if (!token) {
        toast.error("Faça login para acessar");
        router.push("/auth");
        return;
      }

      const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      console.log(" Carregando produtos de:", `${baseURL}/products`);

      const res = await fetch(`${baseURL}/products?page_size=100`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        console.log(" Dados recebidos:", data);
        
        // Verificar se é array ou objeto com products
        const productsList = Array.isArray(data) ? data : data.products || [];
        setProducts(productsList);
        toast.success(`${productsList.length} produtos carregados`);
      } else {
        const error = await res.json();
        console.error(" Erro:", error);
        toast.error(error.detail || "Erro ao carregar produtos");
      }
    } catch (err) {
      console.error(" Erro:", err);
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Deseja realmente excluir este produto?")) return;

    try {
      const token = authService.getToken();
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      console.log(" Deletando produto:", id);

      const res = await fetch(`${baseURL}/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success("Produto excluído com sucesso!");
        loadProducts();
      } else {
        const error = await res.json();
        toast.error(error.detail || "Erro ao excluir produto");
      }
    } catch (err) {
      console.error(" Erro:", err);
      toast.error("Erro ao excluir produto");
    }
  }

  //Função auxiliar para obter ID do produto
  function getProductId(product: Product): string {
    return product.id || product._id || "";
  }

  // Função auxiliar para montar URL da imagem
  function getImageUrl(imageUrl: string): string {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    if (imageUrl.startsWith('/')) {
      return `${baseURL}${imageUrl}`;
    }
    
    return `${baseURL}/${imageUrl}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-white mt-4">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Produtos Cadastrados</h1>
          <div className="flex gap-4">
            <Link
              href="/admin/products/new"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
               Novo Produto
            </Link>
            <Link
              href="/admin"
              className="bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              ← Voltar
            </Link>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-gray-800 rounded-lg">
            <div className="text-6xl mb-4">prod</div>
            <p className="text-xl text-gray-400 mb-2">Nenhum produto cadastrado</p>
            <p className="text-gray-500 mb-6">Comece adicionando seu primeiro produto</p>
            <Link
              href="/admin/products/new"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
            >
               Adicionar Produto
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const productId = getProductId(product);
              
              return (
                <div key={productId} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                  {/* Exibir imagem do produto */}
                  <div className="relative h-48 bg-gray-700">
                    {product.image_urls && product.image_urls.length > 0 ? (
                      <img 
                        src={getImageUrl(product.image_urls[0])}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error(" Erro ao carregar imagem:", product.image_urls[0]);
                          console.error(" URL completa:", getImageUrl(product.image_urls[0]));
                          // Fallback se imagem não carregar
                          e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23374151' width='200' height='200'/%3E%3Ctext fill='%239CA3AF' font-size='20' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ESem Imagem%3C/text%3E%3C/svg%3E";
                        }}
                        onLoad={() => {
                          console.log(" Imagem carregada:", product.image_urls[0]);
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-gray-400 text-4xl">img</span>
                      </div>
                    )}
                    
                    {/* Badge de desconto */}
                    {product.discount_percentage && product.discount_percentage > 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                        -{product.discount_percentage}%
                      </div>
                    )}
                  </div>

                  {/* Conteúdo do card */}
                  <div className="p-4">
                    <h3 className="text-xl font-bold mb-2 truncate">{product.name}</h3>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>
                    
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-green-400 font-bold text-2xl">
                        R$ {product.price.toFixed(2)}
                      </p>
                      <p className={`text-sm font-semibold ${product.stock > 0 ? 'text-blue-400' : 'text-red-400'}`}>
                        Estoque: {product.stock}
                      </p>
                    </div>

                    <div className="mb-3">
                      <span className="inline-block bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs">
                        {product.category}
                      </span>
                    </div>

                    {/* Botões de ação */}
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/products/${productId}/edit`}
                        className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition text-center font-semibold"
                      >
                         Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(productId)}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-semibold"
                      >
                         Excluir
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Estatísticas */}
        {products.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Total de Produtos</p>
              <p className="text-3xl font-bold text-blue-400">{products.length}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Em Estoque</p>
              <p className="text-3xl font-bold text-green-400">
                {products.filter((p) => p.stock > 0).length}
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Sem Estoque</p>
              <p className="text-3xl font-bold text-red-400">
                {products.filter((p) => p.stock === 0).length}
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Em Promoção</p>
              <p className="text-3xl font-bold text-yellow-400">
                {products.filter((p) => p.discount_percentage && p.discount_percentage > 0).length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
