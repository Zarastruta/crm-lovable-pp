import { formatCurrency, formatDate } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Trabalho, StatusObra } from "@/types";
import { ObraStatusBadge, PagamentoBadge } from "@/components/shared/Badges";

const COLUNAS: { key: StatusObra; label: string; cor: string }[] = [
  { key: "aguardando",   label: "Aguardando",   cor: "border-t-muted-foreground/30" },
  { key: "em_andamento", label: "Em Andamento", cor: "border-t-info" },
  { key: "concluido",    label: "Concluído",    cor: "border-t-success" },
  { key: "cancelado",    label: "Cancelado",    cor: "border-t-emergency" },
];

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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {COLUNAS.map((col) => {
        const items = trabalhos.filter((t) => (t.status_obra ?? "aguardando") === col.key);
        return (
          <div
            key={col.key}
            onDrop={(e) => handleDrop(e, col.key)}
            onDragOver={handleDragOver}
            className={`bg-card rounded-xl border border-border border-t-2 ${col.cor} shadow-card min-h-[200px] flex flex-col`}
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
                items.map((t) => (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, t.id)}
                    onClick={() => navigate(`/trabalhos/${t.id}`)}
                    className="bg-background rounded-lg border border-border p-3 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 active:opacity-70 select-none"
                  >
                    <p className="text-xs font-semibold truncate mb-1">{t.titulo}</p>
                    <p className="text-2xs text-muted-foreground mb-2">{formatDate(t.data)}</p>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold">{formatCurrency(t.valor)}</span>
                      <PagamentoBadge status={t.status_pagamento} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
