"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { ExternalLink, Send, Home, MapPin, DollarSign } from "lucide-react";

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
  address: string | null;
}

interface Match {
  property: Property;
  score: number;
  reasons: string[];
}

interface MatchPropertiesProps {
  clientId: string;
  onPropertySent: () => void;
}

export default function MatchProperties({
  clientId,
  onPropertySent,
}: MatchPropertiesProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingPropertyId, setSendingPropertyId] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetchMatches();
  }, [clientId]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/clients/${clientId}/match`);
      if (response.ok) {
        const data = await response.json();
        setMatches(data);
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendProperty = async (propertyId: string) => {
    setSendingPropertyId(propertyId);
    try {
      const response = await fetch(`/api/clients/${clientId}/properties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyId,
        }),
      });

      if (response.ok) {
        onPropertySent();
        // Remover propiedad de la lista de matches
        setMatches(matches.filter((m) => m.property.id !== propertyId));
      }
    } catch (error) {
      console.error("Error sending property:", error);
    } finally {
      setSendingPropertyId(null);
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
      <Card className="p-6">
        <p className="text-slate-600 text-center py-8">
          Buscando propiedades compatibles...
        </p>
      </Card>
    );
  }

  if (matches.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-slate-600 text-center py-8">
          No se encontraron propiedades compatibles
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6">
      <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4">
        Propiedades Recomendadas ({matches.length})
      </h2>
      <div className="space-y-3 sm:space-y-4">
        {matches.map((match) => (
          <div
            key={match.property.id}
            className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200"
          >
            <div className="flex items-start justify-between mb-3 gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate">
                    {match.property.title}
                  </h3>
                  <Badge className="bg-green-100 text-green-700 text-xs flex-shrink-0">
                    {match.score}% match
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-slate-600 mb-2">
                  <span className="flex items-center gap-1">
                    <Home className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{match.property.property_type}</span>
                  </span>
                  <span>{match.property.bedrooms} hab.</span>
                  <span>{match.property.bathrooms} baños</span>
                  <span>{match.property.parking} estac.</span>
                  <span className="flex items-center gap-1 min-w-0">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{match.property.location}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1 text-base sm:text-lg font-bold text-slate-900 mb-2">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate">{formatCurrency(match.property.price)}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {match.reasons.slice(0, 3).map((reason, idx) => (
                    <Badge
                      key={idx}
                      className="bg-blue-100 text-blue-700 text-xs"
                    >
                      {reason}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(match.property.wasi_url, "_blank")}
                className="flex-1 sm:flex-initial text-xs sm:text-sm"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Ver en Wasi</span>
                <span className="sm:hidden">Wasi</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleSendProperty(match.property.id)}
                disabled={sendingPropertyId === match.property.id}
                className="flex-1 sm:flex-initial text-xs sm:text-sm"
              >
                <Send className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">
                  {sendingPropertyId === match.property.id
                    ? "Enviando..."
                    : "Enviar al Cliente"}
                </span>
                <span className="sm:hidden">
                  {sendingPropertyId === match.property.id ? "..." : "Enviar"}
                </span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

