"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  UserPlusIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  UserIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

interface User {
  _id: string;
  id?: string; 
  email: string;
  full_name: string;
  name?: string; 
  is_active: boolean;
  is_verified: boolean;
  is_admin: boolean;
  role: string;
  created_at: string;
  oauth_provider?: string | null;
}

export default function UsuariosPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "customer",
    is_active: true,
    is_admin: false,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      let usersList: any[] = [];

      if (Array.isArray(data)) {
        usersList = data;
      } else if (data.users && Array.isArray(data.users)) {
        usersList = data.users;
      } else if (data.data && Array.isArray(data.data)) {
        usersList = data.data;
      } else {
        usersList = [];
      }

      //  Garantir que _id e full_name existam
      const normalizedUsers: User[] = usersList.map(user => ({
        _id: user._id || user.id, // Usar 'id' se '_id' não existir
        id: user.id,
        email: user.email || "",
        full_name: user.full_name || user.name || "Sem nome", // API retorna 'name' em vez de 'full_name'
        name: user.name,
        is_active: user.is_active ?? true,
        is_verified: user.is_verified ?? false,
        is_admin: user.is_admin ?? false,
        role: user.role || "customer",
        created_at: user.created_at || "",
        oauth_provider: user.oauth_provider,
      }));

      console.log(" Primeiro usuário normalizado:", normalizedUsers[0]);
      console.log(` ${normalizedUsers.length} usuários processados`);
      
      setUsers(normalizedUsers);
      
    } catch (error: any) {
      console.error(" ERRO COMPLETO:", error);
      toast.error(error.message || "Erro ao carregar usuários");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("access_token");
      
      //  LOG DE DEBUG
      console.log(" DEBUG handleCreateOrUpdate:");
      console.log("  editingUser:", editingUser);
      console.log("  editingUser?._id:", editingUser?._id);
      console.log("  editingUser?.id:", editingUser?.id);
      console.log("  formData:", formData);
      
      const userId = editingUser?._id || editingUser?.id;
      
      if (editingUser && !userId) {
        toast.error("Erro: ID do usuário não encontrado");
        console.error(" editingUser sem _id nem id:", editingUser);
        return;
      }
      
      const url = editingUser
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/users/`;

      const method = editingUser ? "PUT" : "POST";

      console.log(" URL da requisição:", url);
      console.log(" Método:", method);
      console.log(" User ID:", userId);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      console.log(" Status da resposta:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(" Erro da API:", errorData);
        throw new Error(errorData.detail || "Erro ao salvar usuário");
      }

      const result = await response.json();
      console.log(" Resposta da API:", result);

      toast.success(
        editingUser ? "Usuário atualizado!" : "Usuário criado com sucesso!"
      );
      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      console.error(" Erro ao salvar usuário:", error);
      toast.error(error.message || "Erro ao salvar usuário");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Erro ao excluir usuário");

      toast.success("Usuário excluído com sucesso!");
      fetchUsers();
    } catch (error: any) {
      console.error("Erro ao excluir usuário:", error);
      toast.error("Erro ao excluir usuário");
    }
  };

  const handleEdit = (user: User) => {
    console.log(" DEBUG handleEdit:");
    console.log("  user recebido:", user);
    console.log("  user._id:", user._id);
    console.log("  user.id:", user.id);
    
    //  Verificar se o usuário é válido
    if (!user || (!user._id && !user.id)) {
      toast.error("Erro: Dados do usuário inválidos");
      console.error(" user sem _id ou id:", user);
      return;
    }
    
    // Normalizar o usuário para garantir que _id exista
    const normalizedUser = {
      ...user,
      _id: user._id || user.id,
    };
    
    setEditingUser(normalizedUser);
    setFormData({
      full_name: user.full_name || user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "customer",
      is_active: user.is_active ?? true,
      is_admin: user.is_admin ?? false,
    });
    setShowModal(true);
    
    console.log(" editingUser definido:", normalizedUser);
  };

  // Reseta o formulário e o estado de edição
  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      password: "",
      role: "customer",
      is_active: true,
      is_admin: false,
    });
    setEditingUser(null);
  };

  // Filtra os usuários com base na busca e no filtro de função
  const filteredUsers = (Array.isArray(users) ? users : []).filter((user) => {
    if (!user) return false;
    
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      filterRole === "all" ||
      (filterRole === "admin" && user.is_admin) ||
      (filterRole === "manager" && user.role === "manager") ||
      (filterRole === "customer" && !user.is_admin && user.role === "customer");

    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white/50 p-6">
      <div className="max-w-7xl mx-auto">

        <div className="rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 px-3 py-2 text-white hover:text-yellow-600 transition-colors"
                title="Voltar"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Voltar</span>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <UserIcon className="w-8 h-8 text-yellow-600" />
                  Gerenciar Usuários 
                </h1>
                <p className="text-white mt-1">
                  Total de {users.length} usuários cadastrados
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlusIcon className="w-5 h-5" />
              Novo Usuário
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className=" rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os usuários</option>
              <option value="admin">Administradores</option>
              <option value="manager">Gerentes</option>
              <option value="customer">Clientes</option>
            </select>
          </div>
        </div>

        {/* Tabela */}
        <div className=" rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Cadastro
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className=" divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-white/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {/* Verificar se full_name existe */}
                              {user.full_name ? user.full_name.charAt(0).toUpperCase() : "?"}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">
                            {user.full_name || "Nome não informado"}
                          </div>
                          <div className="text-sm text-white">
                            {user.email || "Email não informado"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.is_admin ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          <ShieldCheckIcon className="w-4 h-4 mr-1" />
                          Admin
                        </span>
                      ) : user.role === "manager" ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Gerente
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Cliente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.is_active ? "Ativo" : "Inativo"}
                        </span>
                        {user.is_verified && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            Verificado
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {user.created_at 
                        ? new Date(user.created_at).toLocaleDateString("pt-BR")
                        : "Data não disponível"
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        title="Editar usuário"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Excluir usuário"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Nenhum usuário encontrado
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Tente ajustar os filtros ou criar um novo usuário.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Criar/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/30 rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingUser ? "Editar Usuário" : "Novo Usuário"}
            </h2>

            <form onSubmit={handleCreateOrUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha {editingUser && "(deixe vazio para manter)"}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  minLength={6}
                  required={!editingUser}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Usuário
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="customer">Cliente</option>
                  <option value="manager">Gerente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm">Usuário Ativo</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_admin}
                    onChange={(e) =>
                      setFormData({ ...formData, is_admin: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm">Admin</span>
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingUser ? "Atualizar" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}