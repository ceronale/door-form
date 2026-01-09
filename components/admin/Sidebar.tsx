"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Home,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { createClientSupabase } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClientSupabase();

  // Escuchar cambios en el DOM para sincronizar con TopBar
  useEffect(() => {
    const sidebar = document.querySelector('[data-sidebar]') as HTMLElement;
    if (!sidebar) return;

    const observer = new MutationObserver(() => {
      const hasHidden = sidebar.classList.contains('-translate-x-full');
      if (hasHidden && isOpen) {
        setIsOpen(false);
      } else if (!hasHidden && !isOpen) {
        setIsOpen(true);
      }
    });

    observer.observe(sidebar, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, [isOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const navItems = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/admin/clients",
      label: "Clientes",
      icon: Users,
    },
    {
      href: "/admin/properties",
      label: "Propiedades",
      icon: Home,
    },
  ];

  return (
    <>
      {/* Mobile menu button - ahora se maneja desde el layout */}

      {/* Sidebar */}
      <aside
        data-sidebar
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white border-r border-slate-200
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-4 sm:p-6 border-b border-slate-200">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              CRM Inmobiliario
            </h2>
            <p className="text-xs text-slate-500 mt-1">Panel de Control</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 sm:p-4 space-y-1.5 sm:space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    setIsOpen(false);
                    // Cerrar sidebar en móvil
                    const sidebar = document.querySelector('[data-sidebar]') as HTMLElement;
                    if (sidebar && window.innerWidth < 1024) {
                      sidebar.classList.add('-translate-x-full');
                    }
                    // Cerrar overlay del TopBar
                    const topbarMenu = document.querySelector('[data-topbar-menu]') as HTMLElement;
                    if (topbarMenu) {
                      const menuButton = topbarMenu.querySelector('button[aria-label="Menú"]') as HTMLElement;
                      if (menuButton) {
                        menuButton.click();
                      }
                    }
                  }}
                  className={`
                    flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg
                    transition-colors active:scale-95
                    ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 active:bg-slate-100"
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium text-sm sm:text-base">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-3 sm:p-4 border-t border-slate-200">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-sm"
            >
              <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile - removido, ahora se maneja desde TopBar */}
    </>
  );
}

