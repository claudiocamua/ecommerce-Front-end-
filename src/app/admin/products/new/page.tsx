"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { authService } from "../../../services/auth";

export default function NewProductPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    gender: "",
    brand: "", 
    discount_percentage: "",
  });

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const categoriesByGender: Record<string, string[]> = {
    "Masculino": [
      "Camisas", "Camisetas", "Polos", "Calças", "Bermudas", "Jeans",
      "Moletons", "Jaquetas", "Ternos", "Cuecas", "Meias", "Tênis",
      "Sapatos Sociais", "Chinelos", "Relógios", "Bonés", "Carteiras",
      "Cintos", "Óculos",
    ],
    "Feminino": [
      "Vestidos", "Blusas", "Camisetas", "Tops", "Calças", "Jeans",
      "Saias", "Shorts", "Macacões", "Casacos", "Jaquetas", "Lingerie",
      "Sutiãs", "Calcinhas", "Meias-calças", "Sapatos", "Sandálias",
      "Tênis", "Bolsas", "Relógios", "Colares", "Brincos", "Anéis", "Óculos",
    ],
    "Infantil": ["Roupas Masculinas", "Roupas Femininas", "Calçados", "Acessórios"],
    "Unissex": ["Relógios", "Óculos", "Mochilas", "Acessórios"],
  };

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    
    if (name === "gender") {
      setFormData((prev) => ({ ...prev, [name]: value, category: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 5MB");
        return;
      }

      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error("Formato inválido. Use JPG, PNG, GIF ou WEBP");
        return;
      }

      console.log("📷 Imagem selecionada:", file.name, file.size, "bytes");
      setImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      toast.success(`Imagem selecionada: ${file.name}`);
    }
  }

  function removeImage() {
    setImage(null);
    setImagePreview(null);
    toast.info("Imagem removida");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (formData.name.length < 3) {
      toast.error("O nome deve ter no mínimo 3 caracteres");
      return;
    }

    if (formData.description.length < 10) {
      toast.error("A descrição deve ter no mínimo 10 caracteres");
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error("O preço deve ser maior que zero");
      return;
    }

    if (!formData.stock || parseInt(formData.stock) < 0) {
      toast.error("O estoque não pode ser negativo");
      return;
    }

    if (!formData.gender) {
      toast.error("Selecione o gênero");
      return;
    }

    if (!formData.category) {
      toast.error("Selecione uma categoria");
      return;
    }

    if (!image) {
      toast.error("Selecione pelo menos uma imagem do produto!");
      return;
    }

    setLoading(true);

    const token = authService.getToken();

    if (!token) {
      toast.error("Usuário não autenticado");
      setLoading(false);
      router.push("/auth");
      return;
    }

    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      //  CRIAR FormData COM TODOS OS CAMPOS
      const productFormData = new FormData();
      
      productFormData.append("name", formData.name.trim());
      productFormData.append("description", formData.description.trim());
      productFormData.append("price", formData.price);
      productFormData.append("stock", formData.stock);
      productFormData.append("category", `${formData.gender} - ${formData.category}`);
      productFormData.append("brand", formData.brand || "Sem marca");
      productFormData.append("discount_percentage", formData.discount_percentage || "0");
      
      //  ADICIONAR IMAGEM (OBRIGATÓRIO)
      productFormData.append("images", image);

      console.log("📤 Criando produto com FormData:");
      console.log("- Nome:", formData.name);
      console.log("- Preço:", formData.price);
      console.log("- Categoria:", `${formData.gender} - ${formData.category}`);
      console.log("- Imagem:", image.name);

      const res = await fetch(`${baseURL}/products/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: productFormData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error(" Erro do backend:", errorData);
        
        if (Array.isArray(errorData.detail)) {
          const errors = errorData.detail.map((e: any) => `${e.loc.join('.')}: ${e.msg}`).join(", ");
          throw new Error(errors);
        }
        
        throw new Error(errorData.detail || "Erro ao criar produto");
      }

      const product = await res.json();
      console.log(" Produto criado com sucesso:", product);

      toast.success(" Produto cadastrado com sucesso!");

      setTimeout(() => {
        router.push("/admin/products");
        router.refresh();
      }, 1500);

    } catch (err: any) {
      console.error(" Erro:", err);
      toast.error(err.message || "Erro ao salvar produto");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">➕ Novo Produto</h1>
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            ← Voltar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 space-y-6">
          <div>
            <label className="block mb-2 font-semibold">
              Nome do Produto * <span className="text-sm text-gray-400">(mínimo 3 caracteres)</span>
            </label>
            <input
              name="name"
              type="text"
              placeholder="Ex: Camisa Polo Azul"
              className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              onChange={handleChange}
              value={formData.name}
              required
              minLength={3}
            />
            <p className="text-sm text-gray-400 mt-1">
              {formData.name.length}/3 caracteres
            </p>
          </div>

          <div>
            <label className="block mb-2 font-semibold">
              Descrição * <span className="text-sm text-gray-400">(mínimo 10 caracteres)</span>
            </label>
            <textarea
              name="description"
              placeholder="Descreva o produto com detalhes..."
              className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              onChange={handleChange}
              value={formData.description}
              rows={4}
              required
              minLength={10}
            />
            <p className="text-sm text-gray-400 mt-1">
              {formData.description.length}/10 caracteres
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-semibold">Preço (R$) *</label>
              <input
                name="price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                onChange={handleChange}
                value={formData.price}
                required
              />
              {formData.price && (
                <p className="text-sm text-green-400 mt-1">
                  R$ {parseFloat(formData.price).toFixed(2)}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 font-semibold">Estoque *</label>
              <input
                name="stock"
                type="number"
                min="0"
                placeholder="0"
                className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                onChange={handleChange}
                value={formData.stock}
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-semibold">Gênero *</label>
            <select
              name="gender"
              className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              onChange={handleChange}
              value={formData.gender}
              required
            >
              <option value="">Selecione o gênero</option>
              <option value="Masculino"> Masculino</option>
              <option value="Feminino"> Feminino</option>
              <option value="Infantil"> Infantil</option>
              <option value="Unissex"> Unissex</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-semibold">Categoria *</label>
            <select
              name="category"
              className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg text-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
              onChange={handleChange}
              value={formData.category}
              required
              disabled={!formData.gender}
            >
              <option value="">
                {formData.gender ? "Selecione uma categoria" : "Primeiro selecione o gênero"}
              </option>
              {formData.gender && categoriesByGender[formData.gender]?.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {formData.gender && formData.category && (
              <p className="text-sm text-blue-400 mt-1">
                 Categoria completa: {formData.gender} - {formData.category}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-2 font-semibold">Marca <span className="text-gray-400 text-sm">- Opcional</span></label>
            <input
              name="brand"
              type="text"
              placeholder="Ex: Nike, Adidas..."
              className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              onChange={handleChange}
              value={formData.brand}
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">Desconto (%) <span className="text-gray-400 text-sm">- Opcional</span></label>
            <input
              name="discount_percentage"
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="0"
              className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              onChange={handleChange}
              value={formData.discount_percentage}
            />
            {formData.discount_percentage && parseFloat(formData.discount_percentage) > 0 && (
              <p className="text-sm text-yellow-400 mt-1">
                 Preço com desconto: R$ {(
                  parseFloat(formData.price || "0") * 
                  (1 - parseFloat(formData.discount_percentage) / 100)
                ).toFixed(2)}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-2 font-semibold">
              Imagem do Produto * <span className="text-sm text-red-400">(OBRIGATÓRIO - máx 5MB)</span>
            </label>
            
            {!imagePreview ? (
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  id="image-upload"
                  className="hidden"
                  required
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-6xl">img</div>
                    <div>
                      <p className="text-lg font-semibold text-blue-400">
                        Clique para selecionar uma imagem
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        JPG, PNG, GIF, WEBP - máx 5MB
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            ) : (
              <div className="relative">
                <div className="relative w-full h-64 bg-gray-700 rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                >
                   Remover
                </button>
                {image && (
                  <div className="mt-3 p-3 bg-green-900/20 border border-green-500 rounded-lg">
                    <p className="text-sm text-green-400 font-semibold"> {image.name}</p>
                    <p className="text-xs text-green-300">
                      Tamanho: {(image.size / 1024).toFixed(2)} KB | Tipo: {image.type}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-700">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition"
            >
              {loading ? " Salvando..." : " Cadastrar Produto"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              disabled={loading}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
               Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
