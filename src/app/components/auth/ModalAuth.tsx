"use client";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  type: "login" | "register";
  onClose: () => void;
};

export default function ModalAuth({ open, type, onClose }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      window.scrollTo(0, 0);
      
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      // Fechar com ESC
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEscape);

      return () => {
        document.documentElement.style.overflow = '';
        document.documentElement.style.paddingRight = '';
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const modalContent = (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
        }}
      />

      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflowY: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '100px 16px 16px 16px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.95 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          className="bg-fundo border border-borda w-full max-w-[520px] rounded-2xl shadow-2xl"
          style={{ position: 'relative' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-borda">
            <h2 className="font-display text-lg sm:text-xl text-white text-center w-full">
              {type === "login" ? "Entrar" : "Criar Conta"}
            </h2>
            <button 
              onClick={onClose} 
              className="botao botao--fantasma"
              aria-label="Fechar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Conteúdo */}
          <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto">
            {type === "login" ? <LoginForm /> : <RegisterForm />}
          </div>
        </motion.div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
