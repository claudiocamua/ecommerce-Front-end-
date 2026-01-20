import api from "./api";

export const uploadsService = {

  async uploadProductImage(product_id: string, file: File) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post(`/uploads/products/${product_id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error: any) {
      throw error.response?.data;
    }
  },

  async uploadMultipleImages(product_id: string, files: File[]) {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await api.post(`/uploads/multiple/${product_id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error: any) {
      throw error.response?.data;
    }
  },

  async deleteImage(filename: string) {
    try {
      const response = await api.delete(`/uploads/${filename}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data;
    }
  },
};