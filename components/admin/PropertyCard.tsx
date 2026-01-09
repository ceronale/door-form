"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Home, MapPin, DollarSign, ExternalLink, Copy, Check, Trash2 } from "lucide-react";
import { getMediumQualityWasiImage } from "@/lib/utils/image-quality";

interface Property {
  id: string;
  title: string;
  wasi_url: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  price: number;
  location: string;
  images: string[] | null;
  is_active: boolean;
  created_at: string;
}

interface PropertyCardProps {
  property: Property;
  onDelete?: () => void;
}

export default function PropertyCard({ property, onDelete }: PropertyCardProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [copyingLink, setCopyingLink] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleCardClick = () => {
    router.push(`/admin/properties/${property.id}`);
  };

  const formatTitle = (title: string): string => {
    return title
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
    setCopyingLink(true);
    try {
      const formattedTitle = formatTitle(property.title);
      const url = `${window.location.origin}/admin/properties/${property.id}`;
      const textToCopy = `${formattedTitle}\n${url}`;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setCopyingLink(false);
      }, 2000);
    } catch (error) {
      console.error("Error copying link:", error);
      setCopyingLink(false);
    }
  };

  const handleWasiClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(property.wasi_url, "_blank");
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm(`¿Estás seguro de eliminar la propiedad "${property.title}"?`)) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/properties/${property.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        if (onDelete) {
          onDelete();
        } else {
          router.refresh();
        }
      } else {
        const data = await response.json();
        alert(data.error || "Error al eliminar la propiedad");
      }
    } catch (error) {
      console.error("Error deleting property:", error);
      alert("Error al eliminar la propiedad");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card 
      className="p-0 hover:shadow-lg transition-all overflow-hidden cursor-pointer group"
      onClick={handleCardClick}
    >
      {/* Imagen de la propiedad */}
      {property.images && property.images.length > 0 && (
        <div className="relative w-full h-40 sm:h-48 bg-slate-200 overflow-hidden">
          <img
            src={getMediumQualityWasiImage(property.images[0])}
            alt={property.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          {!property.is_active && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-red-100 text-red-700 text-xs">Inactiva</Badge>
            </div>
          )}
        </div>
      )}
      
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate">{property.title}</h3>
              {!property.is_active && (!property.images || property.images.length === 0) && (
                <Badge className="bg-red-100 text-red-700 text-xs flex-shrink-0">Inactiva</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 mb-2">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">{property.location}</span>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600 mb-3">
              <span className="flex items-center gap-1">
                <Home className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">{property.property_type}</span>
              </span>
              <span>{property.bedrooms} hab.</span>
              <span>{property.bathrooms} baños</span>
              <span>{property.parking} estac.</span>
            </div>
            <div className="flex items-center gap-1 text-base sm:text-lg font-bold text-slate-900">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="truncate">{formatCurrency(property.price)}</span>
            </div>
          </div>
        </div>
      </div>

      <div 
        className="flex gap-2 pt-1 border-t border-slate-200 px-4 sm:px-5 pb-3 sm:pb-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleCopyLink}
          className="p-2 sm:p-2.5 border border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 active:bg-slate-200 transition-colors flex items-center justify-center flex-shrink-0 shadow-sm"
          title="Copiar enlace"
        >
          {copied ? (
            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
          ) : (
            <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
          )}
        </button>
        <button
          onClick={handleWasiClick}
          className="p-2 sm:p-2.5 border border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 active:bg-slate-200 transition-colors flex items-center justify-center flex-shrink-0 shadow-sm"
          title="Ver en Wasi"
        >
          <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className={`p-2 sm:p-2.5 border border-red-300 rounded-lg bg-red-50 hover:bg-red-100 active:bg-red-200 transition-colors flex items-center justify-center flex-shrink-0 shadow-sm ${
            deleting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Eliminar propiedad"
        >
          <Trash2 className={`w-4 h-4 sm:w-5 sm:h-5 ${deleting ? 'text-red-400' : 'text-red-600'}`} />
        </button>
        <button
          onClick={handleCardClick}
          className="flex-1 px-3 sm:px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 active:bg-slate-700 transition-colors text-xs sm:text-sm font-medium"
        >
          <span className="hidden sm:inline">Ver Detalles</span>
          <span className="sm:hidden">Ver</span>
        </button>
      </div>
    </Card>
  );
}

