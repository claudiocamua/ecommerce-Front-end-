import api from "./api";

interface Product {
  id: string;
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
  is_active: boolean;
  discount_percentage?: number;
  created_at: string;
  updated_at: string;
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

interface ProductsParams {
  skip?: number;
  limit?: number;
  category?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  is_active?: boolean;
}

export const productsService = {
  // GET /products
  async getProducts(params?: ProductsParams) {
    try {
      const response = await api.get("/products", { params });
      return response.data;
    } catch (error: any) {
      throw error.response?.data;
    }
  },

  // GET /products/{id}
  async getProductById(id: string): Promise<Product> {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data;
    }
  },

  // POST /products (Admin)
  async createProduct(data: ProductCreate): Promise<Product> {
    try {
      const response = await api.post("/products", data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data;
    }
  },

  // PUT /products/{id} (Admin)
  async updateProduct(id: string, data: Partial<ProductCreate>): Promise<Product> {
    try {
      const response = await api.put(`/products/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data;
    }
  },

  // DELETE /products/{id} (Admin)
  async deleteProduct(id: string) {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data;
    }
  },

  // GET /products/categories
  async getCategories() {
    try {
      const response = await api.get("/products/categories");
      return response.data;
    } catch (error: any) {
      throw error.response?.data;
    }
  },
};