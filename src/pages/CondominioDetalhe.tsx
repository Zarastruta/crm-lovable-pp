import { formatCurrency, formatDate } from "@/lib/utils";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, MapPin, Wrench, FileText, Plus, ChevronRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { PagamentoBadge, ObraStatusBadge, OrcamentoStatusBadge } from "@/components/shared/Badges";
import { CondominioModal } from "@/components/modals/CondominioModal";
import { TrabalhoModal } from "@/components/modals/TrabalhoModal";

export default function CondominioDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { condominios, clientes, trabalhos, orcamentos, deleteCondominio, dataLoading } = useApp();
  const [editOpen, setEditOpen] = useState(false);
  const [trabModalOpen, setTrabModalOpen] = useState(false);

  const cond = condominios.find((c) => c.id === id);
  if (!cond) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
        <p>Condomínio não encontrado.</p>
        <Button variant="outline" onClick={() => navigate("/condominios")}>Voltar</Button>
      </div>
    );
  }

  const sindico = cond.sindicoId ? clientes.find((c) => c.id === cond.sindicoId) : undefined;
  const admin = cond.administradoraId ? clientes.find((c) => c.id === cond.administradoraId) : undefined;
  const condTrabalhos = trabalhos.filter((t) => t.condominioId === id);
  const condOrcamentos = orcamentos.filter((o) => o.condominioId === id);
  const totalValor = condTrabalhos.reduce((s, t) => s + t.valor, 0);
  const naoPagos = condTrabalhos.filter((t) => t.status_pagamento === "nao_pago");

  const handleDelete = () => {
    if (confirm("Excluir este condomínio?")) {
      deleteCondominio(cond.id);
      navigate("/condominios");
    }
  };

  return (
    <div className="space-y-5 animate-slide-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/condominios")} aria-label="Voltar">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{cond.nome}</h1>
          {cond.cnpj && <p className="text-sm text-muted-foreground">CNPJ: {cond.cnpj}</p>}
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="gap-1.5">
          <Pencil className="h-3.5 w-3.5" /> Editar
        </Button>
        <Button variant="outline" size="sm" onClick={handleDelete} className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5" aria-label="Excluir condomínio">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Info */}
      <div className="bg-card rounded-xl border border-border p-5 shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cond.endereco && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <span>{cond.endereco}</span>
            </div>
          )}
          {sindico && (
            <div>
              <p className="text-xs text-muted-foreground">Síndico</p>
              <button onClick={() => navigate(`/clientes/${sindico.id}`)} className="text-sm text-primary hover:underline">
                {sindico.nome}
              </button>
            </div>
          )}
          {admin && (
            <div>
              <p className="text-xs text-muted-foreground">Administradora</p>
              <button onClick={() => navigate(`/clientes/${admin.id}`)} className="text-sm text-primary hover:underline">
                {admin.nome}
              </button>
            </div>
          )}
          {cond.observacoes && (
            <div className="col-span-full">
              <p className="text-xs text-muted-foreground mb-1">Observações</p>
              <p className="text-sm">{cond.observacoes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-xl border border-border p-4 shadow-card">
          <p className="text-xs text-muted-foreground">Trabalhos</p>
          <p className="text-xl font-bold text-primary">{condTrabalhos.length}</p>
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

      {/* Trabalhos */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <Wrench className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm">Trabalhos ({condTrabalhos.length})</h2>
          <Button size="sm" variant="default" className="ml-auto h-7 text-xs gap-1" onClick={() => setTrabModalOpen(true)}>
            <Plus className="h-3 w-3" /> Novo
          </Button>
        </div>
        {condTrabalhos.length === 0 ? (
          <p className="text-sm text-muted-foreground p-5">Nenhum trabalho para este condomínio.</p>
        ) : (
          <ul className="divide-y divide-border">
            {condTrabalhos.map((t) => (
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
                <ObraStatusBadge status={t.status_obra ?? "aguardando"} />
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
          <h2 className="font-semibold text-sm">Orçamentos ({condOrcamentos.length})</h2>
        </div>
        {condOrcamentos.length === 0 ? (
          <p className="text-sm text-muted-foreground p-5">Nenhum orçamento para este condomínio.</p>
        ) : (
          <ul className="divide-y divide-border">
            {condOrcamentos.map((o) => (
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

      <CondominioModal open={editOpen} onClose={() => setEditOpen(false)} condominio={cond} />
      <TrabalhoModal open={trabModalOpen} onClose={() => setTrabModalOpen(false)} defaultCondominioId={id} />
    </div>
  );
}
