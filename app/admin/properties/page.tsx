"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PropertyCard from "@/components/admin/PropertyCard";
import ScrapePropertyForm from "@/components/admin/ScrapePropertyForm";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { Search, Plus, Filter, Link } from "lucide-react";

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

export default function PropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showScrapeForm, setShowScrapeForm] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, [activeFilter]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeFilter !== "all") {
        params.append("is_active", activeFilter === "active" ? "true" : "false");
      }
      if (search) {
        params.append("search", search);
      }

      const response = await fetch(`/api/properties?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProperties();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="text-center -mt-2 sm:-mt-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Propiedades</h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Gestiona las propiedades disponibles
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => setShowScrapeForm(!showScrapeForm)}
            className="text-sm sm:text-base flex-1 sm:flex-initial"
          >
            <Link className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">{showScrapeForm ? "Cancelar" : "Desde URL"}</span>
            <span className="sm:hidden">{showScrapeForm ? "Cancelar" : "URL"}</span>
          </Button>
          <Button
            variant="default"
            onClick={() => router.push("/admin/properties/new")}
            className="text-sm sm:text-base flex-1 sm:flex-initial"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Nueva Propiedad</span>
            <span className="sm:hidden">Nueva</span>
          </Button>
        </div>
      </div>

      {showScrapeForm && (
        <div className="mb-6">
          <ScrapePropertyForm />
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 space-y-3 sm:space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
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

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-600 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium text-slate-700">Estado:</span>
          {["all", "active", "inactive"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className="active:scale-95 transition-transform"
            >
              <Badge
                className={
                  activeFilter === filter
                    ? "bg-slate-900 text-white text-xs"
                    : "bg-slate-100 text-slate-700 active:bg-slate-200 text-xs"
                }
              >
                {filter === "all"
                  ? "Todas"
                  : filter === "active"
                  ? "Activas"
                  : "Inactivas"}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Lista de propiedades */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-600">Cargando propiedades...</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-slate-600 mb-4">
            No se encontraron propiedades con los filtros seleccionados.
          </p>
          <Button
            variant="default"
            onClick={() => router.push("/admin/properties/new")}
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Primera Propiedad
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {properties.map((property) => (
            <PropertyCard 
              key={property.id} 
              property={property}
              onDelete={fetchProperties}
            />
          ))}
        </div>
      )}
    </div>
  );
}

