import { formatCurrency, formatDate } from "@/lib/utils";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wrench, DollarSign, ChevronRight, FileText, Hammer,
  Users, ListTodo, TrendingUp, ShoppingCart, AlertTriangle,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { PagamentoBadge, ObraStatusBadge } from "@/components/shared/Badges";
import { FaturamentoChart } from "@/components/shared/FaturamentoChart";
import { SkeletonStat } from "@/components/shared/SkeletonCard";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { trabalhos, locais, clientes, orcamentos, funcionarios, dataLoading } = useApp();
  const navigate = useNavigate();

  const hoje = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const pagos    = useMemo(() => trabalhos.filter((t) => t.status_pagamento === "pago"), [trabalhos]);
  const naoPagos = useMemo(() => trabalhos.filter((t) => t.status_pagamento === "nao_pago"), [trabalhos]);
  const osAtivas = useMemo(() => trabalhos.filter((t) => t.status_obra !== "Finalizado" && t.status_obra !== "Novo"), [trabalhos]);

  const totalPago    = useMemo(() => pagos.reduce((s, t) => s + t.valor, 0), [pagos]);
  const totalNaoPago = useMemo(() => naoPagos.reduce((s, t) => s + t.valor, 0), [naoPagos]);

  const orcEmNegociacao = useMemo(() =>
    orcamentos.filter((o) => o.status === "enviado" || o.status === "aprovado").length,
  [orcamentos]);

  const osAtrasadas = useMemo(() =>
    trabalhos.filter((t) => {
      if (!t.prazo || t.status_obra === "Finalizado") return false;
      return new Date(t.prazo + "T12:00:00") < hoje;
    }),
  [trabalhos, hoje]);

  const comprasPendentes = useMemo(() =>
    trabalhos.filter((t) => t.compras_pendentes && t.status_obra !== "Finalizado"),
  [trabalhos]);

  const recentes = useMemo(() => trabalhos.slice(0, 5), [trabalhos]);

  const getLocal   = (id: string | null) => id ? locais.find((l) => l.id === id)   : undefined;
  const getCliente = (id: string | null) => id ? clientes.find((c) => c.id === id) : undefined;

  const kpis = [
    { label: "OS Ativas",          value: osAtivas.length,             color: "text-primary",     bg: "bg-primary/5",      icon: Hammer,       href: "/os" },
    { label: "A Receber",          value: formatCurrency(totalNaoPago), color: "text-destructive", bg: "bg-destructive/5",  icon: DollarSign,   href: "/financeiro" },
    { label: "Faturado (pago)",    value: formatCurrency(totalPago),    color: "text-emerald-600", bg: "bg-emerald-50",     icon: TrendingUp,   href: "/financeiro" },
    { label: "Em Negociação",      value: orcEmNegociacao,              color: "text-blue-600",    bg: "bg-blue-50",        icon: FileText,     href: "/orcamentos" },
    { label: "OS Atrasadas",       value: osAtrasadas.length,           color: osAtrasadas.length > 0 ? "text-red-600" : "text-muted-foreground", bg: osAtrasadas.length > 0 ? "bg-red-50" : "bg-muted/30", icon: AlertTriangle, href: "/os" },
    { label: "Compras Pendentes",  value: comprasPendentes.length,      color: comprasPendentes.length > 0 ? "text-orange-600" : "text-muted-foreground", bg: comprasPendentes.length > 0 ? "bg-orange-50" : "bg-muted/30", icon: ShoppingCart, href: "/os" },
  ];

  return (
    <div className="space-y-6 animate-slide-in pb-10">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-oswald uppercase tracking-tight">Dashboard — Vulcano CRM</h1>
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

      {/* KPIs — 6 cards em 2 linhas */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {dataLoading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonStat key={i} />)
        ) : (
          kpis.map((stat) => (
            <div
              key={stat.label}
              onClick={() => navigate(stat.href)}
              className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
              </div>
              <p className="text-xs font-bold uppercase text-muted-foreground font-barlow tracking-wider">{stat.label}</p>
              <p className={cn("text-2xl font-bold font-oswald", stat.color)}>{stat.value}</p>
            </div>
          ))
        )}
      </div>

      {/* OS Atrasadas — destaque vermelho */}
      {!dataLoading && osAtrasadas.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900/40 overflow-hidden">
          <div className="px-6 py-4 border-b border-red-200 dark:border-red-900/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="font-bold font-oswald uppercase text-sm tracking-wide text-red-700 dark:text-red-400">
                OS Atrasadas ({osAtrasadas.length})
              </h2>
            </div>
            <button onClick={() => navigate("/os")} className="text-xs font-bold text-red-600 hover:underline uppercase">
              Ver todas
            </button>
          </div>
          <ul className="divide-y divide-red-100 dark:divide-red-900/30">
            {osAtrasadas.slice(0, 5).map((t) => {
              const diasAtraso = t.prazo
                ? Math.ceil((hoje.getTime() - new Date(t.prazo + "T12:00:00").getTime()) / (1000 * 60 * 60 * 24))
                : 0;
              return (
                <li
                  key={t.id}
                  onClick={() => navigate(`/os/${t.id}`)}
                  className="flex items-center gap-4 px-6 py-3 hover:bg-red-100/50 dark:hover:bg-red-900/20 cursor-pointer transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold font-oswald uppercase truncate text-red-800 dark:text-red-300">{t.titulo}</p>
                    <p className="text-xs text-red-600 dark:text-red-400 font-barlow">
                      {getLocal(t.condominioId)?.nome || getCliente(t.clienteId)?.nome || "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <ObraStatusBadge status={t.status_obra ?? "Novo"} />
                    <span className="text-xs font-bold font-oswald text-red-600 bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded-full">
                      {diasAtraso}d atraso
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-red-400 shrink-0" />
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Monitoramento */}
        <div className="xl:col-span-2 bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ListTodo className="h-4 w-4 text-primary" />
              </div>
              <h2 className="font-bold font-oswald uppercase text-sm tracking-wide">Monitoramento de OS</h2>
            </div>
            <button onClick={() => navigate("/os")} className="text-xs font-bold text-primary hover:underline uppercase">
              Ver Mapa Completo
            </button>
          </div>
          <div className="p-6 flex-1">
            {osAtivas.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-10 opacity-40">
                <Wrench className="h-10 w-10 mb-2" />
                <p className="font-barlow">Nenhuma OS em andamento no momento.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {osAtivas.slice(0, 4).map((t) => (
                  <div key={t.id} className="space-y-2 group cursor-pointer" onClick={() => navigate(`/os/${t.id}`)}>
                    <div className="flex justify-between items-end">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {t.codigo && (
                            <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                              {t.codigo}
                            </span>
                          )}
                          <p className="font-bold text-sm truncate uppercase font-oswald group-hover:text-primary transition-colors">{t.titulo}</p>
                        </div>
                        <p className="text-xs text-muted-foreground font-barlow truncate mt-0.5">
                          {t.status_obra} · {getLocal(t.condominioId)?.nome || getCliente(t.clienteId)?.nome || "—"}
                        </p>
                      </div>
                      <span className="text-sm font-bold font-oswald ml-4">{t.conclusao_percentual || 0}%</span>
                    </div>
                    <Progress value={t.conclusao_percentual || 0} className="h-2 bg-muted transition-all" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Equipe */}
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

        {/* Últimas OS */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-border bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h2 className="font-bold font-oswald uppercase text-sm tracking-wide">Últimas Atividades</h2>
            </div>
            <button onClick={() => navigate("/os")} className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
              VER TUDO
            </button>
          </div>
          <ul className="divide-y divide-border">
            {recentes.map((t) => (
              <li
                key={t.id}
                onClick={() => navigate(`/os/${t.id}`)}
                className="px-6 py-4 hover:bg-muted/30 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {t.codigo && (
                      <span className="text-[10px] font-mono text-muted-foreground shrink-0">{t.codigo}</span>
                    )}
                    <p className="text-sm font-bold uppercase font-oswald group-hover:text-primary transition-colors truncate">{t.titulo}</p>
                  </div>
                  <p className="text-xs text-muted-foreground font-barlow">{formatDate(t.data)}</p>
                </div>
                <div className="ml-4 text-right shrink-0">
                  <p className="text-sm font-bold font-oswald">{formatCurrency(t.valor)}</p>
                  <PagamentoBadge status={t.status_pagamento} />
                </div>
              </li>
            ))}
            {recentes.length === 0 && (
              <li className="px-6 py-8 text-center text-sm text-muted-foreground font-barlow italic">
                Nenhuma OS cadastrada ainda.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
