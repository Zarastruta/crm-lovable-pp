import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Wrench,
  Building2,
  Users,
  DollarSign,
  FileText,
  X,
  Hammer,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";
import iconImg from "@/assets/icon-pratespaiva.png";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { logout, orcamentos, trabalhos } = useApp();

  // Badge: orçamentos enviados vencendo nos próximos 7 dias
  const limite7d = new Date();
  limite7d.setDate(limite7d.getDate() + 7);
  const orcAlerta = orcamentos.filter((o) => {
    if (o.status !== "enviado" || !o.validade) return false;
    const val = new Date(o.validade);
    return val <= limite7d && val >= new Date();
  }).length;

  // Badge: trabalhos com pagamento pendente
  const finAlerta = trabalhos.filter((t) => t.status_pagamento === "nao_pago").length;

  const navGroups = [
    {
      label: "Operacional",
      items: [
        { to: "/", icon: LayoutDashboard, label: "Dashboard", badge: 0 },
        { to: "/clientes", icon: Users, label: "Clientes", badge: 0 },
        { to: "/trabalhos", icon: Wrench, label: "Trabalhos", badge: 0 },
        { to: "/ferramentas", icon: Hammer, label: "Ferramentas", badge: 0 },
        { to: "/equipe", icon: Users, label: "Equipe", badge: 0 },
        { to: "/condominios", icon: Building2, label: "Condomínios", badge: 0 },
      ]
    },
    {
      label: "Administrativo",
      items: [
        { to: "/orcamentos", icon: FileText, label: "Orçamentos", badge: orcAlerta },
        { to: "/catalogo", icon: Package, label: "Serviços", badge: 0 },
        { to: "/financeiro", icon: DollarSign, label: "Financeiro", badge: finAlerta },
      ]
    }
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-60 flex flex-col transition-transform duration-300",
          "lg:translate-x-0 lg:static lg:z-auto bg-sidebar",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <img src={iconImg} alt="PratesPaiva" className="h-8 w-8 brightness-0 invert" />
            <div>
              <p className="text-sm font-bold text-white leading-none">PratesPaiva</p>
              <p className="text-2xs text-white/50 mt-0.5">Construções e Reformas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar menu"
            className="lg:hidden p-1 rounded text-white/50 hover:text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-6">
              <p className="px-3 mb-2 text-2xs font-bold uppercase tracking-wider text-white/30">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map(({ to, icon: Icon, label, badge }) => {
                  const isActive =
                    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
                  return (
                    <li key={to}>
                      <NavLink
                        to={to}
                        onClick={onClose}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                          isActive
                            ? "bg-primary text-white"
                            : "text-white/65 hover:text-white hover:bg-white/10"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1">{label}</span>
                        {badge > 0 && (
                          <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-emergency text-white text-[10px] font-bold px-1">
                            {badge > 99 ? "99+" : badge}
                          </span>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full text-left px-3 py-2 text-xs text-white/40 hover:text-white/70 rounded transition-colors"
          >
            Sair da conta
          </button>
        </div>
      </aside>
    </>
  );
}
