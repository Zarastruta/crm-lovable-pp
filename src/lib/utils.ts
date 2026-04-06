import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina classes CSS com suporte a Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata um valor numérico para moeda brasileira (BRL)
 */
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Formata uma data para o padrão brasileiro (DD/MM/AAAA)
 * Suporta tanto string ISO quanto objetos Date
 */
export const formatDate = (date: string | Date | undefined) => {
  if (!date) return "";
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    // Se a data for inválida (NaN), retorna string vazia
    if (isNaN(d.getTime())) return "";
    
    return new Intl.DateTimeFormat('pt-BR').format(d);
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return "";
  }
};

/**
 * Retorna as cores padrão para status de orçamentos e trabalhos
 */
export const getStatusColor = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes('pendente') || s.includes('emitido')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  if (s.includes('aprovado') || s.includes('finalizado') || s.includes('concluido')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (s.includes('em andamento') || s.includes('execucao')) return 'bg-blue-100 text-blue-800 border-blue-200';
  if (s.includes('cancelado') || s.includes('rejeitado')) return 'bg-rose-100 text-rose-800 border-rose-200';
  return 'bg-gray-100 text-gray-800 border-gray-200';
};

/**
 * Retorna as cores para níveis de prioridade
 */
export const getPrioridadeColor = (prioridade: string) => {
  const p = prioridade.toLowerCase();
  if (p === 'alta' || p === 'critica' || p === 'urgente') return 'bg-rose-100 text-rose-800 border-rose-200';
  if (p === 'media') return 'bg-amber-100 text-amber-800 border-amber-200';
  if (p === 'baixa') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  return 'bg-gray-100 text-gray-800 border-gray-200';
};
