'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authStorage } from '@/lib/auth';
import { AuthToken } from '@/types/user';
import { toast } from 'react-hot-toast';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('access_token');
    const userStr = searchParams.get('user');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      const decodedError = decodeURIComponent(errorParam);
      setError(decodedError);
      toast.error(decodedError);
      return;
    }

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        const authData: AuthToken = {
          access_token: token,
          token_type: 'bearer',
          user,
        };
        authStorage.setAuth(authData);
        toast.success(`Bem-vindo, ${user.full_name || user.email}!`);
        router.push('/dashboard');
      } catch (err) {
        setError('Erro ao processar dados de autenticação');
        toast.error('Erro ao processar autenticação');
      }
    } else if (!errorParam) {
      setError('Dados de autenticação incompletos');
      toast.error('Dados de autenticação incompletos');
    }
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">!</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Erro na autenticação
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voltar para o Início
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">
            Autenticando...
          </h2>
          <p className="text-gray-600 mt-2">
            Aguarde enquanto processamos seu login
          </p>
        </div>
      </div>
    </div>
  );
}