import { formatCurrency, formatDate } from "@/lib/utils";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Wrench, DollarSign, ChevronRight, FileText, Hammer, Users, ListTodo, TrendingUp } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { PagamentoBadge } from "@/components/shared/Badges";
import { FaturamentoChart } from "@/components/shared/FaturamentoChart";
import { SkeletonStat, SkeletonCard } from "@/components/shared/SkeletonCard";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const { trabalhos, condominios, clientes, orcamentos, funcionarios, dataLoading } = useApp();
  const navigate = useNavigate();

  const totalTrabalhos = trabalhos.length;
  const pagos = useMemo(() => trabalhos.filter((t) => t.status_pagamento === "pago"), [trabalhos]);
  const naoPagos = useMemo(() => trabalhos.filter((t) => t.status_pagamento === "nao_pago"), [trabalhos]);
  const emAndamento = useMemo(() => trabalhos.filter((t) => t.status_obra === "em_andamento"), [trabalhos]);
  const totalValor = useMemo(() => trabalhos.reduce((s, t) => s + t.valor, 0), [trabalhos]);
  const totalPago = useMemo(() => pagos.reduce((s, t) => s + t.valor, 0), [pagos]);
  const totalNaoPago = useMemo(() => naoPagos.reduce((s, t) => s + t.valor, 0), [naoPagos]);

  const recentes = useMemo(() => trabalhos.slice(0, 5), [trabalhos]);
  
  // New Operational KPIs
  const obrasCriticas = useMemo(() => 
    emAndamento.filter(t => (t.conclusao_percentual || 0) < 30).slice(0, 3)
  , [emAndamento]);

  const orcEnviados = useMemo(() => orcamentos.filter((o) => o.status === "enviado").length, [orcamentos]);
  const orcAprovados = useMemo(() => orcamentos.filter((o) => o.status === "aprovado").length, [orcamentos]);
  
  const getCondominio = (id: string | null) => id ? condominios.find((c) => c.id === id) : undefined;
  const getCliente = (id: string | null) => id ? clientes.find((c) => c.id === id) : undefined;

  return (
    <div className="space-y-6 animate-slide-in pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-oswald uppercase tracking-tight">Painel de Gestão</h1>
          <p className="text-sm text-muted-foreground font-barlow">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="hidden md:flex gap-2">
          <div className="bg-card border border-border px-4 py-2 rounded-lg shadow-sm">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Equipe Ativa</p>
            <p className="text-xl font-bold font-oswald text-primary">{funcionarios?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {dataLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonStat key={i} />)
        ) : (
          [
            { label: "Obras Ativas", value: emAndamento.length, color: "text-primary", bg: "bg-primary/5", icon: Hammer },
            { label: "A Receber", value: formatCurrency(totalNaoPago), color: "text-destructive", bg: "bg-destructive/5", icon: DollarSign },
            { label: "Faturamento", value: formatCurrency(totalPago), color: "text-emerald-600", bg: "bg-emerald-50", icon: TrendingUp },
            { label: "Orçamentos", value: orcEnviados, color: "text-blue-600", bg: "bg-blue-50", icon: FileText },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-xs font-bold uppercase text-muted-foreground font-barlow tracking-wider">{stat.label}</p>
              <p className={`text-2xl font-bold font-oswald ${stat.color}`}>{stat.value}</p>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Progress Monitoring */}
        <div className="xl:col-span-2 bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ListTodo className="h-4 w-4 text-primary" />
              </div>
              <h2 className="font-bold font-oswald uppercase text-sm tracking-wide">Monitoramento de Obras</h2>
            </div>
            <button onClick={() => navigate("/trabalhos")} className="text-xs font-bold text-primary hover:underline uppercase">Ver Mapa Completo</button>
          </div>
          <div className="p-6 flex-1">
            {emAndamento.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-10 opacity-40">
                <Wrench className="h-10 w-10 mb-2" />
                <p className="font-barlow">Nenhuma obra em andamento no momento.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {emAndamento.slice(0, 4).map((t) => (
                  <div key={t.id} className="space-y-2 group cursor-pointer" onClick={() => navigate(`/trabalhos/${t.id}`)}>
                    <div className="flex justify-between items-end">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm truncate uppercase font-oswald group-hover:text-primary transition-colors">{t.titulo}</p>
                        <p className="text-xs text-muted-foreground font-barlow truncate">
                          {t.etapa_atual || "Iniciando atividades"} · {getCondominio(t.condominioId)?.nome || getCliente(t.clienteId)?.nome}
                        </p>
                      </div>
                      <span className="text-sm font-bold font-oswald ml-4">{(t.conclusao_percentual || 0)}%</span>
                    </div>
                    <Progress value={t.conclusao_percentual || 0} className="h-2 bg-muted transition-all" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Team Quick View */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden border-l-4 border-l-primary">
          <div className="px-6 py-5 border-b border-border bg-muted/20 flex items-center gap-3">
            <Users className="h-4 w-4 text-primary" />
            <h2 className="font-bold font-oswald uppercase text-sm tracking-wide">Equipe e Parceiros</h2>
          </div>
          <div className="p-6">
            {!funcionarios || funcionarios.length === 0 ? (
              <p className="text-sm text-muted-foreground font-barlow italic">Nenhum colaborador cadastrado.</p>
            ) : (
              <div className="space-y-4">
                {funcionarios.slice(0, 6).map((f) => (
                  <div key={f.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold uppercase">
                        {f.nome.substring(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-bold font-barlow leading-none">{f.nome}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{f.tipo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold font-oswald">{formatCurrency(f.valor_diaria)}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">diária</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-4 text-xs font-bold uppercase font-oswald" onClick={() => navigate("/equipe")}>
                  Gerenciar Equipe
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FaturamentoChart />
        
        {/* Recentes Compact */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-border bg-muted/20 flex items-center justify-between">
             <div className="flex items-center gap-3">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h2 className="font-bold font-oswald uppercase text-sm tracking-wide">Últimas Atividades</h2>
            </div>
            <button onClick={() => navigate("/trabalhos")} className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors">VER TUDO</button>
          </div>
          <ul className="divide-y divide-border">
            {recentes.map((t) => (
              <li 
                key={t.id} 
                onClick={() => navigate(`/trabalhos/${t.id}`)}
                className="px-6 py-4 hover:bg-muted/30 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold uppercase font-oswald group-hover:text-primary transition-colors truncate">{t.titulo}</p>
                  <p className="text-xs text-muted-foreground font-barlow">{formatDate(t.data)}</p>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-sm font-bold font-oswald">{formatCurrency(t.valor)}</p>
                  <PagamentoBadge status={t.status_pagamento} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
