"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { Link, Loader2, Check, AlertCircle } from "lucide-react";

interface ScrapedData {
  title: string;
  price: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  location: string;
  address?: string;
  description?: string;
  images: string[];
}

export default function ScrapePropertyForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setScrapedData(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/properties/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setError(`Esta propiedad ya existe. ID: ${data.propertyId}`);
        } else {
          setError(data.error || "Error al hacer scraping");
        }
        return;
      }

      setScrapedData(data.scraped);
      setSuccess(true);
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push(`/admin/properties/${data.property.id}`);
        router.refresh();
      }, 2000);
    } catch (error) {
      console.error("Error scraping:", error);
      setError("Error al procesar la URL");
    } finally {
      setLoading(false);
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

  return (
    <Card className="p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
          Agregar Propiedad desde URL
        </h2>
        <p className="text-xs sm:text-sm text-slate-600">
          Pega el link de una propiedad de Wasi/Remax y el sistema extraerá
          automáticamente toda la información.
        </p>
      </div>

      <form onSubmit={handleScrape} className="space-y-3 sm:space-y-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
            URL de la Propiedad <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://info.wasi.co/... o https://remaxhabitat.com/..."
              className="flex-1 text-sm sm:text-base"
              required
            />
            <Button
              type="submit"
              variant="default"
              disabled={loading || !url}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Extrayendo...</span>
                  <span className="sm:hidden">Extrayendo</span>
                </>
              ) : (
                <>
                  <Link className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Extraer Info</span>
                  <span className="sm:hidden">Extraer</span>
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Soporta URLs de remaxhabitat.com, wasi.co e info.wasi.co
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && scrapedData && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Check className="w-5 h-5 text-green-600" />
              <p className="text-sm font-medium text-green-900">
                ¡Propiedad agregada exitosamente!
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-slate-900">{scrapedData.title}</p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-blue-100 text-blue-700">
                  {formatCurrency(scrapedData.price)}
                </Badge>
                <Badge className="bg-slate-100 text-slate-700">
                  {scrapedData.propertyType}
                </Badge>
                {scrapedData.bedrooms > 0 && (
                  <Badge className="bg-slate-100 text-slate-700">
                    {scrapedData.bedrooms} hab.
                  </Badge>
                )}
                {scrapedData.bathrooms > 0 && (
                  <Badge className="bg-slate-100 text-slate-700">
                    {scrapedData.bathrooms} baños
                  </Badge>
                )}
                {scrapedData.parking > 0 && (
                  <Badge className="bg-slate-100 text-slate-700">
                    {scrapedData.parking} estac.
                  </Badge>
                )}
              </div>
              <p className="text-slate-600">Redirigiendo...</p>
            </div>
          </div>
        )}

        {scrapedData && !success && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-sm font-medium text-slate-900 mb-2">
              Información extraída:
            </p>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Título:</span> {scrapedData.title}
              </p>
              <p>
                <span className="font-medium">Precio:</span>{" "}
                {formatCurrency(scrapedData.price)}
              </p>
              <p>
                <span className="font-medium">Tipo:</span>{" "}
                {scrapedData.propertyType}
              </p>
              <p>
                <span className="font-medium">Ubicación:</span>{" "}
                {scrapedData.location}
              </p>
            </div>
          </div>
        )}
      </form>
    </Card>
  );
}

