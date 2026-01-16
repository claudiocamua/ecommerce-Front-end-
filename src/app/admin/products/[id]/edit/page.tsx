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
    gender: "",
    discount_percentage: "0",
  })

  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null) 
  const [currentImages, setCurrentImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // CATEGORIAS POR GÊNERO
  const categoriesByGender: Record<string, string[]> = {
    "Masculino": [
      "Camisas",
      "Camisetas",
      "Polos",
      "Calças",
      "Bermudas",
      "Jeans",
      "Moletons",
      "Jaquetas",
      "Ternos",
      "Cuecas",
      "Meias",
      "Tênis",
      "Sapatos Sociais",
      "Chinelos",
      "Relógios",
      "Bonés",
      "Carteiras",
      "Cintos",
      "Óculos",
    ],
    "Feminino": [
      "Vestidos",
      "Blusas",
      "Camisetas",
      "Tops",
      "Calças",
      "Jeans",
      "Saias",
      "Shorts",
      "Macacões",
      "Casacos",
      "Jaquetas",
      "Lingerie",
      "Sutiãs",
      "Calcinhas",
      "Meias-calças",
      "Sapatos",
      "Sandálias",
      "Tênis",
      "Bolsas",
      "Relógios",
      "Colares",
      "Brincos",
      "Anéis",
      "Óculos",
    ],
    "Infantil": [
      "Roupas Masculinas",
      "Roupas Femininas",
      "Calçados",
      "Acessórios",
    ],
    "Unissex": [
      "Relógios",
      "Óculos",
      "Mochilas",
      "Acessórios",
    ],
  }

  useEffect(() => {
    loadProduct()
  }, [])

  async function loadProduct() {
    try {
      const token = authService.getToken()
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

      console.log("📡 Carregando produto:", productId)

      const res = await fetch(`${baseURL}/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.ok) {
        const product = await res.json()
        console.log(" Produto carregado:", product)

        //  SEPARAR GÊNERO DA CATEGORIA (ex: "Masculino - Camisas")
        const categoryParts = product.category?.split(" - ") || ["", ""]
        const gender = categoryParts[0] || ""
        const category = categoryParts[1] || product.category || ""

        setFormData({
          name: product.name || "",
          description: product.description || "",
          price: product.price?.toString() || "0",
          stock: product.stock?.toString() || "0",
          gender: gender,
          category: category,
          discount_percentage: product.discount_percentage?.toString() || "0",
        })
        setCurrentImages(product.image_urls || [])
      } else {
        toast.error("Produto não encontrado")
        router.push("/admin/products")
      }
    } catch (err) {
      console.error(" Erro:", err)
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
    
    //  Se mudar o gênero, limpar categoria
    if (name === "gender") {
      setFormData((prev) => ({ ...prev, [name]: value, category: "" }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 5MB")
        return
      }

      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
      if (!validTypes.includes(file.type)) {
        toast.error("Formato inválido. Use JPG, PNG, GIF ou WEBP")
        return
      }

      setImage(file)
    
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      
      toast.success(`Imagem selecionada: ${file.name}`)
    }
  }

  function removeImage() {
    setImage(null)
    setImagePreview(null)
    toast.info("Nova imagem removida")
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

      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        stock: Number(formData.stock),
        category: `${formData.gender} - ${formData.category}`, 
        discount_percentage: Number(formData.discount_percentage),
      }

      console.log(" Atualizando produto:", productData)

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
        console.error(" Erro do backend:", errorData)
        throw new Error(errorData.detail || "Erro ao atualizar produto")
      }

      const updatedProduct = await res.json()
      console.log(" Produto atualizado:", updatedProduct)

      if (image) {
        console.log(" Enviando nova imagem...")
        const imgFormData = new FormData()
        imgFormData.append("files", image) 

        try {
          const uploadRoute = `${baseURL}/products/${productId}/images`
          
          const imgRes = await fetch(uploadRoute, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: imgFormData,
          })

          if (imgRes.ok) {
            console.log(" Imagem enviada com sucesso")
            toast.success("Produto e imagem atualizados!")
          } else {
            const imgError = await imgRes.text()
            console.error(" Erro ao enviar imagem:", imgError)
            toast.error("Produto atualizado, mas falha ao enviar imagem")
          }
        } catch (imgErr) {
          console.error(" Erro no upload:", imgErr)
          toast.error("Produto atualizado, mas falha ao enviar imagem")
        }
      } else {
        toast.success("Produto atualizado com sucesso!")
      }

      setTimeout(() => {
        router.push("/admin/products")
        router.refresh()
      }, 1500)

    } catch (err: any) {
      console.error(" Erro:", err)
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold"> Editar Produto</h1>
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
            <label className="block mb-2 font-semibold">Nome do Produto *</label>
            <input
              name="name"
              placeholder="Nome do produto"
              className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg text-white focus:border-blue-500 focus:outline-none"
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
              className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg text-white focus:border-blue-500 focus:outline-none"
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
                className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg text-white focus:border-blue-500 focus:outline-none"
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

          {/*  CATEGORIAS DINÂMICAS */}
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
            <label className="block mb-2 font-semibold">Desconto (%)</label>
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

          {/* ✨ IMAGENS ATUAIS */}
          {currentImages.length > 0 && (
            <div>
              <label className="block mb-2 font-semibold">Imagens Atuais</label>
              <div className="grid grid-cols-3 gap-2">
                {currentImages.map((url, index) => (
                  <img
                    key={index}
                    src={url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL}${url}`}
                    alt={`Imagem ${index + 1}`}
                    className="w-full h-24 object-cover rounded border border-gray-600"
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block mb-2 font-semibold">Nova Imagem</label>
            
            {!imagePreview ? (
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  id="new-image-upload"
                  className="hidden"
                />
                <label htmlFor="new-image-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-6xl">img</div>
                    <div>
                      <p className="text-lg font-semibold text-blue-400">
                        Clique para adicionar nova imagem
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
                    alt="Preview nova imagem"
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
              disabled={saving}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold transition"
            >
              {saving ? " Salvando..." : " Atualizar Produto"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              disabled={saving}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
               Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}