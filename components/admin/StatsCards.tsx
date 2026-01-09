import { Users, Home, Phone, TrendingUp } from "lucide-react";
import Card from "@/components/ui/Card";

interface StatsCardsProps {
  totalClients: number;
  newClientsToday: number;
  totalProperties: number;
  pendingContacts: number;
}

export default function StatsCards({
  totalClients,
  newClientsToday,
  totalProperties,
  pendingContacts,
}: StatsCardsProps) {
  const stats = [
    {
      label: "Total Clientes",
      value: totalClients,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Nuevos Hoy",
      value: newClientsToday,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Propiedades",
      value: totalProperties,
      icon: Home,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "Contactos Pendientes",
      value: pendingContacts,
      icon: Phone,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1 truncate">
                  {stat.label}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bgColor} p-2 sm:p-3 rounded-lg flex-shrink-0 ml-2`}>
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

