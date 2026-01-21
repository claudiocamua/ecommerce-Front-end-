import type { Metadata } from "next";
import "./globals.css";
import ToasterProvider from "@/app/components/ToasterProvider";
import { CartProvider } from "./context/CartContext";



export const metadata: Metadata = {
  title: "E-commerce",
  description: "Loja online moderna",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={undefined}>
        <CartProvider>
          {children}
        </CartProvider>
        
        <ToasterProvider />
      </body>
    </html>
  );
}
