"use client";

import { ReactElement } from "react";

interface QuickActionCardProps {
  href: string;
  icon: ReactElement;
  title: string;
  description: string;
}

export default function QuickActionCard({
  href,
  icon,
  title,
  description,
}: QuickActionCardProps) {
  return (
    <a
      href={href}
      className="bg-cartao rounded-xl shadow-md hover:shadow-xl transition-all p-6 text-center group border border-borda"
    >
      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-texto mb-2">{title}</h3>
      <p className="text-sm text-neutro-frente">{description}</p>
    </a>
  );
}