"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import {
  Home,
  Building2,
  Building,
  MapPin,
  Plus,
  Minus,
  Check,
  User,
  Mail,
  Phone,
} from "lucide-react";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Input from "./ui/Input";
import Badge from "./ui/Badge";

// Ubicaciones de Caracas
const CARACAS_LOCATIONS = [
  "Chacao",
  "Las Mercedes",
  "La Castellana",
  "Altamira",
  "Los Palos Grandes",
  "El Rosal",
  "San Bernardino",
  "La Candelaria",
  "Bello Monte",
  "Colinas de Bello Monte",
  "La Florida",
  "Los Dos Caminos",
  "La Trinidad",
  "El Cafetal",
  "Baruta",
  "El Hatillo",
  "La Boyera",
  "Los Teques",
  "Caricuao",
  "La Vega",
  "Antímano",
  "Catia",
  "23 de Enero",
  "San Martín",
  "El Valle",
  "Petare",
  "Guarenas",
  "Guatire",
] as const;

// Esquema de validación con Zod
const formSchema = z
  .object({
    // Información personal
    fullName: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(100, "El nombre es demasiado largo"),
    email: z
      .string()
      .min(1, "El email es requerido")
      .email("Ingresa un email válido"),
    phone: z
      .string()
      .min(10, "El teléfono debe tener al menos 10 dígitos")
      .regex(/^[0-9+\-\s()]+$/, "Ingresa un número de teléfono válido"),
    // Requerimientos de propiedad
    propertyTypes: z
      .array(z.enum(["casa", "apartamento", "townhouse", "terreno"]))
      .min(1, "Selecciona al menos un tipo de propiedad"),
    bedrooms: z.number().min(1).max(10),
    bathrooms: z.number().min(0.5).step(0.5),
    parking: z.number().min(0).max(10),
    budgetMin: z.number().min(0, "El presupuesto mínimo debe ser mayor a 0"),
    budgetMax: z.number().min(0, "El presupuesto máximo debe ser mayor a 0"),
    locations: z
      .array(z.string())
      .min(1, "Selecciona al menos una ubicación")
      .max(3, "Puedes seleccionar máximo 3 ubicaciones"),
    preferences: z.array(z.string()).optional(),
  })
  .refine((data) => data.budgetMax >= data.budgetMin, {
    message: "El presupuesto máximo debe ser mayor o igual al mínimo",
    path: ["budgetMax"],
  });

type FormData = z.infer<typeof formSchema>;

// Opciones de preferencias
const PREFERENCES = [
  "Cocina Remodelada",
  "Jardín",
  "Vigilancia",
  "Piso Bajo",
  "Vista Panorámica",
  "Balcón",
  "Ascensor",
  "Piscina",
  "Gimnasio",
  "Terraza",
];

// Tipos de propiedad con iconos
const PROPERTY_TYPES = [
  { value: "casa", label: "Casa", icon: Home },
  { value: "apartamento", label: "Apartamento", icon: Building2 },
  { value: "townhouse", label: "Townhouse", icon: Building },
  { value: "terreno", label: "Terreno", icon: MapPin },
];

