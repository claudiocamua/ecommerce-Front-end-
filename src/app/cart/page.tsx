"use client";

import { useState, useEffect } from "react";
import { cartService, Cart, CartItem } from "@/services/cart";
import { authService } from "@/services/auth";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCartIcon, CubeIcon } from "@heroicons/react/24/outline";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      toast.error("Faça login para acessar o carrinho");
      router.push("/login");
      return;
    }
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const data = await cartService.getCart();
      setCart(data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setCart({
          user_id: "",
          items: [],
          total_items: 0,
          subtotal: 0,
          updated_at: new Date().toISOString(),
        });
      } else {
        toast.error("Erro ao carregar carrinho");
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
      toast.error(error.detail || "Erro ao atualizar quantidade");
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
      toast.error("Erro ao remover item");
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
      toast.error("Erro ao limpar carrinho");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCartIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Seu carrinho está vazio
          </h2>
          <p className="text-gray-600 mb-6">
            Adicione produtos para continuar comprando
          </p>
          <Link
            href="/products"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Ver Produtos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Carrinho de Compras
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">
                    {cart.total_items} {cart.total_items === 1 ? "item" : "itens"}
                  </h2>
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Limpar Carrinho
                  </button>
                </div>
              </div>

              <div className="divide-y">
                {cart.items.map((item) => (
                  <div key={item.product_id} className="p-6">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                        {item.product_image ? (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <CubeIcon className="w-12 h-12 text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {item.product_name}
                        </h3>
                        <p className="text-blue-600 font-semibold mb-2">
                          R$ {item.product_price.toFixed(2)}
                        </p>

                        {!item.in_stock && (
                          <p className="text-red-600 text-sm mb-2">
                            ⚠️ Estoque insuficiente ({item.available_stock} disponíveis)
                          </p>
                        )}

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              updateQuantity(item.product_id, item.quantity - 1)
                            }
                            disabled={updatingItems.has(item.product_id)}
                            className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                          >
                            -
                          </button>
                          <span className="w-12 text-center font-semibold">
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
                            className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeItem(item.product_id)}
                            disabled={updatingItems.has(item.product_id)}
                            className="ml-auto text-red-600 hover:text-red-700 text-sm disabled:opacity-50"
                          >
                            Remover
                          </button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          R$ {item.subtotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Resumo</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">
                    R$ {cart.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frete</span>
                  <span className="font-semibold">Calculado no checkout</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold text-blue-600">
                      R$ {cart.subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href="/checkout"
                className="block w-full py-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 font-semibold mb-3"
              >
                Finalizar Compra
              </Link>

              <Link
                href="/products"
                className="block w-full py-3 border border-gray-300 text-center rounded-lg hover:bg-gray-50"
              >
                Continuar Comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}