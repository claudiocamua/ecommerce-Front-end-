"use client";

import {
  ShoppingBag,
  ShoppingCart,
  Package,
  User,
} from "lucide-react";
import { ReactElement } from "react";

import QuickActionCard from "./QuickActionCard";

export interface QuickActionCardProps {
  href: string;
  icon: ReactElement;
  title: string;
  description: string;
}

export default function QuickActionsGrid() {
  const actions = [
    {
      href: "/products",
      icon: <ShoppingBag size={32} />,
      title: "Ver Produtos",
      description: "Explore nossa coleção completa",
    },
    {
      href: "/cart",
      icon: <ShoppingCart size={32} />,
      title: "Meu Carrinho",
      description: "Ver itens selecionados",
    },
    {
      href: "/orders",
      icon: <Package size={32} />,
      title: "Meus Pedidos",
      description: "Acompanhe suas compras",
    },
    {
      href: "/profile",
      icon: <User size={32} />,
      title: "Meu Perfil",
      description: "Editar informações",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {actions.map((action) => (
        <QuickActionCard key={action.href} {...action} />
      ))}
    </div>
  );
}