export default function ClientRequirementsForm() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      propertyTypes: [],
      bedrooms: 2,
      bathrooms: 2,
      parking: 1,
      budgetMin: 0,
      budgetMax: 0,
      locations: [],
      preferences: [],
    },
  });

  const propertyTypes = watch("propertyTypes");
  const locations = watch("locations") || [];
  const preferences = watch("preferences") || [];
  const bedrooms = watch("bedrooms");
  const bathrooms = watch("bathrooms");
  const parking = watch("parking");
  const budgetMin = watch("budgetMin");
  const budgetMax = watch("budgetMax");

  // Estado para los valores formateados de moneda
  const [budgetMinDisplay, setBudgetMinDisplay] = useState("");
  const [budgetMaxDisplay, setBudgetMaxDisplay] = useState("");
  const [phoneDisplay, setPhoneDisplay] = useState("");

  // Sincronizar valores iniciales
  useEffect(() => {
    if (budgetMin > 0) {
      setBudgetMinDisplay(formatCurrency(budgetMin));
    }
    if (budgetMax > 0) {
      setBudgetMaxDisplay(formatCurrency(budgetMax));
    }
  }, []);

  const togglePropertyType = (type: FormData["propertyTypes"][number]) => {
    const current = propertyTypes || [];
    if (current.includes(type)) {
      setValue("propertyTypes", current.filter((t) => t !== type));
    } else {
      setValue("propertyTypes", [...current, type]);
    }
  };

  const formatPhone = (value: string): string => {
    // Remover todo excepto números
    const numbers = value.replace(/\D/g, "");
    
    // Si empieza con 58 (código de Venezuela), mantenerlo
    if (numbers.startsWith("58")) {
      if (numbers.length <= 2) return `+${numbers}`;
      if (numbers.length <= 4) return `+${numbers.slice(0, 2)} ${numbers.slice(2)}`;
      if (numbers.length <= 7) return `+${numbers.slice(0, 2)} ${numbers.slice(2, 4)} ${numbers.slice(4)}`;
      return `+${numbers.slice(0, 2)} ${numbers.slice(2, 4)} ${numbers.slice(4, 7)}-${numbers.slice(7, 11)}`;
    }
    
    // Si no tiene código de país, asumir número local venezolano
    if (numbers.length <= 4) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 4)} ${numbers.slice(4)}`;
    return `${numbers.slice(0, 4)} ${numbers.slice(4, 7)}-${numbers.slice(7, 11)}`;
  };

  const toggleLocation = (location: string) => {
    const current = locations || [];
    if (current.includes(location)) {
      setValue("locations", current.filter((l) => l !== location));
    } else {
      if (current.length < 3) {
        setValue("locations", [...current, location]);
      }
    }
  };

  const togglePreference = (pref: string) => {
    const current = preferences || [];
    if (current.includes(pref)) {
      setValue("preferences", current.filter((p) => p !== pref));
    } else {
      setValue("preferences", [...current, pref]);
    }
  };

  const adjustNumber = (
    field: "bedrooms" | "bathrooms" | "parking",
    delta: number,
    min: number = 0,
    max: number = 10
  ) => {
    const current = watch(field);
    const newValue = Math.max(min, Math.min(max, current + delta));
    setValue(field, newValue);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const parseCurrency = (value: string): number => {
    return parseInt(value.replace(/[^0-9]/g, "")) || 0;
  };

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al enviar el formulario');
      }

      alert("¡Formulario enviado exitosamente! Te contactaremos pronto.");
      // Resetear formulario después de envío exitoso
      window.location.reload();
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      alert("Hubo un error al enviar el formulario. Por favor, intenta nuevamente.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-2xl shadow-lg p-5 space-y-6"
    >
      {/* Header con mensaje motivacional */}
      <div className="text-center space-y-3 pb-5 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">
          Encuentra tu Propiedad Ideal
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed px-2">
          Llena este formulario y te contactaré con las mejores opciones que se ajusten a tus requerimientos en Caracas
        </p>
      </div>

      {/* Información Personal */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          Información de Contacto
        </h2>
        
        {/* Nombre Completo */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nombre Completo <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Ej: Juan Pérez"
              error={!!errors.fullName}
              className="pl-10"
              {...register("fullName")}
            />
          </div>
          {errors.fullName && (
            <p className="mt-1 text-xs text-red-500">
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="email"
              placeholder="Ej: juan@email.com"
              error={!!errors.email}
              className="pl-10"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Teléfono <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="tel"
              placeholder="Ej: +58 412 1234567 o 0412 1234567"
              error={!!errors.phone}
              className="pl-10"
              value={phoneDisplay}
              onChange={(e) => {
                const formatted = formatPhone(e.target.value);
                setPhoneDisplay(formatted);
                // Guardar solo números para validación
                const numbers = formatted.replace(/\D/g, "");
                setValue("phone", formatted, { shouldValidate: true });
              }}
              onBlur={() => {
                const phone = watch("phone");
                if (phone) {
                  setPhoneDisplay(formatPhone(phone));
                }
              }}
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-xs text-red-500">
              {errors.phone.message}
            </p>
          )}
        </div>
      </div>

      {/* Separador */}
      <div className="border-t border-slate-200 pt-5">
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          Requerimientos de la Propiedad
        </h2>
      </div>

      {/* Tipo de Propiedad */}
      <div>
        <label className="block text-base font-semibold text-slate-900 mb-3">
          Tipo de Propiedad <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {PROPERTY_TYPES.map(({ value, label, icon: Icon }) => {
            const isSelected = propertyTypes?.includes(value);
            return (
              <Card
                key={value}
                selected={isSelected}
                interactive
                onClick={() => togglePropertyType(value)}
                className="p-4 flex flex-col items-center justify-center gap-2 min-h-[100px] relative"
              >
                <Icon
                  className={`w-8 h-8 ${
                    isSelected ? "text-slate-900" : "text-slate-400"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    isSelected ? "text-slate-900" : "text-slate-600"
                  }`}
                >
                  {label}
                </span>
                {isSelected && (
                  <Check className="w-5 h-5 text-slate-900 absolute top-2 right-2" />
                )}
              </Card>
            );
          })}
        </div>
        {errors.propertyTypes && (
          <p className="mt-2 text-sm text-red-500">
            {errors.propertyTypes.message}
          </p>
        )}
      </div>

      {/* Especificaciones */}
      <div className="space-y-5">
        <h3 className="text-base font-semibold text-slate-900">
          Especificaciones
        </h3>

        {/* Habitaciones */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Habitaciones
          </label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => adjustNumber("bedrooms", -1, 1)}
              className="w-9 h-9 rounded-full p-0 flex-shrink-0"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <div className="flex-1 flex gap-1.5 flex-wrap justify-center">
              {[1, 2, 3, 4, 5].map((num) => (
                <Button
                  key={num}
                  type="button"
                  variant={bedrooms === num ? "default" : "outline"}
                  size="sm"
                  onClick={() => setValue("bedrooms", num)}
                  className="min-w-[44px] text-sm"
                >
                  {num}
                </Button>
              ))}
              <Button
                type="button"
                variant={bedrooms >= 6 ? "default" : "outline"}
                size="sm"
                onClick={() => setValue("bedrooms", 6)}
                className="min-w-[44px] text-sm"
              >
                5+
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => adjustNumber("bedrooms", 1, 1, 10)}
              className="w-9 h-9 rounded-full p-0 flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <input type="hidden" {...register("bedrooms", { valueAsNumber: true })} />
        </div>

        {/* Baños */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Baños
          </label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => adjustNumber("bathrooms", -0.5, 0.5)}
              className="w-9 h-9 rounded-full p-0 flex-shrink-0"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <div className="flex-1 flex gap-1.5 flex-wrap justify-center">
              {[1, 1.5, 2, 2.5, 3, 3.5, 4].map((num) => (
                <Button
                  key={num}
                  type="button"
                  variant={bathrooms === num ? "default" : "outline"}
                  size="sm"
                  onClick={() => setValue("bathrooms", num)}
                  className="min-w-[50px] text-sm"
                >
                  {num}
                </Button>
              ))}
              <Button
                type="button"
                variant={bathrooms >= 4.5 ? "default" : "outline"}
                size="sm"
                onClick={() => setValue("bathrooms", 4.5)}
                className="min-w-[50px] text-sm"
              >
                4+
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => adjustNumber("bathrooms", 0.5, 0.5, 10)}
              className="w-9 h-9 rounded-full p-0 flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <input type="hidden" {...register("bathrooms", { valueAsNumber: true })} />
        </div>

        {/* Estacionamiento */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Puestos de Estacionamiento
          </label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => adjustNumber("parking", -1, 0)}
              className="w-9 h-9 rounded-full p-0 flex-shrink-0"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <div className="flex-1 flex gap-1.5 flex-wrap justify-center">
              {[0, 1, 2, 3].map((num) => (
                <Button
                  key={num}
                  type="button"
                  variant={parking === num ? "default" : "outline"}
                  size="sm"
                  onClick={() => setValue("parking", num)}
                  className="min-w-[44px] text-sm"
                >
                  {num}
                </Button>
              ))}
              <Button
                type="button"
                variant={parking >= 4 ? "default" : "outline"}
                size="sm"
                onClick={() => setValue("parking", 4)}
                className="min-w-[44px] text-sm"
              >
                3+
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => adjustNumber("parking", 1, 0, 10)}
              className="w-9 h-9 rounded-full p-0 flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <input type="hidden" {...register("parking", { valueAsNumber: true })} />
        </div>
      </div>

      {/* Rango de Presupuesto */}
      <div>
        <label className="block text-base font-semibold text-slate-900 mb-3">
          Rango de Presupuesto <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">
              Mínimo
            </label>
            <Input
              type="text"
              placeholder="$0"
              value={budgetMinDisplay}
              error={!!errors.budgetMin}
              onChange={(e) => {
                const value = parseCurrency(e.target.value);
                setValue("budgetMin", value, { shouldValidate: true });
                setBudgetMinDisplay(formatCurrency(value));
              }}
              onBlur={() => {
                if (budgetMin > 0) {
                  setBudgetMinDisplay(formatCurrency(budgetMin));
                }
              }}
            />
            {errors.budgetMin && (
              <p className="mt-1 text-xs text-red-500">
                {errors.budgetMin.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">
              Máximo
            </label>
            <Input
              type="text"
              placeholder="$0"
              value={budgetMaxDisplay}
              error={!!errors.budgetMax}
              onChange={(e) => {
                const value = parseCurrency(e.target.value);
                setValue("budgetMax", value, { shouldValidate: true });
                setBudgetMaxDisplay(formatCurrency(value));
              }}
              onBlur={() => {
                if (budgetMax > 0) {
                  setBudgetMaxDisplay(formatCurrency(budgetMax));
                }
              }}
            />
            {errors.budgetMax && (
              <p className="mt-1 text-xs text-red-500">
                {errors.budgetMax.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Ubicación */}
      <div>
        <label className="block text-base font-semibold text-slate-900 mb-2">
          Ubicación / Zona de Interés{" "}
          <span className="text-red-500">*</span>
          {locations.length > 0 && (
            <span className="text-xs font-normal text-slate-500 ml-2">
              ({locations.length}/3)
            </span>
          )}
        </label>
        <div className="flex flex-wrap gap-2">
          {CARACAS_LOCATIONS.map((location) => {
            const isSelected = locations.includes(location);
            const isDisabled = !isSelected && locations.length >= 3;
            return (
              <Badge
                key={location}
                selected={isSelected}
                interactive={!isDisabled}
                onClick={() => !isDisabled && toggleLocation(location)}
                className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
              >
                {location}
              </Badge>
            );
          })}
        </div>
        <input type="hidden" {...register("locations")} />
        {errors.locations && (
          <p className="mt-2 text-sm text-red-500">
            {errors.locations.message}
          </p>
        )}
        {locations.length >= 3 && (
          <p className="mt-2 text-xs text-slate-500">
            Has alcanzado el máximo de 3 ubicaciones
          </p>
        )}
      </div>

      {/* Preferencias Adicionales */}
      <div>
        <label className="block text-base font-semibold text-slate-900 mb-3">
          Preferencias Adicionales
        </label>
        <div className="flex flex-wrap gap-2">
          {PREFERENCES.map((pref) => {
            const isSelected = preferences.includes(pref);
            return (
              <Badge
                key={pref}
                selected={isSelected}
                interactive
                onClick={() => togglePreference(pref)}
              >
                {pref}
              </Badge>
            );
          })}
        </div>
        <input type="hidden" {...register("preferences")} />
      </div>

      {/* Botón de Envío */}
      <div className="pt-2">
        <Button
          type="submit"
          variant="default"
          size="lg"
          disabled={isSubmitting}
          className="w-full h-12 text-base font-semibold"
        >
          {isSubmitting ? "Enviando..." : "Enviar Requerimientos"}
        </Button>
      </div>
    </form>
  );
}

