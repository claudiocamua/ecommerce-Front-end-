"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/app/services/auth";
import { toast } from "react-hot-toast";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  UserIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  EnvelopeIcon,
  KeyIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";

type UserRole = "user" | "manager" | "admin";

interface User {
  _id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  is_admin?: boolean;
  created_at: string;
  last_login?: string;
  permissions?: string[];
}

const roleLabels: Record<UserRole, string> = {
  user: "Usuário",
  manager: "Gerente",
  admin: "Administrador",
};

const roleColors: Record<UserRole, string> = {
  user: "bg-gray-100 text-gray-800",
  manager: "bg-blue-100 text-blue-800",
  admin: "bg-purple-100 text-purple-800",
};

const roleIcons: Record<UserRole, any> = {
  user: UserIcon,
  manager: UserGroupIcon,
  admin: ShieldCheckIcon,
};

// Permissões disponíveis
const availablePermissions = [
  { id: "manage_products", label: "Gerenciar Produtos" },
  { id: "manage_orders", label: "Gerenciar Pedidos" },
  { id: "manage_promotions", label: "Gerenciar Promoções" },
  { id: "view_reports", label: "Ver Relatórios" },
  { id: "manage_users", label: "Gerenciar Usuários (somente Admin)" },
  { id: "manage_settings", label: "Configurações do Sistema (somente Admin)" },
];

