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
    discount_percentage: "",
  });

  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // ✅ VALIDAR TAMANHO (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 5MB");
        return;
      }

      // ✅ VALIDAR TIPO
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error("Formato inválido. Use JPG, PNG, GIF ou WEBP");
        return;
      }

      console.log("📷 Imagem selecionada:", file.name, file.size, "bytes");
      setImage(file);
      toast.success(`Imagem selecionada: ${file.name}`);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // ✅ VALIDAÇÃO FRONTEND
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

    if (!formData.category) {
      toast.error("Selecione uma categoria");
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

      // ✅ FORMATO CORRETO PARA O BACKEND
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        discount_percentage: formData.discount_percentage 
          ? parseFloat(formData.discount_percentage) 
          : 0,
      };

      console.log("📤 Criando produto:", productData);

      const res = await fetch(`${baseURL}/products/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("❌ Erro do backend:", errorData);
        
        if (Array.isArray(errorData.detail)) {
          const errors = errorData.detail.map((e: any) => `${e.loc.join('.')}: ${e.msg}`).join(", ");
          throw new Error(errors);
        }
        
        throw new Error(errorData.detail || "Erro ao criar produto");
      }

      const product = await res.json();
      console.log("✅ Produto criado:", product);

      // ✅ Pegar ID correto (_id do MongoDB)
      const productId = product._id || product.id;

      if (!productId) {
        console.error("❌ ID do produto não encontrado:", product);
        toast.error("Produto criado, mas ID não retornado pelo backend");
        setLoading(false);
        return;
      }

      // ✅ Upload da imagem - CORRIGIDO
      if (image) {
        console.log("📤 Enviando imagem para produto ID:", productId);
        const imgFormData = new FormData();
        imgFormData.append("files", image); // ✅ Backend espera "files" (plural)

        try {
          // ✅ ROTA CORRETA: /products/{id}/images
          const uploadRoute = `${baseURL}/products/${productId}/images`;
          console.log(`📤 URL de upload: ${uploadRoute}`);
          
          const imgRes = await fetch(uploadRoute, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              // ✅ NÃO enviar Content-Type, deixar o browser definir com boundary
            },
            body: imgFormData,
          });

          const imgResponseText = await imgRes.text();
          console.log("📥 Resposta do upload:", imgResponseText);

          if (imgRes.ok) {
            const uploadResult = JSON.parse(imgResponseText);
            console.log("✅ Imagem enviada com sucesso!", uploadResult);
            toast.success("Produto e imagem salvos com sucesso!");
          } else {
            console.warn(`⚠️ Falha no upload (${imgRes.status}):`, imgResponseText);
            toast.error(`Produto criado, mas erro ao enviar imagem: ${imgResponseText}`);
          }
        } catch (err) {
          console.error("❌ Erro no upload da imagem:", err);
          toast.error("Produto criado, mas erro ao enviar imagem");
        }
      } else {
        toast.success("Produto cadastrado com sucesso!");
      }

      // ✅ Aguardar um pouco antes de redirecionar
      setTimeout(() => {
        router.push("/admin/products");
        router.refresh(); // ✅ Força refresh para ver o produto novo
      }, 1500);

    } catch (err: any) {
      console.error("❌ Erro:", err);
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
              placeholder="Descreva o produto com detalhes (material, características, benefícios)..."
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
            <label className="block mb-2 font-semibold">Categoria *</label>
            <select
              name="category"
              className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              onChange={handleChange}
              value={formData.category}
              required
            >
              <option value="">Selecione uma categoria</option>
              <option value="Moda">Moda</option>
              <option value="Moda Íntima">Moda Íntima</option>
              <option value="Infantil">Infantil</option>
              <option value="Vestidos">Vestidos</option>
              <option value="Blusas">Blusas</option>
              <option value="Calças">Calças</option>
              <option value="Acessórios">Acessórios</option>
              <option value="Camisas Masculinas">Camisas Masculinas</option>
              <option value="Relógios">Relógios</option>
            </select>
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
                💰 Preço com desconto: R$ {(
                  parseFloat(formData.price || "0") * 
                  (1 - parseFloat(formData.discount_percentage) / 100)
                ).toFixed(2)}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-2 font-semibold">
              Imagem do Produto <span className="text-gray-400 text-sm">- Opcional (máx 5MB)</span>
            </label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleImageChange}
              className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
            />
            {image && (
              <div className="mt-3 p-4 bg-green-900/20 border border-green-500 rounded-lg flex items-center gap-3">
                <div className="text-3xl">📷</div>
                <div>
                  <p className="text-sm text-green-400 font-semibold">✅ {image.name}</p>
                  <p className="text-xs text-green-300">
                    Tamanho: {(image.size / 1024).toFixed(2)} KB | Tipo: {image.type}
                  </p>
                </div>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Formatos aceitos: JPG, PNG, GIF, WEBP
            </p>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-700">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition"
            >
              {loading ? "⏳ Salvando..." : "💾 Cadastrar Produto"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              disabled={loading}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ❌ Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
