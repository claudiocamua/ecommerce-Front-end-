"use client";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

type Props = {
  open: boolean;
  type: "login" | "register";
  onClose: () => void;
};

export default function ModalAuth({ open, type, onClose }: Props) {
  if (!open) return null;

  return (
    <div className=" inset-0 z-[100] flex items-center justify-center p-4">
      <button
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        className="relative bg-fundo flex flex-col border border-borda w-full rounded-none md:w-[540px] md:max-w-[90vw] md:rounded-2xl"
      >
        <div className="flex items-center justify-between p-4 border-b border-borda">
          <h2 className="font-display text-xl text-center w-full text-white">
            {type === "login" ? "Entrar" : "Criar Conta"}
          </h2>
          <button onClick={onClose} className="botao botao--fantasma">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4">
          {type === "login" ? <LoginForm /> : <RegisterForm />}
        </div>
      </motion.div>
    </div>
  );
}