export default function AdminUsuariosPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    password: "",
    role: "user" as UserRole,
    is_active: true,
    permissions: [] as string[],
  });

  useEffect(() => {
    const init = async () => {
      try {
        const profile = await authService.getProfile();
        if (!profile?.is_admin) {
          toast.error("Acesso negado! Apenas administradores.");
          router.push("/dashboard");
          return;
        }
        loadUsers();
      } catch (error) {
        console.error("Erro ao verificar admin:", error);
        toast.error("Erro ao verificar permissões");
        router.push("/dashboard");
      }
    };
    init();
  }, [router]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const loadUsers = async () => {
    try {
      const token = authService.getToken();
      
      if (!token) {
        toast.error("Token de autenticação não encontrado");
        router.push("/");
        return;
      }

      console.log('🔍 Carregando usuários...');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log('📡 Status da resposta:', response.status);

      if (response.status === 404) {
        console.warn('⚠️ Endpoint /admin/users não encontrado');
        console.log('💡 Configure o backend para habilitar esta funcionalidade');
        setUsers([]);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erro na resposta:', errorData);
        throw new Error(errorData.detail || `Erro ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Usuários carregados:', data);
      
      // Garantir que sempre seja um array
      if (Array.isArray(data)) {
        setUsers(data);
      } else if (data && Array.isArray(data.users)) {
        setUsers(data.users);
      } else if (data && Array.isArray(data.data)) {
        setUsers(data.data);
      } else {
        console.warn('⚠️ Formato de resposta inesperado, usando array vazio');
        setUsers([]);
      }
    } catch (error: any) {
      console.error("Erro ao carregar usuários:", error);
      toast.error(error.message || "Erro ao carregar usuários");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!Array.isArray(users)) {
      setFilteredUsers([]);
      return;
    }

    let filtered = [...users];

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = authService.getToken();
      const url = editingUser
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${editingUser._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/users/`;

      const method = editingUser ? "PUT" : "POST";

      const payload = editingUser
        ? {
            full_name: formData.full_name,
            role: formData.role,
            is_active: formData.is_active,
            permissions: formData.permissions,
          }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Erro ao salvar usuário");
      }

      toast.success(editingUser ? "Usuário atualizado!" : "Usuário criado!");
      setShowModal(false);
      resetForm();
      loadUsers();
    } catch (error: any) {
      console.error("Erro ao salvar usuário:", error);
      toast.error(error.message || "Erro ao salvar usuário");
    }
  };

  const handleChangePassword = async () => {
    if (!selectedUserId || !newPassword) {
      toast.error("Preencha a nova senha");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    try {
      const token = authService.getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${selectedUserId}/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ new_password: newPassword }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Erro ao alterar senha");
      }

      toast.success("Senha alterada com sucesso!");
      setShowPasswordModal(false);
      setNewPassword("");
      setSelectedUserId(null);
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error);
      toast.error(error.message || "Erro ao alterar senha");
    }
  };

  const handlePromote = async (userId: string) => {
    if (!confirm("Deseja promover este usuário a Administrador?")) return;

    try {
      const token = authService.getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/promote`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Erro ao promover usuário");
      }

      toast.success("Usuário promovido a Administrador!");
      loadUsers();
    } catch (error: any) {
      console.error("Erro ao promover usuário:", error);
      toast.error(error.message || "Erro ao promover usuário");
    }
  };

  const handleDemote = async (userId: string) => {
    if (!confirm("Deseja rebaixar este administrador?")) return;

    try {
      const token = authService.getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/demote`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Erro ao rebaixar usuário");
      }

      toast.success("Administrador rebaixado!");
      loadUsers();
    } catch (error: any) {
      console.error("Erro ao rebaixar usuário:", error);
      toast.error(error.message || "Erro ao rebaixar usuário");
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      full_name: user.full_name,
      password: "",
      role: user.role,
      is_active: user.is_active,
      permissions: user.permissions || [],
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir este usuário?")) return;

    try {
      const token = authService.getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Erro ao excluir usuário");
      }

      toast.success("Usuário excluído!");
      loadUsers();
    } catch (error: any) {
      console.error("Erro ao excluir usuário:", error);
      toast.error(error.message || "Erro ao excluir usuário");
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      const token = authService.getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${user._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            full_name: user.full_name,
            role: user.role,
            is_active: !user.is_active,
            permissions: user.permissions || [],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Erro ao atualizar status");
      }

      toast.success(user.is_active ? "Usuário desativado!" : "Usuário ativado!");
      loadUsers();
    } catch (error: any) {
      console.error("Erro ao atualizar status:", error);
      toast.error(error.message || "Erro ao atualizar status");
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      full_name: "",
      password: "",
      role: "user",
      is_active: true,
      permissions: [],
    });
    setEditingUser(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const togglePermission = (permissionId: string) => {
    if (formData.permissions.includes(permissionId)) {
      setFormData({
        ...formData,
        permissions: formData.permissions.filter((p) => p !== permissionId),
      });
    } else {
      setFormData({
        ...formData,
        permissions: [...formData.permissions, permissionId],
      });
    }
  };

  const stats = {
    total: Array.isArray(users) ? users.length : 0,
    admins: Array.isArray(users) ? users.filter((u) => u.role === "admin" || u.is_admin).length : 0,
    managers: Array.isArray(users) ? users.filter((u) => u.role === "manager").length : 0,
    users: Array.isArray(users) ? users.filter((u) => u.role === "user").length : 0,
    active: Array.isArray(users) ? users.filter((u) => u.is_active).length : 0,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-700">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-700 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin")}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Gerenciar Usuários
              </h1>
              <p className="text-white">
                Administre usuários, gerentes e administradores
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Novo Usuário
          </button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white/70 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-purple-50 rounded-lg shadow p-4">
            <p className="text-sm text-purple-800">Administradores</p>
            <p className="text-2xl font-bold text-purple-900">{stats.admins}</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-4">
            <p className="text-sm text-blue-800">Gerentes</p>
            <p className="text-2xl font-bold text-blue-900">{stats.managers}</p>
          </div>
          <div className="bg-gray-50 rounded-lg shadow p-4">
            <p className="text-sm text-gray-800">Usuários</p>
            <p className="text-2xl font-bold text-gray-900">{stats.users}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4">
            <p className="text-sm text-green-800">Ativos</p>
            <p className="text-2xl font-bold text-green-900">{stats.active}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white/50 rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome ou email..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os Níveis</option>
              <option value="admin">Administradores</option>
              <option value="manager">Gerentes</option>
              <option value="user">Usuários</option>
            </select>
          </div>
        </div>

        {/* Lista de Usuários */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white/50 rounded-lg shadow p-12 text-center">
            <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum usuário encontrado</p>
          </div>
        ) : (
          <div className="bg-white/70 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nível
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cadastro
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/30 divide-y divide-black/10">
                {filteredUsers.map((user) => {
                  const RoleIcon = roleIcons[user.role];
                  const isAdmin = user.role === "admin" || user.is_admin;
                  
                  return (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <UserIcon className="w-6 h-6 text-black" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-black">
                              {user.full_name}
                            </div>
                            <div className="text-sm text-black flex items-center gap-1">
                              <EnvelopeIcon className="w-3 h-3" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            roleColors[user.role]
                          }`}
                        >
                          <RoleIcon className="w-4 h-4" />
                          {roleLabels[user.role]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            user.is_active
                              ? "bg-white text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.is_active ? (
                            <>
                              <CheckCircleIcon className="w-4 h-4" />
                              Ativo
                            </>
                          ) : (
                            <>
                              <XCircleIcon className="w-4 h-4" />
                              Inativo
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-black font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-black hover:text-blue-900"
                            title="Editar"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUserId(user._id);
                              setShowPasswordModal(true);
                            }}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Alterar Senha"
                          >
                            <KeyIcon className="w-5 h-5" />
                          </button>
                          
                          {/* Promover/Rebaixar Admin */}
                          {!isAdmin && (
                            <button
                              onClick={() => handlePromote(user._id)}
                              className="text-black hover:text-purple-900"
                              title="Promover a Admin"
                            >
                              <ArrowUpIcon className="w-5 h-5" />
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => handleDemote(user._id)}
                              className="text-black hover:text-orange-900"
                              title="Rebaixar Admin"
                            >
                              <ArrowDownIcon className="w-5 h-5" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleToggleActive(user)}
                            className={
                              user.is_active
                                ? "text-yellow-600 hover:text-yellow-900"
                                : "text-green-600 hover:text-green-900"
                            }
                            title={user.is_active ? "Desativar" : "Ativar"}
                          >
                            {user.is_active ? (
                              <XCircleIcon className="w-5 h-5" />
                            ) : (
                              <CheckCircleIcon className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Excluir"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal de Criar/Editar Usuário */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white/50 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold mb-6">
                {editingUser ? "Editar Usuário" : "Novo Usuário"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informações Básicas */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">
                    Informações Básicas
                  </h4>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="João da Silva"
                    />
                  </div>

                  {!editingUser && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          required
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="joao@exemplo.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Senha *
                        </label>
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({ ...formData, password: e.target.value })
                          }
                          required
                          minLength={6}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Mínimo 6 caracteres"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Nível de Acesso *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value as UserRole })
                      }
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="user">Usuário</option>
                      <option value="manager">Gerente</option>
                      <option value="admin">Administrador</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.role === "admin" &&
                        "Acesso total ao sistema"}
                      {formData.role === "manager" &&
                        "Pode gerenciar produtos, pedidos e promoções"}
                      {formData.role === "user" && "Acesso básico como cliente"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({ ...formData, is_active: e.target.checked })
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <label htmlFor="is_active" className="text-sm font-semibold">
                      Usuário ativo
                    </label>
                  </div>
                </div>

                {/* Permissões (apenas para Gerentes) */}
                {formData.role === "manager" && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg border-b pb-2">
                      Permissões do Gerente
                    </h4>
                    <div className="space-y-2">
                      {availablePermissions
                        .filter(
                          (p) =>
                            !p.id.includes("manage_users") &&
                            !p.id.includes("manage_settings")
                        )
                        .map((permission) => (
                          <div key={permission.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`permission-${permission.id}`}
                              checked={formData.permissions.includes(permission.id)}
                              onChange={() => togglePermission(permission.id)}
                              className="w-4 h-4 text-blue-600"
                            />
                            <label htmlFor={`permission-${permission.id}`} className="text-sm">
                              {permission.label}
                            </label>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingUser ? "Atualizar" : "Criar Usuário"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Alterar Senha */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Alterar Senha</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowPasswordModal(false);
                      setNewPassword("");
                      setSelectedUserId(null);
                    }}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleChangePassword}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Alterar Senha
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}