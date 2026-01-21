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
  discount_percentage?: number; 
  discount?: number;             
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

      console.log(" Dados do carrinho recebidos:", data);

      if (data.items && data.items.length > 0) {
        console.log("🔍 Primeiro item do backend:", data.items[0]);
      }

      const items = data.items.map((item: any) => {
        const product = item.product || {}; 
        
        const mappedItem = {
          id: item.product_id || item.id,
          product_id: item.product_id || item.id,
          name: product.name || product.title || item.product_name,
          price: product.price || product.unit_price || item.product_price || 0,
          quantity: item.quantity || 1,
          image: product.image || product.picture_url || item.product_image,
          discount_percentage: product.discount_percentage ?? item.discount_percentage,
          discount: product.discount ?? item.discount,
        };
        
        console.log(" Item mapeado com desconto:", mappedItem);
        return mappedItem;
      });

      console.log(" Carrinho convertido para contexto:", items);
      setCart(items);
    } catch (error) {
      console.error(" Erro ao carregar carrinho:", error);
      setCart([]);
    } finally {
      setLoading(false);
    }
  }

  async function addToCart(product: CartItem) {
    try {
      await cartService.addToCart(
        product.product_id || product.id,
        product.quantity || 1
      );

      await loadCart();
      toast.success("Produto adicionado ao carrinho!");
    } catch (error: any) {
      console.error(" Erro ao adicionar ao carrinho:", error);
      toast.error(error.message || "Erro ao adicionar produto");
    }
  }

  async function removeFromCart(productId: string) {
    try {
      await cartService.removeFromCart(productId);
      await loadCart();
      toast.success("Produto removido do carrinho");
    } catch (error: any) {
      console.error(" Erro ao remover do carrinho:", error);
      toast.error(error.message || "Erro ao remover produto");
    }
  }

  async function updateQuantity(productId: string, quantity: number) {
    try {
      await cartService.updateCartItem(productId, quantity);
      await loadCart();
    } catch (error: any) {
      console.error(" Erro ao atualizar quantidade:", error);
      toast.error("Erro ao atualizar quantidade");
    }
  }

  function getTotalPrice(): number {
    // CALCULAR COM DESCONTO
    return cart.reduce((total, item) => {
      const discount = item.discount_percentage || item.discount || 0;
      const finalPrice = discount > 0 
        ? item.price * (1 - discount / 100) 
        : item.price;
      return total + (finalPrice * item.quantity);
    }, 0);
  }

  function getTotalItems(): number {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }

  async function clearCart() {
    try {
      await cartService.clearCart();
      setCart([]);
      console.log(" Carrinho limpo");
    } catch (error) {
      console.error(" Erro ao limpar carrinho:", error);
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