"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "react-hot-toast"
import { authService } from "../../../../services/auth"

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    discount_percentage: "0", // ✅ CORRIGIDO: era "discount"
  })

  const [image, setImage] = useState<File | null>(null)
  const [currentImages, setCurrentImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProduct()
  }, [])

  async function loadProduct() {
    try {
      const token = authService.getToken()
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

      console.log("📡 Carregando produto:", productId)

      // ✅ BUSCAR PRODUTO DIRETO POR ID
      const res = await fetch(`${baseURL}/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.ok) {
        const product = await res.json()
        console.log("✅ Produto carregado:", product)

        // ✅ PROTEÇÃO DE VALORES UNDEFINED
        setFormData({
          name: product.name || "",
          description: product.description || "",
          price: product.price?.toString() || "0",
          stock: product.stock?.toString() || "0",
          category: product.category || "",
          discount_percentage: product.discount_percentage?.toString() || "0",
        })
        setCurrentImages(product.image_urls || [])
      } else {
        toast.error("Produto não encontrado")
        router.push("/admin/products")
      }
    } catch (err) {
      console.error("❌ Erro:", err)
      toast.error("Erro ao carregar produto")
      router.push("/admin/products")
    } finally {
      setLoading(false)
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0])
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const token = authService.getToken()

    if (!token) {
      toast.error("Usuário não autenticado")
      setSaving(false)
      return
    }

    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

      // ✅ DADOS CORRETOS PARA ATUALIZAÇÃO
      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        stock: Number(formData.stock),
        category: formData.category,
        discount_percentage: Number(formData.discount_percentage),
      }

      console.log("📤 Atualizando produto:", productData)

      const res = await fetch(`${baseURL}/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        console.error("❌ Erro do backend:", errorData)
        throw new Error(errorData.detail || "Erro ao atualizar produto")
      }

      const updatedProduct = await res.json()
      console.log("✅ Produto atualizado:", updatedProduct)

      // ✅ UPLOAD DE IMAGEM (se houver)
      if (image) {
        console.log("📤 Enviando nova imagem...")
        const imgFormData = new FormData()
        imgFormData.append("file", image)

        // ✅ CORRIGIDO: URL correta para upload
        const imgRes = await fetch(`${baseURL}/uploads/products/${productId}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: imgFormData,
        })

        if (!imgRes.ok) {
          const imgError = await imgRes.json()
          console.error("⚠️ Erro ao enviar imagem:", imgError)
          toast.error("Produto atualizado, mas falha ao enviar imagem")
        } else {
          console.log("✅ Imagem enviada com sucesso")
        }
      }

      toast.success("Produto atualizado com sucesso!")
      router.push("/admin/products")
    } catch (err: any) {
      console.error("❌ Erro:", err)
      toast.error(err.message || "Erro ao atualizar produto")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-white mt-4">Carregando produto...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">✏️ Editar Produto</h1>

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 space-y-6">
          <div>
            <label className="block mb-2 font-semibold">Nome do Produto *</label>
            <input
              name="name"
              placeholder="Nome do produto"
              className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg text-white"
              onChange={handleChange}
              value={formData.name}
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">Descrição *</label>
            <textarea
              name="description"
              placeholder="Descrição"
              className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg text-white"
              onChange={handleChange}
              value={formData.description}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-semibold">Preço (R$) *</label>
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="Preço"
                className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg text-white"
                onChange={handleChange}
                value={formData.price}
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">Estoque *</label>
              <input
                name="stock"
                type="number"
                min="0"
                placeholder="Estoque"
                className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg text-white"
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
              className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg text-white"
              onChange={handleChange}
              value={formData.category}
              required
            >
              <option value="">Selecione uma categoria</option>
              <optgroup label="👗 Feminino">
                <option value="Vestidos">Vestidos</option>
                <option value="Blusas Femininas">Blusas Femininas</option>
                <option value="Shorts Femininos">Shorts Femininos</option>
                <option value="Calças Femininas">Calças Femininas</option>
                <option value="Saias">Saias</option>
                <option value="Conjuntos Femininos">Conjuntos Femininos</option>
              </optgroup>
              <optgroup label="👔 Masculino">
                <option value="Camisas Masculinas">Camisas Masculinas</option>
                <option value="Camisetas Masculinas">Camisetas Masculinas</option>
                <option value="Calças Masculinas">Calças Masculinas</option>
                <option value="Shorts Masculinos">Shorts Masculinos</option>
                <option value="Bermudas">Bermudas</option>
                <option value="Conjuntos Masculinos">Conjuntos Masculinos</option>
              </optgroup>
              <optgroup label="👟 Calçados">
                <option value="Calçados Femininos">Calçados Femininos</option>
                <option value="Calçados Masculinos">Calçados Masculinos</option>
                <option value="Tênis">Tênis</option>
                <option value="Sandálias">Sandálias</option>
                <option value="Sapatos">Sapatos</option>
              </optgroup>
              <optgroup label="⌚ Acessórios">
                <option value="Acessórios Femininos">Acessórios Femininos</option>
                <option value="Acessórios Masculinos">Acessórios Masculinos</option>
                <option value="Relógios">Relógios</option>
                <option value="Óculos">Óculos</option>
                <option value="Bolsas">Bolsas</option>
              </optgroup>
              <optgroup label="📱 Eletrônicos">
                <option value="Smartphones">Smartphones</option>
                <option value="Fones de Ouvido">Fones de Ouvido</option>
                <option value="Smartwatch">Smartwatch</option>
              </optgroup>
              <option value="Outros">Outros</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-semibold">Desconto (%)</label>
            <input
              name="discount_percentage"
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="0"
              className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg text-white"
              onChange={handleChange}
              value={formData.discount_percentage}
            />
          </div>

          {currentImages.length > 0 && (
            <div>
              <label className="block mb-2 font-semibold">Imagens Atuais</label>
              <div className="grid grid-cols-3 gap-2">
                {currentImages.map((url, index) => (
                  <img
                    key={index}
                    src={url.startsWith('http') ? url : `http://localhost:8000${url}`}
                    alt={`Imagem ${index + 1}`}
                    className="w-full h-24 object-cover rounded border border-gray-600"
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block mb-2 font-semibold">Nova Imagem</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
            {image && <p className="mt-2 text-sm text-green-400">✅ {image.name}</p>}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
            >
              {saving ? "⏳ Salvando..." : "💾 Atualizar Produto"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
            >
              ❌ Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}