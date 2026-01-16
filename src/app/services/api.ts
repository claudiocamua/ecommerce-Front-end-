import axios from "axios";

const isDevelopment = process.env.NODE_ENV === 'development';

const api = axios.create({
  baseURL: isDevelopment 
    ? "/api"
    : process.env.NEXT_PUBLIC_API_URL || "https://ecommerce-backend-qm1k.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ✅ INTERCEPTOR COM LOGS PARA DEBUG
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  
  console.log("📤 Requisição:", {
    url: config.url,
    method: config.method,
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 20) + "..." : null,
  });
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn("⚠️ Nenhum token encontrado no localStorage!");
  }
  
  return config;
});

// ✅ INTERCEPTOR DE RESPOSTA PARA DEBUG
api.interceptors.response.use(
  (response) => {
    console.log("✅ Resposta:", {
      url: response.config.url,
      status: response.status,
    });
    return response;
  },
  (error) => {
    console.error("❌ Erro na requisição:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.detail || error.message,
    });
    return Promise.reject(error);
  }
);

export default api;