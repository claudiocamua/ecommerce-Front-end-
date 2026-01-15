import { API_URL } from "./api";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  stock: number;
  category: string;
  brand: string;
  image_urls: string[];
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface ProductsParams {
  skip?: number;
  limit?: number;
  category?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  is_active?: boolean;
  page?: number;
  page_size?: number;
}

interface ProductCreate {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  brand?: string;
  sku?: string;
  sizes?: string[];
  colors?: string[];
  images?: string[];
  is_active?: boolean;
  discount_percentage?: number;
}

// ✅ FUNÇÃO HELPER: Obter URL da imagem do produto usando o ID do produto
function getProductImageUrl(productId: string): string {
  return `${API_URL}/images/${productId}`;
}

// ✅ FUNÇÃO HELPER: Obter primeira imagem ou usar endpoint dedicado
function getProductImage(product: Product): string {
  // SEMPRE usar o endpoint /images/{product_id} que retorna a primeira imagem
  return getProductImageUrl(product.id);
}

// ✅ FUNÇÃO PARA NORMALIZAR PRODUTO
function normalizeProduct(product: any): Product {
  return {
    ...product,
    // Manter image_urls original do backend para referência
    image_urls: product.image_urls || [],
  };
}

export const productsService = {
  // ✅ FUNÇÃO PÚBLICA: Obter URL da imagem
  getProductImageUrl,
  getProductImage,

  // GET /products
  async getProducts(params?: ProductsParams): Promise<ProductsResponse | Product[]> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size) queryParams.append("page_size", params.page_size.toString());
    if (params?.category) queryParams.append("category", params.category);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.min_price) queryParams.append("min_price", params.min_price.toString());
    if (params?.max_price) queryParams.append("max_price", params.max_price.toString());

    const url = `${API_URL}/products?${queryParams.toString()}`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar produtos");
    }

    const data = await response.json();
    
    // ✅ Normalizar produtos (array ou objeto)
    if (Array.isArray(data)) {
      return data.map(normalizeProduct);
    } else if (data?.products) {
      return {
        ...data,
        products: data.products.map(normalizeProduct),
      };
    }

    return data;
  },

  // GET /products/offers
  async getOffers(params?: {
    page?: number;
    page_size?: number;
    sort_by?: "discount_percentage" | "price" | "created_at";
    sort_order?: "asc" | "desc";
  }): Promise<ProductsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size) queryParams.append("page_size", params.page_size.toString());
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

    const url = `${API_URL}/products/offers?${queryParams.toString()}`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar ofertas");
    }

    const data = await response.json();
    
    // ✅ Normalizar ofertas
    if (data?.products) {
      return {
        ...data,
        products: data.products.map(normalizeProduct),
      };
    }

    return data;
  },

  // GET /products/{id}
  async getProductById(id: string): Promise<Product> {
    const url = `${API_URL}/products/${id}`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar produto");
    }

    const data = await response.json();
    return normalizeProduct(data);
  },

  // POST /products (Admin)
  async createProduct(data: ProductCreate): Promise<Product> {
    const token = localStorage.getItem("access_token");
    
    const response = await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Erro ao criar produto");
    }

    const product = await response.json();
    return normalizeProduct(product);
  },

  // PUT /products/{id} (Admin)
  async updateProduct(id: string, data: Partial<ProductCreate>): Promise<Product> {
    const token = localStorage.getItem("access_token");
    
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Erro ao atualizar produto");
    }

    const product = await response.json();
    return normalizeProduct(product);
  },
};