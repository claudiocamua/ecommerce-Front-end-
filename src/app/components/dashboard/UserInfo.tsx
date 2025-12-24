"use client";

import {
  Mail,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Clock,
  Calendar,
} from "lucide-react";

interface User {
  email: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

interface UserInfoProps {
  user: User;
}

export default function UserInfo({ user }: UserInfoProps) {
  return (
    <div className="bg-cartao rounded-xl shadow-md p-6 mb-8  border-borda">
      <h2 className="text-2xl font-bold text-center text-texto mb-6">
        Suas Informações
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-6">

     
        <div className="flex items-start gap-4 border-l-4 border-primario pl-4">
          <Mail className="text-primario mt-1" size={22} />
          <div>
            <p className="text-sm text-neutro-frente mb-1">Email</p>
            <p className="font-semibold text-texto">{user.email}</p>
          </div>
        </div>

       
        <div className="flex items-start gap-4 border-l-4 border-green-600 pl-4">
          {user.is_active ? (
            <CheckCircle className="text-green-600 mt-1" size={22} />
          ) : (
            <XCircle className="text-red-600 mt-1" size={22} />
          )}
          <div>
            <p className="text-sm text-neutro-frente mb-1">Status da Conta</p>
            <p className={`font-semibold ${
              user.is_active ? "text-green-600" : "text-red-600"
            }`}>
              {user.is_active ? "Ativa" : "Inativa"}
            </p>
          </div>
        </div>

        {/* EMAIL VERIFICADO */}
        <div className="flex items-start gap-4 border-l-4 border-purple-600 pl-4">
          {user.is_verified ? (
            <ShieldCheck className="text-purple-600 mt-1" size={22} />
          ) : (
            <Clock className="text-yellow-600 mt-1" size={22} />
          )}
          <div>
            <p className="text-sm text-neutro-frente mb-1">Email Verificado</p>
            <p className="font-semibold text-texto">
              {user.is_verified ? "Verificado" : "Pendente"}
            </p>
          </div>
        </div>

  
        <div className="flex items-start gap-4 border-l-4 border-orange-600 pl-4">
          <Calendar className="text-orange-600 mt-1" size={22} />
          <div>
            <p className="text-sm text-neutro-frente mb-1">Membro desde</p>
            <p className="font-semibold text-texto">
              {new Date(user.created_at).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
