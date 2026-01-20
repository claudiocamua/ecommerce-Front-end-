import axios from 'axios';
import { authStorage } from '@/lib/auth';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

//INTERCEPTOR PARA ADICIONAR TOKEN
api.interceptors.request.use(
  (config) => {
    const token = authStorage.getToken();
    
    console.log(' [AXIOS] URL:', config.url);
    console.log(' [AXIOS] Token encontrado:', !!token);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(' [AXIOS] Token adicionado!');
    } else {
      console.warn(' [AXIOS] Nenhum token encontrado no localStorage!');
    }
    
    return config;
  },
  (error) => {
    console.error(' [AXIOS] Erro no interceptor:', error);
    return Promise.reject(error);
  }
);

export default api;