"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { Home, Building2, Building, MapPin, Save, X } from "lucide-react";

interface Property {
  id?: string;
  title: string;
  wasi_url: string;
  property_type: "casa" | "apartamento" | "townhouse" | "terreno";
  bedrooms: number;
  bathrooms: number;
  parking: number;
  price: number;
  location: string;
  address: string | null;
  description: string | null;
  is_active: boolean;
}

interface PropertyFormProps {
  property?: Property;
  onCancel?: () => void;
}

const PROPERTY_TYPES = [
  { value: "casa", label: "Casa", icon: Home },
  { value: "apartamento", label: "Apartamento", icon: Building2 },
  { value: "townhouse", label: "Townhouse", icon: Building },
  { value: "terreno", label: "Terreno", icon: MapPin },
];

export default function PropertyForm({
  property,
  onCancel,
}: PropertyFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Property>({
    title: property?.title || "",
    wasi_url: property?.wasi_url || "",
    property_type: property?.property_type || "apartamento",
    bedrooms: property?.bedrooms || 2,
    bathrooms: property?.bathrooms || 2,
    parking: property?.parking || 1,
    price: property?.price || 0,
    location: property?.location || "",
    address: property?.address || "",
    description: property?.description || "",
    is_active: property?.is_active !== false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = property?.id
        ? `/api/properties/${property.id}`
        : "/api/properties";
      const method = property?.id ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          wasiUrl: formData.wasi_url,
          propertyType: formData.property_type,
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          parking: formData.parking,
          price: formData.price,
          location: formData.location,
          address: formData.address,
          description: formData.description,
          isActive: formData.is_active,
        }),
      });

      if (response.ok) {
        if (onCancel) {
          onCancel();
        } else {
          router.push("/admin/properties");
          router.refresh();
        }
      }
    } catch (error) {
      console.error("Error saving property:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6">
        {property?.id ? "Editar Propiedad" : "Nueva Propiedad"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
            Título <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Ej: Apartamento en Chacao"
            className="text-sm sm:text-base"
            required
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
            URL de Wasi <span className="text-red-500">*</span>
          </label>
          <Input
            type="url"
            value={formData.wasi_url}
            onChange={(e) =>
              setFormData({ ...formData, wasi_url: e.target.value })
            }
            placeholder="https://wasi.com/propiedad/..."
            className="text-sm sm:text-base"
            required
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
            Tipo de Propiedad <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.property_type}
            onChange={(e) =>
              setFormData({
                ...formData,
                property_type: e.target.value as any,
              })
            }
            className="w-full px-3 py-2 text-sm sm:text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            required
          >
            {PROPERTY_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
              Habitaciones <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min="1"
              max="10"
              value={formData.bedrooms}
              onChange={(e) =>
                setFormData({ ...formData, bedrooms: parseInt(e.target.value) })
              }
              className="text-sm sm:text-base"
              required
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
              Baños <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min="0.5"
              step="0.5"
              value={formData.bathrooms}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bathrooms: parseFloat(e.target.value),
                })
              }
              className="text-sm sm:text-base"
              required
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
              Estacionamiento <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min="0"
              max="10"
              value={formData.parking}
              onChange={(e) =>
                setFormData({ ...formData, parking: parseInt(e.target.value) })
              }
              className="text-sm sm:text-base"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
            Precio (USD) <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            min="0"
            step="1000"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: parseFloat(e.target.value) })
            }
            className="text-sm sm:text-base"
            required
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
            Ubicación <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            placeholder="Ej: Chacao"
            className="text-sm sm:text-base"
            required
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
            Dirección
          </label>
          <Input
            type="text"
            value={formData.address || ""}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            placeholder="Dirección completa (opcional)"
            className="text-sm sm:text-base"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
            Descripción
          </label>
          <textarea
            value={formData.description || ""}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-3 py-2 text-sm sm:text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            rows={4}
            placeholder="Descripción de la propiedad..."
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) =>
              setFormData({ ...formData, is_active: e.target.checked })
            }
            className="w-4 h-4 flex-shrink-0"
          />
          <label htmlFor="is_active" className="text-xs sm:text-sm text-slate-700">
            Propiedad activa (visible en matching)
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
          <Button
            type="submit"
            variant="default"
            disabled={loading}
            className="flex-1 text-sm sm:text-base"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Guardando..." : "Guardar"}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 sm:flex-initial text-sm sm:text-base"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}

