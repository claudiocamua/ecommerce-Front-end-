"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { cartService } from "../services/cart";
import { toast } from "react-hot-toast";

interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartContextData {
  cart: CartItem[];
  loading: boolean;
  addToCart: (product: CartItem) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    try {
      setLoading(true);
      const data = await cartService.getCart();
      
      console.log("📦 Dados do carrinho recebidos:", data);
      
      // ✅ CONVERTER FORMATO DO BACKEND PARA CONTEXTO
      const items = data.items.map((item: any) => ({
        id: item.product_id,
        product_id: item.product_id,
        name: item.product_name,        // ✅ CORRIGIDO: product_name
        price: item.product_price,      // ✅ CORRIGIDO: product_price
        quantity: item.quantity,
        image: item.product_image,      // ✅ CORRIGIDO: product_image
      }));
      
      console.log("✅ Carrinho convertido para contexto:", items);
      setCart(items);
    } catch (error) {
      console.error("❌ Erro ao carregar carrinho:", error);
      setCart([]);
    } finally {
      setLoading(false);
    }
  }

  async function addToCart(product: CartItem) {
    try {
      await cartService.addToCart({
        product_id: product.product_id || product.id,
        quantity: product.quantity || 1,
      });
      
      await loadCart();
      toast.success("Produto adicionado ao carrinho!");
    } catch (error: any) {
      console.error("❌ Erro ao adicionar ao carrinho:", error);
      toast.error(error.message || "Erro ao adicionar produto");
    }
  }

  async function removeFromCart(productId: string) {
    try {
      await cartService.removeFromCart(productId);
      await loadCart();
      toast.success("Produto removido do carrinho");
    } catch (error: any) {
      console.error("❌ Erro ao remover do carrinho:", error);
      toast.error(error.message || "Erro ao remover produto");
    }
  }

  async function updateQuantity(productId: string, quantity: number) {
    try {
      await cartService.updateQuantity(productId, quantity);
      await loadCart();
    } catch (error: any) {
      console.error("❌ Erro ao atualizar quantidade:", error);
      toast.error(error.message || "Erro ao atualizar quantidade");
    }
  }

  function getTotalPrice(): number {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  function getTotalItems(): number {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }

  async function clearCart() {
    try {
      await cartService.clearCart();
      setCart([]);
      console.log("✅ Carrinho limpo");
    } catch (error) {
      console.error("❌ Erro ao limpar carrinho:", error);
    }
  }

  async function refreshCart() {
    await loadCart();
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        getTotalPrice,
        getTotalItems,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}