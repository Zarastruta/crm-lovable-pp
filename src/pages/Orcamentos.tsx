import { formatCurrency, formatDate } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, ChevronRight, FileText } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { StatusOrcamento } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrcamentoStatusBadge, VencimentoBadge } from "@/components/shared/Badges";
import { OrcamentoModal } from "@/components/modals/OrcamentoModal";
import { SkeletonList } from "@/components/shared/SkeletonCard";

export default function Orcamentos() {
  const { orcamentos, condominios, clientes, dataLoading, batchUpdateOrcamentosStatus } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [sort, setSort] = useState("recente");
  const [modalOpen, setModalOpen] = useState(false);

  // Atualiza automaticamente orçamentos vencidos no banco (surgical update)
  useEffect(() => {
    if (dataLoading || orcamentos.length === 0) return;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const idsParaVencer = orcamentos
      .filter((o) => o.status === "enviado" && o.validade && new Date(o.validade) < hoje)
      .map((o) => o.id);

    if (idsParaVencer.length > 0) {
      batchUpdateOrcamentosStatus(idsParaVencer, "vencido");
    }
  }, [orcamentos, dataLoading, batchUpdateOrcamentosStatus]);

  const getCondominio = (id: string | null) => id ? condominios.find((c) => c.id === id) : undefined;
  const getCliente = (id: string | null) => id ? clientes.find((c) => c.id === id) : undefined;

  // Marca automaticamente orçamentos vencidos na visualização (sem alterar BD)
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const filtered = orcamentos
    .filter((o) => {
      const cond = getCondominio(o.condominioId);
      const cliente = getCliente(o.clienteId);
      const sindico = getCliente(o.sindicoId);
      const matchSearch =
        o.titulo.toLowerCase().includes(search.toLowerCase()) ||
        (cond?.nome.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (cliente?.nome.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (sindico?.nome.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchStatus = statusFilter === "todos" || o.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sort === "recente") return b.data_emissao.localeCompare(a.data_emissao);
      if (sort === "antigo") return a.data_emissao.localeCompare(b.data_emissao);
      if (sort === "maior_valor") return b.valor - a.valor;
      if (sort === "menor_valor") return a.valor - b.valor;
      return 0;
    });

  return (
    <div className="space-y-5 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orçamentos</h1>
          <p className="text-sm text-muted-foreground">{orcamentos.length} orçamentos cadastrados</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Orçamento
        </Button>
      </div>

      {/* M4: KPIs */}
      {!dataLoading && orcamentos.length > 0 && (() => {
        const aprovados  = orcamentos.filter(o => o.status === "aprovado");
        const enviados   = orcamentos.filter(o => o.status === "enviado");
        const abertos    = [...aprovados, ...enviados];
        const valorAberto = abertos.reduce((s, o) => s + o.valor, 0);
        const valorAprovado = aprovados.reduce((s, o) => s + o.valor, 0);
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-card border border-border rounded-xl px-4 py-3">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Total</p>
              <p className="text-xl font-bold font-oswald">{orcamentos.length}</p>
            </div>
            <div className="bg-card border border-border rounded-xl px-4 py-3">
              <p className="text-[9px] font-bold uppercase tracking-widest text-orange-500">Aguardando</p>
              <p className="text-xl font-bold font-oswald text-orange-500">{enviados.length}</p>
            </div>
            <div className="bg-card border border-emerald-200 dark:border-emerald-900/50 rounded-xl px-4 py-3">
              <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-600">Aprovados</p>
              <p className="text-xl font-bold font-oswald text-emerald-600">{formatCurrency(valorAprovado)}</p>
            </div>
            <div className="bg-card border border-primary/20 rounded-xl px-4 py-3">
              <p className="text-[9px] font-bold uppercase tracking-widest text-primary">Em Aberto</p>
              <p className="text-xl font-bold font-oswald text-primary">{formatCurrency(valorAberto)}</p>
            </div>
          </div>
        );
      })()}
      <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar orçamentos..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="rascunho">Rascunho</SelectItem>
            <SelectItem value="enviado">Enviado</SelectItem>
            <SelectItem value="aprovado">Aprovado</SelectItem>
            <SelectItem value="recusado">Recusado</SelectItem>
            <SelectItem value="vencido">Vencido</SelectItem>
            <SelectItem value="convertido">Convertido</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Ordenar" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="recente">Mais Recente</SelectItem>
            <SelectItem value="antigo">Mais Antigo</SelectItem>
            <SelectItem value="maior_valor">Maior Valor</SelectItem>
            <SelectItem value="menor_valor">Menor Valor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {dataLoading ? (
        <SkeletonList count={6} />
      ) : (
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground p-8 text-center">Nenhum orçamento encontrado.</p>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((o) => {
              const cond = getCondominio(o.condominioId);
              const cliente = getCliente(o.clienteId);
              return (
                <li
                  key={o.id}
                  onClick={() => navigate(`/orcamentos/${o.id}`)}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-muted/40 cursor-pointer transition-colors hover-lift"
                >
                  <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      <span className="text-muted-foreground font-normal">#{o.numero}</span> {o.titulo}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {cond?.nome ?? cliente?.nome ?? "—"} · {formatDate(o.data_emissao)}
                      {o.validade ? ` · Válido até ${formatDate(o.validade)}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    <span className="text-sm font-semibold">{formatCurrency(o.valor)}</span>
                    <VencimentoBadge validade={o.validade} />
                    <OrcamentoStatusBadge status={o.status as StatusOrcamento} />
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      )}

      <OrcamentoModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
