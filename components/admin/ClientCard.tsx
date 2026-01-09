"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { User, Mail, Phone, MapPin, Calendar, Copy, Check, Clock } from "lucide-react";

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
  created_at: string;
  last_contact_date: string | null;
}

interface ClientCardProps {
  client: Client;
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

export default function ClientCard({ client }: ClientCardProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleCardClick = () => {
    router.push(`/admin/clients/${client.id}`);
  };

  const formatTitle = (name: string): string => {
    return name
      .trim()
      .split(' ')
      .map(word => {
        // Si la palabra está completamente en mayúsculas, mantenerla
        if (word === word.toUpperCase() && word.length > 1) {
          return word;
        }
        // Capitalizar primera letra, resto en minúsculas
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ')
      .replace(/\s+/g, ' ') // Eliminar espacios múltiples
      .trim();
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const formattedName = formatTitle(client.full_name);
      const url = `${window.location.origin}/admin/clients/${client.id}`;
      const textToCopy = `${formattedName}\n${url}`;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error copying link:", error);
    }
  };

  return (
    <Card 
      className="p-4 sm:p-5 hover:shadow-lg transition-all cursor-pointer group"
      onClick={handleCardClick}
    >
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate">{client.full_name}</h3>
              <div className="space-y-0.5">
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">
                    Creado: {format(new Date(client.created_at), "d MMM yyyy", {
                      locale: es,
                    })}
                  </span>
                </p>
                {client.last_contact_date && (
                  <p className="text-xs text-blue-600 flex items-center gap-1">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">
                      Contactado: {format(new Date(client.last_contact_date), "d MMM yyyy", {
                        locale: es,
                      })}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
          <Badge
            className={`${statusColors[client.status] || statusColors.new} text-xs flex-shrink-0`}
          >
            {statusLabels[client.status] || "Nuevo"}
          </Badge>
        </div>

        <div className="space-y-1.5 sm:space-y-2 mb-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
            <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">{client.email}</span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
            <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">{client.phone}</span>
          </div>
          {client.locations.length > 0 && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">{client.locations[0]}</span>
              {client.locations.length > 1 && (
                <span className="text-xs text-slate-400 flex-shrink-0">
                  +{client.locations.length - 1} más
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {client.property_types.slice(0, 2).map((type) => (
            <Badge key={type} className="bg-slate-100 text-slate-700 text-xs">
              {type}
            </Badge>
          ))}
          {client.property_types.length > 2 && (
            <Badge className="bg-slate-100 text-slate-700 text-xs">
              +{client.property_types.length - 2}
            </Badge>
          )}
        </div>

        <div className="pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs sm:text-sm font-medium text-slate-900 break-words flex-1">
              Presupuesto: {formatCurrency(client.budget_min)} -{" "}
              {formatCurrency(client.budget_max)}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopyLink(e);
              }}
              className="p-1.5 sm:p-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors flex-shrink-0"
              title="Copiar enlace"
            >
              {copied ? (
                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
              ) : (
                <Copy className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600" />
              )}
            </button>
          </div>
        </div>
      </Card>
  );
}

