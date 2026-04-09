import { formatCurrency, formatDate } from "@/lib/utils";
import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { PagamentoBadge } from "@/components/shared/Badges";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, Printer, TrendingUp, Users, Wallet, 
  ChevronRight, ClipboardList, ArrowUpRight, ArrowDownRight,
  Target
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Financeiro() {
  const { trabalhos } = useApp();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const totalPago = useMemo(
    () => trabalhos.filter((t) => t.status_pagamento === "pago").reduce((s, t) => s + t.valor, 0),
    [trabalhos]
  );
  const totalNaoPago = useMemo(
    () => trabalhos.filter((t) => t.status_pagamento === "nao_pago").reduce((s, t) => s + t.valor, 0),
    [trabalhos]
  );
  
  const totalCustos = useMemo(
    () => trabalhos.reduce((s, t) => s + (t.custo_estimado || 0), 0),
    [trabalhos]
  );

  const totalLucro = totalPago - totalCustos;
  const totalGeral = totalPago + totalNaoPago;
  const margemGeral = totalPago > 0 ? (totalLucro / totalPago) * 100 : 0;

  // Group by month
  const monthly = useMemo(() => {
    const map: Record<string, { pago: number; nao_pago: number; custo: number; key: string }> = {};
    trabalhos.forEach((t) => {
      if (!t.data) return;
      const key = t.data.substring(0, 7); // YYYY-MM
      if (!map[key]) map[key] = { pago: 0, nao_pago: 0, custo: 0, key };
      if (t.status_pagamento === "pago") map[key].pago += t.valor;
      else map[key].nao_pago += t.valor;
      map[key].custo += (t.custo_estimado || 0);
    });
    return Object.entries(map)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, val]) => {
        const [year, month] = key.split("-").map(Number);
        const date = new Date(year, month - 1, 1);
        const label = date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
        const lucro = val.pago - val.custo;
        const margem = val.pago > 0 ? (lucro / val.pago) * 100 : 0;
        return {
          label,
          ...val,
          lucro,
          margem,
          total: val.pago + val.nao_pago,
        };
      });
  }, [trabalhos]);

  const selectedData = useMemo(() => {
    if (!selectedMonth) return null;
    const items = trabalhos.filter(t => t.data?.startsWith(selectedMonth));
    const summary = monthly.find(m => m.key === selectedMonth);
    return { items, summary };
  }, [selectedMonth, trabalhos, monthly]);

  return (
    <div className="space-y-6 animate-slide-in pb-10">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold font-oswald uppercase tracking-tight">Inteligência Financeira</h1>
          <p className="text-sm text-muted-foreground font-barlow tracking-wide">Gestão de Fluxo de Caixa e Rentabilidade Operacional</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => window.print()}
          className="gap-2 font-oswald font-bold uppercase text-xs border-border/60 shadow-sm"
        >
          <Printer className="h-4 w-4" /> Gerar Relatório PDF
        </Button>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm border-l-4 border-l-emerald-500">
           <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
           </div>
           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-barlow">Receita Líquida (Paga)</p>
           <p className="text-3xl font-bold font-oswald text-emerald-600">{formatCurrency(totalPago)}</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm border-l-4 border-l-primary relative overflow-hidden group">
           <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">
                  {margemGeral.toFixed(1)}% Margem
                </span>
              </div>
           </div>
           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-barlow">Lucro Operacional</p>
           <p className="text-3xl font-bold font-oswald text-primary">{formatCurrency(totalLucro)}</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm border-l-4 border-l-destructive">
           <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-destructive/5 flex items-center justify-center">
                <Users className="h-5 w-5 text-destructive" />
              </div>
           </div>
           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-barlow">Investimento Equipe</p>
           <p className="text-3xl font-bold font-oswald text-destructive">{formatCurrency(totalCustos)}</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm border-l-4 border-l-orange-500">
           <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-orange-600" />
              </div>
           </div>
           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-barlow">Em Aberto (Projetado)</p>
           <p className="text-3xl font-bold font-oswald text-orange-600">{formatCurrency(totalNaoPago)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Monthly Table */}
        <div className="xl:col-span-2 bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-border bg-muted/20 flex items-center justify-between">
            <h2 className="font-bold font-oswald uppercase text-xs tracking-widest">Desempenho por Período</h2>
            <span className="text-[9px] text-muted-foreground font-barlow uppercase">Clique no mês para ver o relatório</span>
          </div>
          <div className="overflow-x-auto w-full pb-2">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-6 py-4 font-bold font-oswald uppercase text-[10px] tracking-wider text-muted-foreground">Mês</th>
                  <th className="text-right px-6 py-4 font-bold font-oswald uppercase text-[10px] tracking-wider text-muted-foreground">Faturamento</th>
                  <th className="text-right px-6 py-4 font-bold font-oswald uppercase text-[10px] tracking-wider text-muted-foreground">Lucro</th>
                  <th className="text-right px-6 py-4 font-bold font-oswald uppercase text-[10px] tracking-wider text-muted-foreground">Margem</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {monthly.map((m) => (
                  <tr 
                    key={m.label} 
                    onClick={() => setSelectedMonth(m.key)}
                    className="hover:bg-muted/50 transition-all cursor-pointer group"
                  >
                    <td className="px-6 py-4 capitalize font-barlow font-bold group-hover:text-primary transition-colors">{m.label}</td>
                    <td className="px-6 py-4 text-right text-emerald-600 font-bold font-oswald">{formatCurrency(m.pago)}</td>
                    <td className="px-6 py-4 text-right text-primary font-bold font-oswald">{formatCurrency(m.lucro)}</td>
                    <td className="px-6 py-4 text-right">
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                         m.margem >= 40 ? "bg-success/10 text-success" : 
                         m.margem >= 20 ? "bg-warning/10 text-warning-foreground" : 
                         "bg-emergency/10 text-emergency"
                       }`}>
                         {m.margem.toFixed(0)}%
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mini History Sidebar */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col h-full">
          <div className="px-6 py-5 border-b border-border bg-muted/20 flex items-center justify-between">
            <h2 className="font-bold font-oswald uppercase text-xs tracking-widest">Histórico Recente</h2>
            <Target className="h-3 w-3 text-muted-foreground" />
          </div>
          <div className="flex-1 max-h-[600px] overflow-y-auto divide-y divide-border">
            {trabalhos.slice(0, 15).map((t) => (
              <div key={t.id} className="p-4 hover:bg-muted/10 transition-all flex items-center justify-between group">
                <div className="min-w-0">
                  <p className="text-xs font-bold font-oswald uppercase truncate group-hover:text-primary transition-colors">{t.titulo}</p>
                  <p className="text-[10px] text-muted-foreground font-barlow">{formatDate(t.data)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold font-oswald">{formatCurrency(t.valor)}</p>
                  <PagamentoBadge status={t.status_pagamento} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Report Modal */}
      <Dialog open={!!selectedMonth} onOpenChange={(open) => !open && setSelectedMonth(null)}>
        <DialogContent className="max-w-3xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          {selectedData && (
            <div className="flex flex-col h-full max-h-[85vh]">
              <div className="bg-foreground p-8 text-background">
                <DialogHeader className="mb-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold tracking-widest opacity-60 uppercase font-barlow">Relatório de Fechamento</span>
                      <DialogTitle className="text-4xl font-bold font-oswald uppercase leading-none">
                        {selectedData.summary?.label}
                      </DialogTitle>
                    </div>
                    <div className="bg-background/10 p-3 rounded-2xl flex flex-col items-center justify-center min-w-[100px]">
                      <span className="text-[9px] font-bold opacity-60 uppercase mb-1">Margem Real</span>
                      <span className="text-2xl font-bold font-oswald">{selectedData.summary?.margem.toFixed(0)}%</span>
                    </div>
                  </div>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold opacity-60 uppercase font-barlow">Faturamento Bruto</p>
                    <p className="text-xl font-bold font-oswald">{formatCurrency(selectedData.summary?.pago || 0)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold opacity-60 uppercase font-barlow">Investimento</p>
                    <p className="text-xl font-bold font-oswald text-emergency">{formatCurrency(selectedData.summary?.custo || 0)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold opacity-60 uppercase font-barlow">Lucro Líquido</p>
                    <p className="text-xl font-bold font-oswald text-success">{formatCurrency(selectedData.summary?.lucro || 0)}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-background space-y-4">
                <div className="flex items-center justify-between mb-2">
                   <h3 className="text-xs font-bold font-oswald uppercase tracking-widest flex items-center gap-2">
                     <ClipboardList className="h-4 w-4 text-primary" />
                     Detalhamento de Serviços
                   </h3>
                   <span className="text-[10px] text-muted-foreground font-barlow italic">
                     {selectedData.items.length} obras registradas no mês
                   </span>
                </div>
                
                <div className="space-y-2">
                  {selectedData.items.map((item) => {
                    const lucro = item.valor - (item.custo_estimado || 0);
                    const margem = item.valor > 0 ? (lucro / item.valor) * 100 : 0;
                    return (
                      <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl border border-border bg-muted/10 hover:bg-muted/20 transition-all group">
                        <div className="space-y-1">
                          <p className="text-xs font-bold font-oswald uppercase group-hover:text-primary transition-colors">{item.titulo}</p>
                          <div className="flex items-center gap-3">
                             <div className="flex items-center gap-1">
                               <Target className="h-3 w-3 text-muted-foreground" />
                               <span className="text-[10px] text-muted-foreground">VALOR: {formatCurrency(item.valor)}</span>
                             </div>
                             <div className="flex items-center gap-1">
                               <Users className="h-3 w-3 text-muted-foreground" />
                               <span className="text-[10px] text-destructive">CUSTO: {formatCurrency(item.custo_estimado || 0)}</span>
                             </div>
                          </div>
                        </div>
                        <div className="text-right">
                           <div className={`flex items-center gap-1 justify-end font-oswald font-bold ${margem >= 30 ? "text-success" : margem >= 15 ? "text-warning-foreground" : "text-emergency"}`}>
                             {margem >= 20 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                             <span className="text-sm">{formatCurrency(lucro)}</span>
                           </div>
                           <p className="text-[9px] font-bold text-muted-foreground uppercase">{margem.toFixed(0)}% MARGEM</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 bg-muted/20 border-t border-border flex justify-between items-center px-8 py-4">
                 <p className="text-[9px] text-muted-foreground max-w-[200px] leading-relaxed font-barlow italic">
                   Os cálculos acima consideram apenas obras com status de pagamento "PAGO".
                 </p>
                 <Button variant="ghost" onClick={() => setSelectedMonth(null)} className="font-oswald font-bold uppercase text-xs tracking-widest">Fechar Fechamento</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; padding: 0 !important; }
          .print\\:hidden { display: none !important; }
          .bg-card { border: none !important; shadow: none !important; }
          table { width: 100% !important; border-collapse: collapse !important; }
          th, td { border: 1px solid #e2e8f0 !important; padding: 8px !important; }
          tr { page-break-inside: avoid !important; }
          .shadow-card { box-shadow: none !important; }
          .rounded-xl { border-radius: 0 !important; }
          .rounded-2xl { border-radius: 0 !important; }
          .rounded-3xl { border-radius: 0 !important; }
        }
      `}} />
    </div>
  );
}
