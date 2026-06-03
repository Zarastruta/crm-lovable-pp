import { formatCurrency, formatDate } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Trabalho, StatusObra, OS_STATUSES } from "@/types";
import { ObraStatusBadge, PagamentoBadge } from "@/components/shared/Badges";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const COLUNAS: { key: StatusObra; cor: string }[] = [
  { key: "Novo",         cor: "border-t-zinc-400" },
  { key: "Medição",      cor: "border-t-sky-400" },
  { key: "Projeto",      cor: "border-t-violet-400" },
  { key: "Compras",      cor: "border-t-yellow-400" },
  { key: "Fabricação",   cor: "border-t-orange-500" },
  { key: "Galvanização", cor: "border-t-slate-400" },
  { key: "Pintura",      cor: "border-t-fuchsia-400" },
  { key: "Instalação",   cor: "border-t-blue-400" },
  { key: "Finalizado",   cor: "border-t-emerald-400" },
];

const PRIORIDADE_CLS: Record<string, string> = {
  "Crítica": "bg-red-100 text-red-700 border-red-200",
  "Alta":    "bg-orange-100 text-orange-700 border-orange-200",
  "Média":   "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Baixa":   "bg-zinc-100 text-zinc-600 border-zinc-200",
};

function getPrazoInfo(prazo: string | null): { vencido: boolean; urgente: boolean; label: string } | null {
  if (!prazo) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const data = new Date(prazo + "T12:00:00");
  const diff = Math.ceil((data.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0)  return { vencido: true,  urgente: false, label: `Vencido há ${Math.abs(diff)}d` };
  if (diff <= 3) return { vencido: false, urgente: true,  label: `Prazo em ${diff}d` };
  return null;
}

interface KanbanBoardProps {
  trabalhos: Trabalho[];
}

export function KanbanBoard({ trabalhos }: KanbanBoardProps) {
  const navigate = useNavigate();
  const { updateTrabalho } = useApp();

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("trabalhoId", id);
  };

  const handleDrop = (e: React.DragEvent, status: StatusObra) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("trabalhoId");
    if (id) updateTrabalho(id, { status_obra: status });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {COLUNAS.map((col) => {
        const items = trabalhos.filter((t) => (t.status_obra ?? "Novo") === col.key);
        return (
          <div
            key={col.key}
            onDrop={(e) => handleDrop(e, col.key)}
            onDragOver={handleDragOver}
            className={`bg-card rounded-xl border border-border border-t-2 ${col.cor} shadow-card min-h-[200px] flex flex-col shrink-0 w-[220px]`}
          >
            {/* Column Header */}
            <div className="px-3 py-3 border-b border-border flex items-center gap-2">
              <ObraStatusBadge status={col.key} />
              <span className="ml-auto text-xs text-muted-foreground font-medium">{items.length}</span>
            </div>

            {/* Cards */}
            <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[70vh]">
              {items.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6 opacity-60">Vazio</p>
              ) : (
                items.map((t) => {
                  const prazoInfo = getPrazoInfo(t.prazo ?? null);
                  return (
                    <div
                      key={t.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, t.id)}
                      onClick={() => navigate(`/trabalhos/${t.id}`)}
                      className={cn(
                        "bg-background rounded-lg border p-3 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 active:opacity-70 select-none",
                        prazoInfo?.vencido ? "border-red-400" : "border-border"
                      )}
                    >
                      {/* Código + prioridade */}
                      <div className="flex items-center justify-between gap-1 mb-1">
                        {t.codigo && (
                          <span className="text-[10px] font-bold text-muted-foreground font-mono">{t.codigo}</span>
                        )}
                        {t.prioridade && (
                          <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded border text-[9px] font-bold uppercase", PRIORIDADE_CLS[t.prioridade] ?? PRIORIDADE_CLS["Baixa"])}>
                            {t.prioridade}
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-semibold truncate mb-1">{t.titulo}</p>
                      <p className="text-2xs text-muted-foreground mb-2">{formatDate(t.data)}</p>

                      {/* Alerta de prazo */}
                      {prazoInfo && (
                        <div className={cn("flex items-center gap-1 text-[10px] font-bold mb-2", prazoInfo.vencido ? "text-red-600" : "text-orange-500")}>
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          {prazoInfo.label}
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold">{formatCurrency(t.valor)}</span>
                        <PagamentoBadge status={t.status_pagamento} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
