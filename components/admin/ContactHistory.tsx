"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Phone,
  Mail,
  MessageSquare,
  MapPin,
  Calendar,
  Plus,
  X,
} from "lucide-react";

interface Contact {
  id: string;
  contact_type: string;
  notes: string;
  contact_date: string;
  next_follow_up: string | null;
}

interface ContactHistoryProps {
  clientId: string;
  contacts: Contact[];
  onContactAdded: () => void;
}

const contactTypeIcons: Record<string, any> = {
  call: Phone,
  email: Mail,
  whatsapp: MessageSquare,
  visit: MapPin,
  meeting: Calendar,
  other: Calendar,
};

const contactTypeLabels: Record<string, string> = {
  call: "Llamada",
  email: "Email",
  whatsapp: "WhatsApp",
  visit: "Visita",
  meeting: "Reunión",
  other: "Otro",
};

export default function ContactHistory({
  clientId,
  contacts,
  onContactAdded,
}: ContactHistoryProps) {
  const [showForm, setShowForm] = useState(false);
  const [contactType, setContactType] = useState("call");
  const [notes, setNotes] = useState("");
  const [nextFollowUp, setNextFollowUp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/clients/${clientId}/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contactType,
          notes,
          nextFollowUp: nextFollowUp || null,
        }),
      });

      if (response.ok) {
        setShowForm(false);
        setNotes("");
        setNextFollowUp("");
        onContactAdded();
      }
    } catch (error) {
      console.error("Error creating contact:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">Historial de Contactos</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(!showForm)}
          className="text-xs sm:text-sm w-full sm:w-auto"
        >
          {showForm ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Nuevo Contacto</span>
              <span className="sm:hidden">Nuevo</span>
            </>
          )}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 sm:mb-6 p-3 sm:p-4 bg-slate-50 rounded-lg space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
              Tipo de Contacto
            </label>
            <select
              value={contactType}
              onChange={(e) => setContactType(e.target.value)}
              className="w-full px-3 py-2 text-sm sm:text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {Object.entries(contactTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
              Notas
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm sm:text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
              Próximo Seguimiento (opcional)
            </label>
            <Input
              type="datetime-local"
              value={nextFollowUp}
              onChange={(e) => setNextFollowUp(e.target.value)}
              className="text-sm sm:text-base"
            />
          </div>

          <Button type="submit" variant="default" disabled={loading} className="w-full text-sm sm:text-base">
            Guardar Contacto
          </Button>
        </form>
      )}

      <div className="space-y-2 sm:space-y-3">
        {contacts.length === 0 ? (
          <p className="text-xs sm:text-sm text-slate-500 text-center py-6 sm:py-8">
            No hay contactos registrados
          </p>
        ) : (
          contacts.map((contact) => {
            const Icon = contactTypeIcons[contact.contact_type] || Calendar;
            return (
              <div
                key={contact.id}
                className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                      <span className="font-medium text-xs sm:text-sm text-slate-900">
                        {contactTypeLabels[contact.contact_type] || "Otro"}
                      </span>
                      <span className="text-xs text-slate-500">
                        {format(
                          new Date(contact.contact_date),
                          "d MMM yyyy, HH:mm",
                          { locale: es }
                        )}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 mb-2 break-words">
                      {contact.notes}
                    </p>
                    {contact.next_follow_up && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 flex-wrap">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span>Próximo seguimiento: </span>
                        <span>
                          {format(
                            new Date(contact.next_follow_up),
                            "d MMM yyyy, HH:mm",
                            { locale: es }
                          )}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}

