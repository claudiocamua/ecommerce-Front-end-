"use client";

import { useState, useEffect } from "react";
import { cartService, Cart, CartItem } from "@/app/services/cart";
import { authService } from "@/app/services/auth";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingCartIcon, CubeIcon } from "@heroicons/react/24/outline";
import NavbarDashboard from "../components/dashboard/NavbarDashboard";
import Footer from "../components/layout/Footer";

export default function CartPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar autenticação
        if (!authService.isAuthenticated()) {
          toast.error("Faça login para acessar o carrinho");
          router.push("/auth");
          return;
        }

        // Obter dados do usuário
        let userData = authService.getUser();
        
        // Se não tiver no localStorage, buscar da API
        if (!userData) {
          userData = await authService.getProfile();
          authService.saveUser(userData);
        }

        setUser(userData);
        
        // Carregar carrinho
        await loadCart();
      } catch (error: any) {
        console.error("Erro ao verificar autenticação:", error);
        toast.error("Sessão expirada. Faça login novamente.");
        authService.logout();
        router.push("/auth");
      }
    };

    checkAuth();
  }, [router]);

  const loadCart = async () => {
    try {
      const data = await cartService.getCart();
      setCart(data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Carrinho vazio
        setCart({
          user_id: "",
          items: [],
          total_items: 0,
          subtotal: 0,
          updated_at: new Date().toISOString(),
        });
      } else if (error.response?.status === 401) {
        // Não autenticado
        toast.error("Sessão expirada. Faça login novamente.");
        authService.logout();
        router.push("/auth");
      } else {
        toast.error("Erro ao carregar carrinho");
        console.error("Erro ao carregar carrinho:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (product_id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(product_id);
      return;
    }

    setUpdatingItems((prev) => new Set(prev).add(product_id));
    try {
      const updatedCart = await cartService.updateItem(product_id, newQuantity);
      setCart(updatedCart);
      toast.success("Quantidade atualizada");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Erro ao atualizar quantidade");
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(product_id);
        return newSet;
      });
    }
  };

  const removeItem = async (product_id: string) => {
    if (!confirm("Deseja remover este item do carrinho?")) return;

    setUpdatingItems((prev) => new Set(prev).add(product_id));
    try {
      const updatedCart = await cartService.removeItem(product_id);
      setCart(updatedCart);
      toast.success("Item removido");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Erro ao remover item");
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(product_id);
        return newSet;
      });
    }
  };

  const clearCart = async () => {
    if (!confirm("Deseja limpar todo o carrinho?")) return;

    setLoading(true);
    try {
      await cartService.clearCart();
      setCart({
        user_id: "",
        items: [],
        total_items: 0,
        subtotal: 0,
        updated_at: new Date().toISOString(),
      });
      toast.success("Carrinho limpo");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Erro ao limpar carrinho");
    } finally {
      setLoading(false);
    }
  };

  // ✅ HELPER: Obter URL da imagem
  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return null;
    
    // Se for URL do Cloudinary, retornar direto
    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }
    
    // Se for path relativo, adicionar base URL
    return `${process.env.NEXT_PUBLIC_API_URL}${imageUrl}`;
  };

  // Renderização enquanto carrega
  if (loading || !user) {
    return (
      <div className="relative min-h-screen flex flex-col">
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/image-fundo-4.jpg')" }}
        />
        <div className="fixed inset-0 -z-10 bg-black/50" />

        <div className="relative z-10 flex flex-col min-h-screen">
          <NavbarDashboard user={user} />
          
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto mb-4"></div>
              <p className="text-white font-semibold">Carregando carrinho...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/image-fundo-4.jpg')" }}
      />
      <div className="fixed inset-0 -z-10 bg-black/50" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavbarDashboard user={user} />

        <div className="flex-1 overflow-y-auto">
          {!cart || cart.items.length === 0 ? (
            <div className="min-h-screen flex items-center justify-center">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 text-center shadow-2xl border border-white/20 max-w-md">
                <ShoppingCartIcon className="w-20 h-20 mx-auto mb-6 text-yellow-400" />
                <h2 className="text-3xl font-bold text-white mb-4">
                  Seu carrinho está vazio
                </h2>
                <p className="text-white/80 mb-8 text-lg">
                  Adicione produtos para continuar comprando
                </p>
                <Link
                  href="/dashboard"
                  className="inline-block px-8 py-4 bg-yellow-400 text-gray-900 rounded-xl hover:bg-yellow-500 font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Ver Produtos
                </Link>
              </div>
            </div>
          ) : (
            <div className="min-h-screen py-8">
              <div className="max-w-7xl mx-auto px-4">
                <div className="mb-8">
                  <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 text-center">
                    Carrinho de Compras
                  </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Lista de Produtos */}
                  <div className="lg:col-span-2">
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                      <div className="p-6 border-b border-white/20">
                        <div className="flex justify-between items-center">
                          <h2 className="text-2xl font-semibold text-white">
                            {cart.total_items}{" "}
                            {cart.total_items === 1 ? "item" : "itens"}
                          </h2>
                          <button
                            onClick={clearCart}
                            className="text-red-400 hover:text-red-300 font-semibold transition-colors"
                          >
                            Limpar Carrinho
                          </button>
                        </div>
                      </div>

                      <div className="divide-y divide-white/10">
                        {cart.items.map((item) => (
                          <div key={item.product_id} className="p-6 hover:bg-white/5 transition-colors">
                            <div className="flex gap-4">
                              {/* Imagem do Produto */}
                              <div className="relative w-24 h-24 bg-gray-700/50 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center border-2 border-white/10">
                                {item.product_image && getImageUrl(item.product_image) ? (
                                  <Image
                                    src={getImageUrl(item.product_image)!}
                                    alt={item.product_name}
                                    fill
                                    sizes="96px"
                                    className="object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <CubeIcon className="w-12 h-12 text-white/60" />
                                )}
                              </div>

                              {/* Informações do Produto */}
                              <div className="flex-1">
                                <h3 className="font-bold text-xl text-white mb-2">
                                  {item.product_name}
                                </h3>
                                <p className="text-yellow-400 font-bold text-lg mb-3">
                                  R$ {item.product_price.toFixed(2)}
                                </p>

                                {!item.in_stock && (
                                  <p className="text-red-400 text-sm mb-3 font-semibold">
                                    ⚠️ Estoque insuficiente ({item.available_stock} disponíveis)
                                  </p>
                                )}

                                {/* Controles de Quantidade */}
                                <div className="flex items-center gap-4">
                                  <button
                                    onClick={() =>
                                      updateQuantity(item.product_id, item.quantity - 1)
                                    }
                                    disabled={updatingItems.has(item.product_id)}
                                    className="w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    -
                                  </button>
                                  <span className="w-14 text-center font-bold text-white text-lg">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      updateQuantity(item.product_id, item.quantity + 1)
                                    }
                                    disabled={
                                      updatingItems.has(item.product_id) ||
                                      item.quantity >= item.available_stock
                                    }
                                    className="w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    +
                                  </button>
                                  <button
                                    onClick={() => removeItem(item.product_id)}
                                    disabled={updatingItems.has(item.product_id)}
                                    className="ml-auto text-red-400 hover:text-red-300 font-semibold transition-colors disabled:opacity-50"
                                  >
                                    Remover
                                  </button>
                                </div>
                              </div>

                              {/* Subtotal */}
                              <div className="text-right">
                                <p className="text-2xl font-bold text-white">
                                  R$ {item.subtotal.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Resumo do Pedido */}
                  <div className="lg:col-span-1">
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-6 sticky top-24">
                      <h2 className="text-2xl font-bold text-white mb-6">Resumo</h2>

                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between text-lg">
                          <span className="text-white/90">Subtotal</span>
                          <span className="font-bold text-white">
                            R$ {cart.subtotal.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-lg">
                          <span className="text-white/90">Frete</span>
                          <span className="font-semibold text-white/70">
                            Calculado no checkout
                          </span>
                        </div>
                        <div className="border-t border-white/20 pt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-xl font-bold text-white">Total</span>
                            <span className="text-3xl font-bold text-yellow-400">
                              R$ {cart.subtotal.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Link
                        href="/checkout"
                        className="block w-full py-4 bg-yellow-400 text-gray-900 text-center rounded-xl hover:bg-yellow-500 font-bold text-lg mb-4 shadow-lg hover:shadow-xl transition-all"
                      >
                        Finalizar Compra
                      </Link>

                      <Link
                        href="/dashboard"
                        className="block w-full py-4 bg-white/10 text-white text-center rounded-xl hover:bg-white/20 font-semibold transition-all border border-white/20"
                      >
                        Continuar Comprando
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}