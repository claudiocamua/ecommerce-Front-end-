const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount?: number;
  discount_percentage?: number;
  stock: number;
  category: string;
  brand?: string;
  image_urls: string[];
  created_at: string;
}

interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  pages: number;
}

export const productsService = {
  async getProducts(params?: {
    skip?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Promise<ProductsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.skip !== undefined) queryParams.append("skip", params.skip.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.category) queryParams.append("category", params.category);
    if (params?.search) queryParams.append("search", params.search);

    const url = `${API_URL}/products/?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar produtos");
    }

    const data = await response.json();
    
    if (data.products && Array.isArray(data.products)) {
      data.products = data.products.map((p: any) => ({
        ...p,
        id: p._id || p.id,
        discount_percentage: p.discount_percentage || (p.discount ? p.discount * 100 : 0),
      }));
    }

    return data;
  },

  //Pegar produto por ID
  async getProductById(id: string): Promise<Product> {
    const response = await fetch(`${API_URL}/products/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Produto não encontrado");
    }

    const product = await response.json();
    
    return {
      ...product,
      id: product._id || product.id,
      discount_percentage: product.discount_percentage || (product.discount ? product.discount * 100 : 0),
    };
  },

  // Pegar ofertas
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
    
    if (data.products && Array.isArray(data.products)) {
      data.products = data.products.map((p: any) => ({
        ...p,
        id: p._id || p.id,
        discount_percentage: p.discount_percentage || (p.discount ? p.discount * 100 : 0),
      }));
    }

    return data;
  },
};