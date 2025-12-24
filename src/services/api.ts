import axios from "axios";

// Verificar variável de ambiente
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ecommerce-backend-qm1k.onrender.com";

console.log('🔍 Conectando ao backend:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    // Extrair mensagem de erro do backend
    const errorMessage = error.response?.data?.detail || error.message;
    return Promise.reject({
      ...error,
      detail: errorMessage,
    });
  }
);

export default api;