"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ClientCard from "@/components/admin/ClientCard";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Search, Filter, Table, Grid, Home, Bath, Car, Plus, Edit, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  interested: "bg-green-100 text-green-700",
  closed: "bg-slate-100 text-slate-700",
  lost: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  new: "Nuevo",
  contacted: "Contactado",
  interested: "Interesado",
  closed: "Cerrado",
  lost: "Perdido",
};

interface Client {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  property_types: string[];
  locations: string[];
  budget_min: number;
  budget_max: number;
  status: string;
  notes?: string | null;
  created_at: string;
  last_contact_date: string | null;
  properties_sent_count?: number;
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
}

export default function ClientsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "all"
  );
  const [sortBy, setSortBy] = useState<"last_contact" | "created_at" | "name">(
    (searchParams.get("sortBy") as "last_contact" | "created_at" | "name") || "last_contact"
  );
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [showContactModal, setShowContactModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [contactType, setContactType] = useState("call");
  const [contactNotes, setContactNotes] = useState("");
  const [contactNextFollowUp, setContactNextFollowUp] = useState("");
  const [savingContact, setSavingContact] = useState(false);
  const [editingClient, setEditingClient] = useState<Partial<Client>>({});
  const [savingClient, setSavingClient] = useState(false);

  const handleAddContact = (client: Client) => {
    setSelectedClient(client);
    setContactType("call");
    setContactNotes("");
    setContactNextFollowUp("");
    setShowContactModal(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setEditingClient({
      full_name: client.full_name,
      email: client.email,
      phone: client.phone,
      status: client.status,
      notes: client.notes || "",
    });
    setShowEditModal(true);
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    setSavingContact(true);
    try {
      const response = await fetch(`/api/clients/${selectedClient.id}/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contactType,
          notes: contactNotes,
          nextFollowUp: contactNextFollowUp || null,
        }),
      });

      if (response.ok) {
        setShowContactModal(false);
        setSelectedClient(null);
        fetchClients(); // Refrescar lista
      }
    } catch (error) {
      console.error("Error creating contact:", error);
    } finally {
      setSavingContact(false);
    }
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    setSavingClient(true);
    try {
      const response = await fetch(`/api/clients/${selectedClient.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingClient),
      });

      if (response.ok) {
        setShowEditModal(false);
        setSelectedClient(null);
        fetchClients(); // Refrescar lista
      }
    } catch (error) {
      console.error("Error updating client:", error);
    } finally {
      setSavingClient(false);
    }
  };

  const contactTypeLabels: Record<string, string> = {
    call: "Llamada",
    email: "Email",
    whatsapp: "WhatsApp",
    visit: "Visita",
    meeting: "Reunión",
    other: "Otro",
  };

  const statusOptions = [
    { value: "all", label: "Todos" },
    { value: "new", label: "Nuevos" },
    { value: "contacted", label: "Contactados" },
    { value: "interested", label: "Interesados" },
    { value: "closed", label: "Cerrados" },
    { value: "lost", label: "Perdidos" },
  ];

  useEffect(() => {
    fetchClients();
  }, [statusFilter, sortBy]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (search) {
        params.append("search", search);
      }
      if (sortBy) {
        params.append("sortBy", sortBy);
      }

      const response = await fetch(`/api/clients?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClients();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-2 sm:gap-4">
        <div className="text-center -mt-2 sm:-mt-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Clientes</h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Gestiona y sigue a tus clientes
          </p>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between gap-2">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="flex-1 relative min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 sm:pl-10 text-sm sm:text-base"
            />
          </div>
          <Button type="submit" variant="default" className="flex-shrink-0 text-sm sm:text-base px-3 sm:px-4">
            <span className="hidden sm:inline">Buscar</span>
            <Search className="w-4 h-4 sm:hidden" />
          </Button>
        </form>
        <div className="flex gap-1 border border-slate-300 rounded-lg p-1">
          <button
            onClick={() => setViewMode("table")}
            className={`p-2 rounded transition-colors ${
              viewMode === "table"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
            title="Vista tabla"
          >
            <Table className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("cards")}
            className={`p-2 rounded transition-colors ${
              viewMode === "cards"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
            title="Vista cards"
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-slate-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-slate-700">Estado:</span>
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setStatusFilter(option.value);
                }}
                className="active:scale-95 transition-transform"
              >
                <Badge
                  className={
                    statusFilter === option.value
                      ? "bg-slate-900 text-white text-xs"
                      : "bg-slate-100 text-slate-700 active:bg-slate-200 text-xs"
                  }
                >
                  {option.label}
                </Badge>
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-xs sm:text-sm font-medium text-slate-700">Ordenar por:</span>
            <button
              onClick={() => setSortBy("last_contact")}
              className="active:scale-95 transition-transform"
            >
              <Badge
                className={
                  sortBy === "last_contact"
                    ? "bg-slate-900 text-white text-xs"
                    : "bg-slate-100 text-slate-700 active:bg-slate-200 text-xs"
                }
              >
                Último Contacto
              </Badge>
            </button>
            <button
              onClick={() => setSortBy("created_at")}
              className="active:scale-95 transition-transform"
            >
              <Badge
                className={
                  sortBy === "created_at"
                    ? "bg-slate-900 text-white text-xs"
                    : "bg-slate-100 text-slate-700 active:bg-slate-200 text-xs"
                }
              >
                Más Recientes
              </Badge>
            </button>
            <button
              onClick={() => setSortBy("name")}
              className="active:scale-95 transition-transform"
            >
              <Badge
                className={
                  sortBy === "name"
                    ? "bg-slate-900 text-white text-xs"
                    : "bg-slate-100 text-slate-700 active:bg-slate-200 text-xs"
                }
              >
                Nombre
              </Badge>
            </button>
          </div>
        </div>
      </div>

      {/* Lista de clientes */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-600">Cargando clientes...</p>
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-slate-600">
            No se encontraron clientes con los filtros seleccionados.
          </p>
        </div>
      ) : viewMode === "table" ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Busca
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Último Contacto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Propiedades
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    onClick={() => window.location.href = `/admin/clients/${client.id}`}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-sm text-slate-900">
                          {client.full_name}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {client.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 text-slate-600">
                        <div className="flex items-center gap-1" title="Habitaciones">
                          <Home className="w-4 h-4" />
                          <span className="text-xs font-medium">{client.bedrooms || 0}</span>
                        </div>
                        <div className="flex items-center gap-1" title="Baños">
                          <Bath className="w-4 h-4" />
                          <span className="text-xs font-medium">{client.bathrooms || 0}</span>
                        </div>
                        <div className="flex items-center gap-1" title="Estacionamiento">
                          <Car className="w-4 h-4" />
                          <span className="text-xs font-medium">{client.parking || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {client.last_contact_date ? (
                        <div className="text-xs text-slate-600">
                          {format(new Date(client.last_contact_date), "d MMM yyyy", {
                            locale: es,
                          })}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Sin contacto</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-slate-900">
                        {client.properties_sent_count || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={`${
                          statusColors[client.status] || statusColors.new
                        } text-xs`}
                      >
                        {statusLabels[client.status] || "Nuevo"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div 
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleAddContact(client)}
                          className="p-1.5 rounded hover:bg-slate-100 active:bg-slate-200 transition-colors text-slate-600 hover:text-slate-900"
                          title="Agregar contacto"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditClient(client)}
                          className="p-1.5 rounded hover:bg-slate-100 active:bg-slate-200 transition-colors text-slate-600 hover:text-slate-900"
                          title="Editar cliente"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {clients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}

      {/* Modal Agregar Contacto */}
      {showContactModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowContactModal(false)}>
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Agregar Contacto</h2>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Cliente: <span className="font-medium">{selectedClient.full_name}</span>
            </p>
            <form onSubmit={handleSaveContact} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tipo de Contacto
                </label>
                <select
                  value={contactType}
                  onChange={(e) => setContactType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  {Object.entries(contactTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notas
                </label>
                <textarea
                  value={contactNotes}
                  onChange={(e) => setContactNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Próximo Seguimiento (opcional)
                </label>
                <Input
                  type="datetime-local"
                  value={contactNextFollowUp}
                  onChange={(e) => setContactNextFollowUp(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowContactModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  disabled={savingContact}
                  className="flex-1"
                >
                  {savingContact ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Cliente */}
      {showEditModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Editar Cliente</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveClient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre Completo
                </label>
                <Input
                  type="text"
                  value={editingClient.full_name || ""}
                  onChange={(e) => setEditingClient({ ...editingClient, full_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={editingClient.email || ""}
                  onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Teléfono
                </label>
                <Input
                  type="tel"
                  value={editingClient.phone || ""}
                  onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Estado
                </label>
                <select
                  value={editingClient.status || "new"}
                  onChange={(e) => setEditingClient({ ...editingClient, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="new">Nuevo</option>
                  <option value="contacted">Contactado</option>
                  <option value="interested">Interesado</option>
                  <option value="closed">Cerrado</option>
                  <option value="lost">Perdido</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notas
                </label>
                <textarea
                  value={editingClient.notes || ""}
                  onChange={(e) => setEditingClient({ ...editingClient, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  disabled={savingClient}
                  className="flex-1"
                >
                  {savingClient ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

