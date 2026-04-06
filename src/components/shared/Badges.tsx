import { 
  formatCurrency, 
  formatDate, 
  getStatusColor, 
  getPrioridadeColor, 
  cn 
} from "@/lib/utils";
import { TipoContato, StatusPagamento, StatusOrcamento, StatusObra } from "@/types";

/**
 * Componente base de Badge
 */
interface BadgeProps {
  className?: string;
  children: React.ReactNode;
}

function Badge({ className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border transition-colors",
        className
      )}
    >
      {children}
    </span>
  );
}

/**
 * Componente de Badge para Status (renderiza as cores corretas via getStatusColor)
 */
export const StatusBadge = ({ status, className }: { status: string, className?: string }) => (
  <Badge className={cn(getStatusColor(status || ""), className)}>
    {(status || "Pendente").toUpperCase()}
  </Badge>
);

/**
 * Componente de Badge para Prioridade (renderiza as cores via getPrioridadeColor)
 */
export const PrioridadeBadge = ({ prioridade, className }: { prioridade: string, className?: string }) => (
  <Badge className={cn(getPrioridadeColor(prioridade || ""), className)}>
    {(prioridade || "Média").toUpperCase()}
  </Badge>
);

/**
 * Badge de Status de Pagamento
 */
const pagamentoColors: Record<StatusPagamento, string> = {
  nao_pago: "bg-rose-50 text-rose-700 border-rose-100",
  pago: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

const pagamentoLabels: Record<StatusPagamento, string> = {
  nao_pago: "Não Pago",
  pago: "Pago",
};

export function PagamentoBadge({ status }: { status: StatusPagamento }) {
  return (
    <Badge className={pagamentoColors[status]}>{pagamentoLabels[status]}</Badge>
  );
}

/**
 * Badge de Tipo de Contato/Cliente
 */
const tipoContatoMap: Record<TipoContato, { label: string; cls: string }> = {
  sindico: { label: "Síndico", cls: "bg-amber-50 text-amber-700 border-amber-100" },
  pessoa_fisica: { label: "Pessoa Física", cls: "bg-blue-50 text-blue-700 border-blue-100" },
  empresa: { label: "Empresa", cls: "bg-indigo-50 text-indigo-700 border-indigo-100" },
  administradora: { label: "Administradora", cls: "bg-slate-50 text-slate-700 border-slate-100" },
};

export function TipoContatoBadge({ tipo }: { tipo: TipoContato }) {
  const item = tipoContatoMap[tipo] ?? { label: tipo, cls: "bg-slate-50 text-slate-700 border-slate-100" };
  return <Badge className={item.cls}>{item.label}</Badge>;
}

/**
 * Badge de Status de Orçamento
 */
const orcamentoStatusMap: Record<StatusOrcamento, { label: string; cls: string }> = {
  rascunho: { label: "Rascunho", cls: "bg-slate-50 text-slate-700 border-slate-100" },
  enviado: { label: "Enviado", cls: "bg-blue-50 text-blue-700 border-blue-100" },
  aprovado: { label: "Aprovado", cls: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  recusado: { label: "Recusado", cls: "bg-rose-50 text-rose-700 border-rose-100" },
  vencido: { label: "Vencido", cls: "bg-orange-50 text-orange-700 border-orange-100" },
  convertido: { label: "Convertido", cls: "bg-violet-50 text-violet-700 border-violet-100" },
};

export function OrcamentoStatusBadge({ status }: { status: StatusOrcamento }) {
  const item = orcamentoStatusMap[status] ?? { label: status, cls: "bg-slate-50 text-slate-700 border-slate-100" };
  return <Badge className={item.cls}>{item.label}</Badge>;
}

/**
 * Badge de Status de Obra/Trabalho
 */
const obraStatusMap: Record<StatusObra, { label: string; cls: string; icon: string }> = {
  aguardando:   { label: "Aguardando",   cls: "bg-slate-50 text-slate-700 border-slate-100",  icon: "🕐" },
  em_andamento: { label: "Em Andamento", cls: "bg-blue-50 text-blue-700 border-blue-100",    icon: "🔧" },
  concluido:    { label: "Concluído",    cls: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: "✅" },
  cancelado:    { label: "Cancelado",    cls: "bg-rose-50 text-rose-700 border-rose-100",   icon: "❌" },
};

export function ObraStatusBadge({ status }: { status: StatusObra }) {
  const item = obraStatusMap[status] ?? { label: status, cls: "bg-slate-50 text-slate-700 border-slate-100", icon: "" };
  return <Badge className={item.cls}>{item.icon} {item.label}</Badge>;
}

/**
 * Badge de Alerta de Vencimento
 */
export function VencimentoBadge({ validade }: { validade: string | null }) {
  if (!validade) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataVal = new Date(validade + "T12:00:00");
  const diff = Math.ceil((dataVal.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return null;
  if (diff <= 7) return <Badge className="bg-amber-50 text-amber-700 border-amber-100 animate-pulse">⚠️ Vence em {diff}d</Badge>;
  return null;
}

// Arquivo puramente de UI componentes - Compatível com Fast Refresh
