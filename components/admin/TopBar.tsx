"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function TopBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm" data-topbar-menu>
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-3">
        {/* Izquierda: Menú móvil */}
        <div className="flex items-center gap-2">
          {/* Botón menú móvil */}
          <button
            onClick={() => {
              const newState = !isMenuOpen;
              setIsMenuOpen(newState);
              // Toggle sidebar usando evento
              const sidebar = document.querySelector('[data-sidebar]') as HTMLElement;
              if (sidebar) {
                if (newState) {
                  sidebar.classList.remove('-translate-x-full');
                } else {
                  sidebar.classList.add('-translate-x-full');
                }
                // Disparar evento personalizado
                sidebar.dispatchEvent(new CustomEvent('toggle'));
              }
            }}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors"
            aria-label="Menú"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5 text-slate-700" />
            ) : (
              <Menu className="w-5 h-5 text-slate-700" />
            )}
          </button>
        </div>

        {/* Derecha: Espacio para botones de acción */}
        <div id="topbar-actions" className="flex items-center gap-2 relative z-50">
          {/* Los botones de acción se insertan aquí desde cada página */}
        </div>
      </div>

      {/* Overlay del menú móvil - detrás del sidebar pero delante del contenido */}
      {isMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => {
            setIsMenuOpen(false);
            const sidebar = document.querySelector('[data-sidebar]') as HTMLElement;
            if (sidebar) {
              sidebar.classList.add('-translate-x-full');
              sidebar.dispatchEvent(new CustomEvent('toggle'));
            }
          }}
        />
      )}
    </div>
  );
}

