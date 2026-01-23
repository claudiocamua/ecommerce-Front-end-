import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "";

console.log(" Variáveis de ambiente:");
console.log("NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);
console.log("NEXT_PUBLIC_BACKEND_URL:", process.env.NEXT_PUBLIC_BACKEND_URL);
console.log(" API_URL final:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

    console.log(" Requisição:", {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + "..." : null,
    });

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn(" Nenhum token encontrado no localStorage!");
    }

    return config;
  },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (response) => {
    console.log(" Resposta:", { url: response.config.url, status: response.status });
    return response;
  },
  (error) => {
    console.error(" Erro na requisição:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.detail || error.message,
    });
    return Promise.reject(error);
  }
);

export default api;