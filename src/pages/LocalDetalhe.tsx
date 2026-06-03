import { formatCurrency, formatDate } from "@/lib/utils";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, MapPin, Wrench, FileText, Plus, ChevronRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { PagamentoBadge, ObraStatusBadge, OrcamentoStatusBadge } from "@/components/shared/Badges";
import { LocalModal } from "@/components/modals/LocalModal";
import { TrabalhoModal } from "@/components/modals/TrabalhoModal";

const TIPO_LABEL: Record<string, string> = {
  residencial: "Residencial",
  comercial: "Comercial",
  industrial: "Industrial",
  obra: "Obra",
};

export default function LocalDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { locais, trabalhos, orcamentos, deleteLocal } = useApp();
  const [editOpen, setEditOpen] = useState(false);
  const [trabModalOpen, setTrabModalOpen] = useState(false);

  const local = locais.find((l) => l.id === id);
  if (!local) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
        <p>Local não encontrado.</p>
        <Button variant="outline" onClick={() => navigate("/locais")}>Voltar</Button>
      </div>
    );
  }

  const localTrabalhos = trabalhos.filter((t) => t.condominioId === id);
  const localOrcamentos = orcamentos.filter((o) => o.condominioId === id);
  const totalValor = localTrabalhos.reduce((s, t) => s + t.valor, 0);
  const naoPagos = localTrabalhos.filter((t) => t.status_pagamento === "nao_pago");

  const handleDelete = () => {
    if (confirm("Excluir este local?")) {
      deleteLocal(local.id);
      navigate("/locais");
    }
  };

  return (
    <div className="space-y-5 animate-slide-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/locais")} aria-label="Voltar">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{local.nome}</h1>
          <p className="text-sm text-muted-foreground">{TIPO_LABEL[local.tipo_local] ?? local.tipo_local}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="gap-1.5">
          <Pencil className="h-3.5 w-3.5" /> Editar
        </Button>
        <Button variant="outline" size="sm" onClick={handleDelete} className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5" aria-label="Excluir local">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Info */}
      <div className="bg-card rounded-xl border border-border p-5 shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {local.endereco && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <span>{local.endereco}</span>
            </div>
          )}
          {local.observacoes && (
            <div className="col-span-full">
              <p className="text-xs text-muted-foreground mb-1">Observações</p>
              <p className="text-sm">{local.observacoes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-xl border border-border p-4 shadow-card">
          <p className="text-xs text-muted-foreground">Ordens de Serviço</p>
          <p className="text-xl font-bold text-primary">{localTrabalhos.length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-card">
          <p className="text-xs text-muted-foreground">Valor Total</p>
          <p className="text-xl font-bold">{formatCurrency(totalValor)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-card">
          <p className="text-xs text-muted-foreground">Pendente</p>
          <p className="text-xl font-bold text-emergency">{formatCurrency(naoPagos.reduce((s, t) => s + t.valor, 0))}</p>
        </div>
      </div>

      {/* Ordens de Serviço */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <Wrench className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm">Ordens de Serviço ({localTrabalhos.length})</h2>
          <Button size="sm" variant="default" className="ml-auto h-7 text-xs gap-1" onClick={() => setTrabModalOpen(true)}>
            <Plus className="h-3 w-3" /> Nova OS
          </Button>
        </div>
        {localTrabalhos.length === 0 ? (
          <p className="text-sm text-muted-foreground p-5">Nenhuma OS para este local.</p>
        ) : (
          <ul className="divide-y divide-border">
            {localTrabalhos.map((t) => (
              <li
                key={t.id}
                onClick={() => navigate(`/trabalhos/${t.id}`)}
                className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40 cursor-pointer transition-all duration-200 hover:-translate-y-px hover:shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.titulo}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(t.data)}</p>
                </div>
                <span className="text-sm font-semibold">{formatCurrency(t.valor)}</span>
                <ObraStatusBadge status={t.status_obra ?? "Novo"} />
                <PagamentoBadge status={t.status_pagamento} />
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Orçamentos */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm">Orçamentos ({localOrcamentos.length})</h2>
        </div>
        {localOrcamentos.length === 0 ? (
          <p className="text-sm text-muted-foreground p-5">Nenhum orçamento para este local.</p>
        ) : (
          <ul className="divide-y divide-border">
            {localOrcamentos.map((o) => (
              <li
                key={o.id}
                onClick={() => navigate(`/orcamentos/${o.id}`)}
                className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40 cursor-pointer transition-all duration-200 hover:-translate-y-px hover:shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{o.titulo}</p>
                  <p className="text-xs text-muted-foreground">Nº {o.numero} · {formatDate(o.data_emissao)}</p>
                </div>
                <span className="text-sm font-semibold">{formatCurrency(o.valor)}</span>
                <OrcamentoStatusBadge status={o.status} />
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </li>
            ))}
          </ul>
        )}
      </div>

      <LocalModal open={editOpen} onClose={() => setEditOpen(false)} local={local} />
      <TrabalhoModal open={trabModalOpen} onClose={() => setTrabModalOpen(false)} defaultCondominioId={id} />
    </div>
  );
}
