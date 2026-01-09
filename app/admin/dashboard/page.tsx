"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatsCards from "@/components/admin/StatsCards";
import Card from "@/components/ui/Card";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Stats {
  totalClients: number;
  newClientsToday: number;
  totalProperties: number;
  pendingContacts: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalClients: 0,
    newClientsToday: 0,
    totalProperties: 0,
    pendingContacts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-600">Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center -mt-2 sm:-mt-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 sm:mb-2">Dashboard</h1>
        <p className="text-sm sm:text-base text-slate-600">
          {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
      </div>

      <StatsCards
        totalClients={stats.totalClients}
        newClientsToday={stats.newClientsToday}
        totalProperties={stats.totalProperties}
        pendingContacts={stats.pendingContacts}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4">
            Resumen Rápido
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Clientes Totales</span>
              <span className="font-semibold text-slate-900">
                {stats.totalClients}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Nuevos Hoy</span>
              <span className="font-semibold text-green-600">
                {stats.newClientsToday}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Propiedades Activas</span>
              <span className="font-semibold text-slate-900">
                {stats.totalProperties}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Pendientes de Contacto</span>
              <span className="font-semibold text-orange-600">
                {stats.pendingContacts}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4">
            Acciones Rápidas
          </h2>
          <div className="space-y-2">
            <Link
              href="/admin/clients"
              className="block p-3 rounded-lg bg-slate-50 active:bg-slate-100 transition-colors"
            >
              <span className="font-medium text-sm sm:text-base text-slate-900">
                Ver Todos los Clientes
              </span>
            </Link>
            <Link
              href="/admin/properties"
              className="block p-3 rounded-lg bg-slate-50 active:bg-slate-100 transition-colors"
            >
              <span className="font-medium text-sm sm:text-base text-slate-900">
                Gestionar Propiedades
              </span>
            </Link>
            {stats.pendingContacts > 0 && (
              <Link
                href="/admin/clients?status=new"
                className="block p-3 rounded-lg bg-orange-50 active:bg-orange-100 transition-colors"
              >
                <span className="font-medium text-sm sm:text-base text-orange-900">
                  Contactar {stats.pendingContacts} Cliente
                  {stats.pendingContacts > 1 ? "s" : ""} Nuevo
                  {stats.pendingContacts > 1 ? "s" : ""}
                </span>
              </Link>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

