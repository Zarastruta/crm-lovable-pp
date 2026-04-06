import { formatCurrency, formatDate } from "@/lib/utils";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, ChevronRight, LayoutList, LayoutGrid } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PagamentoBadge, ObraStatusBadge } from "@/components/shared/Badges";
import { TrabalhoModal } from "@/components/modals/TrabalhoModal";
import { Progress } from "@/components/ui/progress";
import { SkeletonList } from "@/components/shared/SkeletonCard";
import { KanbanBoard } from "@/components/shared/KanbanBoard";

export default function Trabalhos() {
  const { trabalhos, condominios, clientes, dataLoading } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [pagFilter, setPagFilter] = useState("todos");
  const [obraFilter, setObraFilter] = useState("todos");
  const [sort, setSort] = useState("recente");
  const [modalOpen, setModalOpen] = useState(false);
  const [view, setView] = useState<"lista" | "kanban">("lista");

  const getCondominio = (id: string | null) => id ? condominios.find((c) => c.id === id) : undefined;
  const getCliente = (id: string | null) => id ? clientes.find((c) => c.id === id) : undefined;

  const filtered = trabalhos
    .filter((t) => {
      const cond = getCondominio(t.condominioId);
      const cliente = getCliente(t.clienteId);
      const sindico = getCliente(t.sindicoId);
      const matchSearch =
        t.titulo.toLowerCase().includes(search.toLowerCase()) ||
        (cond?.nome.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (cliente?.nome.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (sindico?.nome.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchPag = pagFilter === "todos" || t.status_pagamento === pagFilter;
      const matchObra = obraFilter === "todos" || t.status_obra === obraFilter;
      return matchSearch && matchPag && matchObra;
    })
    .sort((a, b) => {
      if (sort === "recente") return b.data.localeCompare(a.data);
      if (sort === "antigo") return a.data.localeCompare(b.data);
      if (sort === "maior_valor") return b.valor - a.valor;
      if (sort === "menor_valor") return a.valor - b.valor;
      return 0;
    });

  return (
    <div className="space-y-5 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trabalhos</h1>
          <p className="text-sm text-muted-foreground">{trabalhos.length} trabalhos cadastrados</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("lista")}
            aria-label="Visualização em lista"
            className={`p-1.5 rounded-md transition-colors ${view === "lista" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <LayoutList className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("kanban")}
            aria-label="Visualização Kanban"
            className={`p-1.5 rounded-md transition-colors ${view === "kanban" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <Button onClick={() => setModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Novo Trabalho
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar trabalhos..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={obraFilter} onValueChange={setObraFilter}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Status da Obra" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Status</SelectItem>
            <SelectItem value="aguardando">🕐 Aguardando</SelectItem>
            <SelectItem value="em_andamento">🔧 Em Andamento</SelectItem>
            <SelectItem value="concluido">✅ Concluído</SelectItem>
            <SelectItem value="cancelado">❌ Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={pagFilter} onValueChange={setPagFilter}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Pagamento" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="pago">Pago</SelectItem>
            <SelectItem value="nao_pago">Não Pago</SelectItem>
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
        <SkeletonList count={5} />
      ) : view === "kanban" ? (
        <KanbanBoard trabalhos={filtered} />
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground p-8 text-center">Nenhum serviço ou trabalho encontrado.</p>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((t) => {
                const cond = getCondominio(t.condominioId);
                const cliente = getCliente(t.clienteId);
                const sindico = getCliente(t.sindicoId);
                return (
                  <li
                    key={t.id}
                    onClick={() => navigate(`/trabalhos/${t.id}`)}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-muted/40 cursor-pointer transition-colors hover-lift"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-sm truncate uppercase font-oswald">{t.titulo}</p>
                        <ObraStatusBadge status={t.status_obra ?? "aguardando"} />
                      </div>
                      <div className="flex flex-col gap-1.5 max-w-sm">
                        <p className="text-xs text-muted-foreground font-barlow truncate">
                          {cond?.nome ?? cliente?.nome ?? "—"}
                          {sindico ? ` · Síndico: ${sindico.nome}` : ""}
                          {" · "}{formatDate(t.data)}
                        </p>
                        {t.status_obra === "em_andamento" && (
                          <div className="flex items-center gap-2">
                             <Progress value={t.conclusao_percentual || 0} className="h-1 flex-1" />
                             <span className="text-[10px] font-bold font-oswald">{(t.conclusao_percentual || 0)}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
                      <div className="text-right">
                        <p className="text-sm font-bold font-oswald">{formatCurrency(t.valor)}</p>
                        <PagamentoBadge status={t.status_pagamento} />
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      <TrabalhoModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
