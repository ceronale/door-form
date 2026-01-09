"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import ContactHistory from "@/components/admin/ContactHistory";
import MatchProperties from "@/components/admin/MatchProperties";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getMediumQualityWasiImage } from "@/lib/utils/image-quality";
import {
  User,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Home,
  ArrowLeft,
  Save,
} from "lucide-react";

interface Client {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  property_types: string[];
  bedrooms: number;
  bathrooms: number;
  parking: number;
  budget_min: number;
  budget_max: number;
  locations: string[];
  preferences: string[] | null;
  status: string;
  notes: string | null;
  created_at: string;
}

interface ClientProperty {
  id: string;
  sent_at: string;
  viewed_at: string | null;
  status: string;
  notes: string | null;
  properties: {
    id: string;
    title: string;
    wasi_url: string;
    price: number;
    location: string;
    images: string[] | null;
  };
}

interface Contact {
  id: string;
  contact_type: string;
  notes: string;
  contact_date: string;
  next_follow_up: string | null;
}

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = Array.isArray(params.id) ? params.id[0] : (params.id as string);
  const [client, setClient] = useState<Client | null>(null);
  const [properties, setProperties] = useState<ClientProperty[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (clientId) {
      fetchClientData();
    }
  }, [clientId]);

  const fetchClientData = async () => {
    setLoading(true);
    try {
      const [clientRes, propertiesRes, contactsRes] = await Promise.all([
        fetch(`/api/clients/${clientId}`),
        fetch(`/api/clients/${clientId}/properties`),
        fetch(`/api/clients/${clientId}/contacts`),
      ]);

      if (clientRes.ok) {
        const clientData = await clientRes.json();
        setClient(clientData);
        setStatus(clientData.status);
        setNotes(clientData.notes || "");
      }

      if (propertiesRes.ok) {
        const propertiesData = await propertiesRes.json();
        setProperties(propertiesData);
      }

      if (contactsRes.ok) {
        const contactsData = await contactsRes.json();
        setContacts(contactsData);
      }
    } catch (error) {
      console.error("Error fetching client data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          notes,
        }),
      });

      if (response.ok) {
        const updatedClient = await response.json();
        setClient(updatedClient);
      }
    } catch (error) {
      console.error("Error saving client:", error);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-600">Cargando cliente...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-600">Cliente no encontrado</p>
      </div>
    );
  }

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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Título centrado */}
      <div className="text-center">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 break-words">
          {client.full_name}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Cliente desde{" "}
          {format(new Date(client.created_at), "d 'de' MMMM 'de' yyyy", {
            locale: es,
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Información de Contacto */}
          <Card className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4">
              Información de Contacto
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-400" />
                <span className="text-slate-700">{client.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-slate-400" />
                <span className="text-slate-700">{client.phone}</span>
              </div>
            </div>
          </Card>

          {/* Requerimientos */}
          <Card className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4">
              Requerimientos
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">
                  Tipo de Propiedad
                </p>
                <div className="flex flex-wrap gap-2">
                  {client.property_types.map((type) => (
                    <Badge
                      key={type}
                      className="bg-slate-100 text-slate-700"
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">
                    Habitaciones
                  </p>
                  <p className="text-base sm:text-lg font-bold text-slate-900">
                    {client.bedrooms}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">
                    Baños
                  </p>
                  <p className="text-base sm:text-lg font-bold text-slate-900">
                    {client.bathrooms}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">
                    Estacionamiento
                  </p>
                  <p className="text-base sm:text-lg font-bold text-slate-900">
                    {client.parking}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">
                  Presupuesto
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {formatCurrency(client.budget_min)} -{" "}
                  {formatCurrency(client.budget_max)}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">
                  Ubicaciones de Interés
                </p>
                <div className="flex flex-wrap gap-2">
                  {client.locations.map((location) => (
                    <Badge
                      key={location}
                      className="bg-slate-100 text-slate-700"
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      {location}
                    </Badge>
                  ))}
                </div>
              </div>

              {client.preferences && client.preferences.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">
                    Preferencias
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {client.preferences.map((pref) => (
                      <Badge
                        key={pref}
                        className="bg-blue-100 text-blue-700"
                      >
                        {pref}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Propiedades Enviadas */}
          <Card className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4">
              Propiedades Enviadas ({properties.length})
            </h2>
            {properties.length === 0 ? (
              <p className="text-slate-500 text-center py-8 text-sm">
                No se han enviado propiedades aún
              </p>
            ) : (
              <div className="space-y-3">
                {properties.map((cp) => (
                  <div
                    key={cp.id}
                    className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-1.5 break-words">
                          {cp.properties.title}
                        </h3>
                        <div className="space-y-1">
                          <p className="text-xs sm:text-sm text-slate-600">
                            📍 {cp.properties.location}
                          </p>
                          <p className="text-xs sm:text-sm font-semibold text-slate-900">
                            💰 {formatCurrency(cp.properties.price)}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              className={`text-xs ${
                                cp.status === "interested"
                                  ? "bg-green-100 text-green-700"
                                  : cp.status === "viewed"
                                  ? "bg-blue-100 text-blue-700"
                                  : cp.status === "not_interested"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {cp.status === "interested"
                                ? "Interesado"
                                : cp.status === "viewed"
                                ? "Visto"
                                : cp.status === "not_interested"
                                ? "No Interesado"
                                : "Enviado"}
                            </Badge>
                            <p className="text-xs text-slate-500">
                              {format(
                                new Date(cp.sent_at),
                                "d MMM yyyy, HH:mm",
                                { locale: es }
                              )}
                            </p>
                          </div>
                          {cp.properties.images && cp.properties.images.length > 0 && (
                            <div className="mt-2">
                              <img
                                src={getMediumQualityWasiImage(cp.properties.images[0])}
                                alt={cp.properties.title}
                                className="w-full h-32 sm:h-40 object-cover rounded-lg"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 sm:flex-col sm:ml-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(cp.properties.wasi_url, "_blank")
                          }
                          className="text-xs sm:text-sm flex-1 sm:flex-none"
                        >
                          <span className="hidden sm:inline">Ver en Wasi</span>
                          <span className="sm:hidden">Wasi</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Matching */}
          <MatchProperties
            clientId={clientId}
            onPropertySent={fetchClientData}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Estado y Notas */}
          <Card className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4">
              Estado y Notas
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Estado
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
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
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  rows={6}
                  placeholder="Notas sobre el cliente..."
                />
              </div>

              <Button
                variant="default"
                onClick={handleSave}
                disabled={saving}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </Card>

          {/* Historial de Contactos */}
          <ContactHistory
            clientId={clientId}
            contacts={contacts}
            onContactAdded={fetchClientData}
          />
        </div>
      </div>
    </div>
  );
}

