import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Plus, Trash2, Tag, Save, ArrowRight, User, HelpCircle, Info, CheckCircle2, ChevronLeft, ChevronRight, UserPlus } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Orcamento, StatusOrcamento, CatalogoServico, OrcamentoItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { addDays } from "date-fns";
import { ContatoModal } from "./ContatoModal";

const DEFAULT_CONDICOES = "Entrada de 50% na aprovação e 50% na conclusão dos serviços.";
const DEFAULT_PRAZO = "Aproximadamente 15 dias úteis após a aprovação e liberação do local.";
const DEFAULT_EXCLUSOES = "Fornecimento de materiais de acabamento (pisos, louças, metais), caçamba de entulho, regularização em órgãos públicos e taxas extras de condomínio.";
const DEFAULT_RESPONSABILIDADES = "O cliente deve garantir o livre acesso da equipe ao local em horário comercial, fornecer água e energia elétrica, e remover objetos pessoais frágeis da área de obra.";

interface Props {
  open: boolean;
  onClose: () => void;
  orcamento?: Orcamento;
  initialClienteId?: string;
}

const statusOptions: { value: StatusOrcamento; label: string }[] = [
  { value: "rascunho", label: "Rascunho" },
  { value: "enviado", label: "Enviado" },
  { value: "aprovado", label: "Aprovado" },
  { value: "recusado", label: "Recusado" },
  { value: "vencido", label: "Vencido" },
  { value: "convertido", label: "Convertido" },
];

export function OrcamentoModal({ open, onClose, orcamento, initialClienteId }: Props) {
  const { addOrcamento, updateOrcamento, condominios, clientes, catalogoServicos, funcionarios, refreshAll } = useApp();
  const isEdit = !!orcamento;
  const [activeTab, setActiveTab] = useState("dados");

  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    status: "rascunho" as StatusOrcamento,
    data_emissao: new Date(),
    validade: null as Date | null,
    valor: 0,
    observacoes: "",
    condominioId: null as string | null,
    clienteId: null as string | null,
    sindicoId: null as string | null,
    endereco_obra: "",
    motivo_recusa: "",
    data_aprovacao: null as Date | null,
    condicoes_pagamento: "",
    prazo_execucao: "",
    data_prevista_inicio: null as Date | null,
    exclusoes: "",
    responsabilidades: "",
  });

  const [items, setItems] = useState<Partial<OrcamentoItem>[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newClientModalOpen, setNewClientModalOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setActiveTab("dados");
      if (orcamento) {
        setForm({
          titulo: orcamento.titulo,
          descricao: orcamento.descricao,
          status: orcamento.status,
          data_emissao: orcamento.data_emissao ? new Date(orcamento.data_emissao + "T12:00:00") : new Date(),
          validade: orcamento.validade ? new Date(orcamento.validade + "T12:00:00") : null,
          valor: orcamento.valor,
          observacoes: orcamento.observacoes,
          condominioId: orcamento.condominioId,
          clienteId: orcamento.clienteId,
          sindicoId: orcamento.sindicoId,
          endereco_obra: orcamento.endereco_obra,
          motivo_recusa: orcamento.motivo_recusa,
          data_aprovacao: orcamento.data_aprovacao ? new Date(orcamento.data_aprovacao + "T12:00:00") : null,
          condicoes_pagamento: orcamento.condicoes_pagamento || "",
          prazo_execucao: orcamento.prazo_execucao || "",
          data_prevista_inicio: orcamento.data_prevista_inicio ? new Date(orcamento.data_prevista_inicio + "T12:00:00") : null,
          exclusoes: orcamento.exclusoes || "",
          responsabilidades: orcamento.responsabilidades || "",
        });
        fetchItems(orcamento.id);
      } else {
        setForm({
          titulo: "", descricao: "", status: "rascunho",
          data_emissao: new Date(), 
          validade: addDays(new Date(), 10), 
          valor: 0,
          observacoes: "", condominioId: null, clienteId: initialClienteId || null,
          sindicoId: null, endereco_obra: "", motivo_recusa: "",
          data_aprovacao: null, 
          condicoes_pagamento: DEFAULT_CONDICOES, 
          prazo_execucao: DEFAULT_PRAZO,
          data_prevista_inicio: addDays(new Date(), 7), 
          exclusoes: DEFAULT_EXCLUSOES, 
          responsabilidades: DEFAULT_RESPONSABILIDADES,
        });
        setItems([]);
      }
    }
  }, [orcamento, open, initialClienteId]);

  const fetchItems = async (orcID: string) => {
    setLoadingItems(true);
    const { data, error } = await supabase.from("orcamento_itens").select("*").eq("orcamento_id", orcID).order("criado_em", { ascending: true });
    if (!error && data) {
      setItems(data);
    }
    setLoadingItems(false);
  };

  const addItemFromCatalogo = (servicoId: string) => {
    const srv = catalogoServicos.find(s => s.id === servicoId);
    if (!srv) return;
    
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        servico_id: srv.id,
        nome: srv.nome,
        unidade: srv.unidade_padrao,
        quantidade: 1,
        valor_unitario: srv.valor_base_sugerido,
        custo_unitario: srv.custo_padrao,
        funcionario_id: srv.prestador_padrao_id,
      }
    ]);
  };

  const addAvulsoItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        servico_id: null,
        nome: "",
        unidade: "un",
        quantidade: 1,
        valor_unitario: 0,
        custo_unitario: 0,
        funcionario_id: null,
      }
    ]);
  };

  const updateItem = (index: number, field: keyof OrcamentoItem, value: string | number | null) => {
    setItems(prev => {
      const nw = [...prev];
      nw[index] = { ...nw[index], [field]: value };
      return nw;
    });
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const totalVenda = items.reduce((acc, it) => acc + ((it.valor_unitario || 0) * (it.quantidade || 1)), 0);
    const totalCusto = items.reduce((acc, it) => acc + ((it.custo_unitario || 0) * (it.quantidade || 1)), 0);
    const lucro = totalVenda - totalCusto;
    const margemPercentual = totalVenda > 0 ? (lucro / totalVenda) * 100 : 0;
    return { totalVenda, totalCusto, lucro, margemPercentual };
  };

  const { totalVenda, totalCusto, lucro, margemPercentual } = calculateTotals();

  const applyAutomaticMargin = (percent: number) => {
    setItems(prev => prev.map(it => ({
      ...it,
      valor_unitario: (it.custo_unitario || 0) * (1 + (percent / 100))
    })));
    toast.success(`Margem de ${percent}% aplicada com sucesso!`);
  };

  // Auto-sync form value with items
  useEffect(() => {
    if (items.length > 0) {
      setForm(prev => ({ ...prev, valor: totalVenda }));
    }
  }, [totalVenda, items.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const payload = {
      titulo: form.titulo,
      descricao: form.descricao,
      status: form.status,
      data_emissao: format(form.data_emissao, "yyyy-MM-dd"),
      validade: form.validade ? format(form.validade, "yyyy-MM-dd") : null,
      valor: form.valor,
      observacoes: form.observacoes,
      condominioId: form.condominioId,
      clienteId: form.clienteId,
      sindicoId: form.sindicoId,
      endereco_obra: form.endereco_obra,
      motivo_recusa: form.motivo_recusa,
      data_aprovacao: form.data_aprovacao ? format(form.data_aprovacao, "yyyy-MM-dd") : null,
      trabalhoId: orcamento?.trabalhoId ?? null,
      condicoes_pagamento: form.condicoes_pagamento,
      prazo_execucao: form.prazo_execucao,
      data_prevista_inicio: form.data_prevista_inicio ? format(form.data_prevista_inicio, "yyyy-MM-dd") : null,
      exclusoes: form.exclusoes,
      responsabilidades: form.responsabilidades,
    };

    let savedOrcID = orcamento?.id;

    try {
      if (isEdit && savedOrcID) {
        await updateOrcamento(savedOrcID, payload);
      } else {
        const novoID = await addOrcamento(payload);
        if (novoID) savedOrcID = novoID;
      }

      // Sync items
      if (savedOrcID) {
        // Delete all old items
        const { error: delError } = await supabase.from("orcamento_itens").delete().eq("orcamento_id", savedOrcID);
        if (delError) {
          throw new Error("Falha ao limpar itens antigos: " + delError.message);
        }
        
        // Insert new ones
        if (items.length > 0) {
          const insertPayload = items.map(it => ({
            orcamento_id: savedOrcID as string,
            servico_id: it.servico_id,
            nome: it.nome,
            unidade: it.unidade,
            quantidade: it.quantidade,
            valor_unitario: it.valor_unitario,
            custo_unitario: it.custo_unitario,
            funcionario_id: it.funcionario_id,
          }));
          const { error: insError } = await supabase.from("orcamento_itens").insert(insertPayload);
          if (insError) {
             throw new Error("Falha ao salvar itens: " + insError.message);
          }
        }
      }
      onClose();
      refreshAll();
    } catch (e) {
      toast.error("Erro ao salvar o orçamento");
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrencyLabel = (val: number) => 
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()} className="max-w-[900px] max-h-[90vh] overflow-y-auto w-full p-0 gap-0 bg-background rounded-2xl shadow-2xl">
        <div className="flex flex-col h-full max-h-[90vh]">
          
          <DialogHeader className="px-6 py-4 border-b border-border bg-muted/20 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold font-oswald uppercase tracking-tight">
                  {isEdit ? "Editar Orçamento (Padrão Ouro)" : "Novo Orçamento (Padrão Ouro)"}
                </DialogTitle>
                <p className="text-xs text-muted-foreground font-barlow tracking-widest uppercase">Gerador Inteligente e Cálculo de Margem</p>
              </div>
            </div>
          </DialogHeader>

          <div className="px-6 py-3 border-b border-border bg-card shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold font-oswald uppercase tracking-[0.2em] text-muted-foreground">
                Passo {activeTab === "dados" ? "1" : activeTab === "servicos" ? "2" : activeTab === "prazos" ? "3" : "4"} de 4
              </span>
              <span className="text-[10px] font-bold font-oswald uppercase tracking-[0.2em] text-primary">
                {Math.round((activeTab === "dados" ? 1 : activeTab === "servicos" ? 2 : activeTab === "prazos" ? 3 : 4) / 4 * 100)}% concluído
              </span>
            </div>
            <Progress value={(activeTab === "dados" ? 1 : activeTab === "servicos" ? 2 : activeTab === "prazos" ? 3 : 4) / 4 * 100} className="h-1.5 bg-muted" />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">

            <div className="flex-1 overflow-y-auto p-6 bg-card">
              
              <TabsContent value="dados" className="m-0 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="pb-4 border-b border-border/50">
                  <h2 className="text-xl font-bold font-oswald uppercase text-primary flex items-center gap-2">
                    <User className="h-5 w-5" /> 1. O Início: Identidade e Local
                  </h2>
                  <p className="text-sm text-muted-foreground font-barlow italic">Quem é o cliente e onde a mágica vai acontecer?</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground flex items-center gap-1.5">
                        Título Comercial *
                        <TooltipProvider><Tooltip><TooltipTrigger asChild><HelpCircle className="h-3 w-3 cursor-help text-muted-foreground/50" /></TooltipTrigger><TooltipContent className="text-xs">Ex: Reforma de Sacada - Apto 202</TooltipContent></Tooltip></TooltipProvider>
                      </Label>
                      <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Ex: Reforma Cobertura Palmas" required className="font-oswald text-lg" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground">Endereço da Obra</Label>
                      <Input value={form.endereco_obra} onChange={(e) => setForm({ ...form, endereco_obra: e.target.value })} placeholder="Endereço exato da obra..." className="font-barlow"/>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground">Status Atual</Label>
                      <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as StatusOrcamento })}>
                        <SelectTrigger className="font-oswald uppercase"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((s) => (
                            <SelectItem key={s.value} value={s.value} className="font-oswald uppercase">{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-xl border border-border space-y-4">
                    <h3 className="font-oswald uppercase text-xs font-bold text-muted-foreground tracking-widest border-b border-border/50 pb-2">Vínculos de Cliente</h3>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-barlow">Condomínio</Label>
                      <Select value={form.condominioId ?? "_none"} onValueChange={(v) => setForm({ ...form, condominioId: v === "_none" ? null : v })}>
                        <SelectTrigger className="h-9"><SelectValue placeholder="Selecionar Condomínio" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none">Nenhum</SelectItem>
                          {condominios.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-barlow">Cliente Contratante</Label>
                        <Button type="button" variant="ghost" size="icon" className="h-5 w-5 bg-primary/10 hover:bg-primary/20" onClick={() => setNewClientModalOpen(true)} title="Novo Cliente">
                          <UserPlus className="h-3 w-3 text-primary" />
                        </Button>
                      </div>
                      <Select value={form.clienteId ?? "_none"} onValueChange={(v) => setForm({ ...form, clienteId: v === "_none" ? null : v })}>
                        <SelectTrigger className="h-9"><SelectValue placeholder="Selecionar Cliente" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none">Nenhum</SelectItem>
                          {clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-barlow">Síndico Responsável</Label>
                      <Select value={form.sindicoId ?? "_none"} onValueChange={(v) => setForm({ ...form, sindicoId: v === "_none" ? null : v })}>
                        <SelectTrigger className="h-9"><SelectValue placeholder="Selecionar Síndico" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none">Nenhum</SelectItem>
                          {clientes.filter((c) => c.tipo === "sindico").map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground">Apresentação / Descrição Inicial do Projeto</Label>
                  <Textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Texto introdutório que o cliente vai ler antes da tabela de serviços..." rows={4} className="font-barlow"/>
                </div>
              </TabsContent>

              <TabsContent value="servicos" className="m-0 flex flex-col space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="pb-4 border-b border-border/50">
                  <h2 className="text-xl font-bold font-oswald uppercase text-primary flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" /> 2. O Projeto: O que faremos?
                  </h2>
                  <p className="text-sm text-muted-foreground font-barlow italic">Liste os serviços. Os custos internos são para sua gestão; o cliente só vê o valor final.</p>
                </div>
                <div className="bg-muted/20 border border-border p-4 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-oswald uppercase text-sm font-bold tracking-wide">Tabela de Serviços</h3>
                    <p className="text-[10px] font-barlow text-muted-foreground">Adicione do catálogo ou insira avulsos. Os custos internos são ocultos para o cliente.</p>
                  </div>
                  <div className="flex gap-2">
                    <Select onValueChange={addItemFromCatalogo}>
                      <SelectTrigger className="w-[200px] h-9 font-oswald uppercase text-xs font-bold bg-primary text-primary-foreground">
                        <Tag className="mr-2 h-3.5 w-3.5" /> Do Catálogo
                      </SelectTrigger>
                      <SelectContent>
                        {catalogoServicos.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={addAvulsoItem} className="h-9 font-oswald uppercase font-bold text-xs">
                      <Plus className="mr-1 h-3.5 w-3.5" /> Avulso
                    </Button>
                  </div>
                </div>

                <div className="border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-xs font-barlow text-left">
                    <thead className="bg-muted/40 font-oswald uppercase tracking-widest text-[9px] text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 w-1/3">Item / Serviço</th>
                        <th className="px-2 py-2 w-[60px] text-center">Un</th>
                        <th className="px-2 py-2 w-[80px] text-center">Qtd</th>
                        <th className="px-3 py-2 w-[120px] text-right">Custo Un (Interno)</th>
                        <th className="px-3 py-2 w-[120px] text-right">Venda Un (Cliente)</th>
                        <th className="px-3 py-2 w-[120px] text-right">Total Venda</th>
                        <th className="px-2 py-2 w-[40px] text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {items.map((it, idx) => (
                        <tr key={it.id || idx} className="hover:bg-muted/10">
                          <td className="px-3 py-2">
                            <Input value={it.nome || ""} onChange={(e) => updateItem(idx, "nome", e.target.value)} className="h-8 text-xs font-bold uppercase disabled:opacity-75" disabled={!!it.servico_id} placeholder="Descrição..." />
                          </td>
                          <td className="px-2 py-2 text-center">
                            <Input value={it.unidade || ""} onChange={(e) => updateItem(idx, "unidade", e.target.value)} className="h-8 text-[10px] text-center uppercase" />
                          </td>
                          <td className="px-2 py-2 text-center">
                            <Input type="number" min={0} step="0.01" value={it.quantidade || 0} onChange={(e) => updateItem(idx, "quantidade", Number(e.target.value))} className="h-8 text-center" />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <CurrencyInput value={it.custo_unitario || 0} onChange={(v) => updateItem(idx, "custo_unitario", v)} className="h-8 text-right text-destructive bg-destructive/5" />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <CurrencyInput value={it.valor_unitario || 0} onChange={(v) => updateItem(idx, "valor_unitario", v)} className="h-8 text-right font-bold text-emerald-600 bg-emerald-500/5" />
                          </td>
                          <td className="px-3 py-2 text-right font-oswald font-bold text-sm bg-muted/10">
                            {formatCurrencyLabel((it.valor_unitario || 0) * (it.quantidade || 0))}
                          </td>
                          <td className="px-2 py-2 text-center">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => removeItem(idx)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {items.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground italic">Nenhum serviço adicionado. Comece adicionando itens do catálogo.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 py-6 bg-muted/10 rounded-2xl border border-border/50">
                  <div className="space-y-1">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Custo Oculto</p>
                    <p className="font-oswald text-xl font-bold text-destructive/80 italic">{formatCurrencyLabel(totalCusto)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-emerald-700 font-bold">Venda Sugerida</p>
                    <p className="font-oswald text-xl font-bold text-emerald-600">{formatCurrencyLabel(totalVenda)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-primary font-bold">Lucro Final</p>
                    <p className="font-oswald text-xl font-bold text-primary">{formatCurrencyLabel(lucro)}</p>
                  </div>
                  <div className="flex flex-col justify-center items-center bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-border/50 p-2">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-1">Saúde do Preço</p>
                    <div className="flex items-center gap-2">
                       <span className={cn("h-2 w-2 rounded-full", margemPercentual > 35 ? "bg-emerald-500 animate-pulse" : margemPercentual > 20 ? "bg-orange-500" : "bg-destructive")} />
                       <p className={cn("font-oswald text-xl font-bold", margemPercentual > 35 ? "text-emerald-500" : margemPercentual > 20 ? "text-orange-500" : "text-destructive")}>
                         {margemPercentual.toFixed(0)}%
                       </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => applyAutomaticMargin(30)} className="h-7 text-[9px] font-bold uppercase tracking-widest hover:border-emerald-500 hover:text-emerald-500 transition-colors">🔥 Margem 30%</Button>
                  <Button variant="outline" size="sm" onClick={() => applyAutomaticMargin(50)} className="h-7 text-[9px] font-bold uppercase tracking-widest hover:border-emerald-500 hover:text-emerald-500 transition-colors">🚀 Margem 50%</Button>
                  <Button variant="outline" size="sm" onClick={() => applyAutomaticMargin(100)} className="h-7 text-[9px] font-bold uppercase tracking-widest hover:border-emerald-500 hover:text-emerald-500 transition-colors">💎 Margem 100%</Button>
                </div>

              </TabsContent>

              <TabsContent value="prazos" className="m-0 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="pb-4 border-b border-border/50">
                  <h2 className="text-xl font-bold font-oswald uppercase text-primary flex items-center gap-2">
                    <ArrowRight className="h-5 w-5" /> 3. O Acordo: Como e Quando?
                  </h2>
                  <p className="text-sm text-muted-foreground font-barlow italic">Defina as datas e a forma de pagamento. Clareza aqui evita problemas no futuro.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5 flex flex-col justify-end">
                    <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground">Emissão da Proposta</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" className="w-full justify-start text-left font-normal h-10 border-input font-barlow">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(form.data_emissao, "dd/MM/yyyy", { locale: ptBR })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={form.data_emissao} onSelect={(d) => d && setForm({ ...form, data_emissao: d })} initialFocus className="p-3 pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-1.5 flex flex-col justify-end">
                    <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground">Proposta Válida Até</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" className={cn("w-full justify-start text-left font-normal h-10", !form.validade && "text-muted-foreground", "font-barlow")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.validade ? format(form.validade, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar..."}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={form.validade ?? undefined} onSelect={(d) => setForm({ ...form, validade: d ?? null })} initialFocus className="p-3 pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-1.5 flex flex-col justify-end">
                    <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground">Previsão Inicial Obra</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" className={cn("w-full justify-start text-left font-normal h-10", !form.data_prevista_inicio && "text-muted-foreground", "font-barlow")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.data_prevista_inicio ? format(form.data_prevista_inicio, "dd/MM/yyyy", { locale: ptBR }) : "Opcional..."}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={form.data_prevista_inicio ?? undefined} onSelect={(d) => setForm({ ...form, data_prevista_inicio: d ?? null })} initialFocus className="p-3 pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="space-y-1.5">
                    <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground">Condições de Pagamento</Label>
                    <Input value={form.condicoes_pagamento} onChange={(e) => setForm({ ...form, condicoes_pagamento: e.target.value })} placeholder="Ex: 50% de entrada na assinatura do contrato e 50% na conclusão." className="font-barlow" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground">Prazo de Execução (Cláusula)</Label>
                    <Input value={form.prazo_execucao} onChange={(e) => setForm({ ...form, prazo_execucao: e.target.value })} placeholder="Ex: Aprox. 20 dias úteis, condicionados as condições do tempo e materialização." className="font-barlow" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="clausulas" className="m-0 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="pb-4 border-b border-border/50">
                  <h2 className="text-xl font-bold font-oswald uppercase text-primary flex items-center gap-2">
                    <Tag className="h-5 w-5" /> 4. A Segurança: Blindagem PratesPaiva
                  </h2>
                  <p className="text-sm text-muted-foreground font-barlow italic">O que NÃO está incluso e quais as responsabilidades do cliente.</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground flex items-center gap-1.5">
                    O que NÃO está incluso (Exclusões)
                    <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="h-3 w-3 cursor-help text-muted-foreground/50" /></TooltipTrigger><TooltipContent className="text-xs">Crucial para evitar que o cliente cobre coisas que não foram combinadas.</TooltipContent></Tooltip></TooltipProvider>
                  </Label>
                  <Textarea value={form.exclusoes} onChange={(e) => setForm({ ...form, exclusoes: e.target.value })} placeholder="Liste o que o orçamento NÃO cobre (ex: fornecimento de porcelanato, caçamba de entulho...)." rows={3} className="font-barlow" />
                  <p className="text-[10px] text-muted-foreground pt-1">É importantíssimo proteger a PratesPaiva contra expectativas irreais do cliente.</p>
                </div>
                
                <div className="space-y-1.5 pt-2">
                  <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground">Responsabilidade do Contratante</Label>
                  <Textarea value={form.responsabilidades} onChange={(e) => setForm({ ...form, responsabilidades: e.target.value })} placeholder="O que o cliente precisa fazer (ex: retirar itens pessoais do local, fornecer material básico, etc)." rows={3} className="font-barlow" />
                </div>

                <div className="space-y-1.5 pt-2">
                  <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground">Notas Internas Diárias (Apenas para nós)</Label>
                  <Textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} placeholder="Comentários internos confidenciais... (não aparece no PDF do cliente)" rows={3} className="font-barlow bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900/40" />
                </div>
              </TabsContent>
            </div>

            <div className="p-6 border-t border-border bg-muted/20 shrink-0 flex items-center justify-between">
              <div className="flex gap-3">
                {activeTab !== "dados" ? (
                   <Button type="button" variant="outline" className="font-oswald font-bold uppercase tracking-widest h-11 px-6 shadow-sm flex items-center gap-2" onClick={() => {
                     if (activeTab === "servicos") setActiveTab("dados");
                     if (activeTab === "prazos") setActiveTab("servicos");
                     if (activeTab === "clausulas") setActiveTab("prazos");
                   }}>
                     <ChevronLeft className="h-4 w-4" /> Anterior
                   </Button>
                ) : (
                  <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>Cancelar</Button>
                )}
              </div>

              <div className="flex gap-3">
                {activeTab !== "clausulas" ? (
                   <Button type="button" variant="default" className="font-oswald font-bold uppercase tracking-widest h-11 px-6 shadow-md flex items-center gap-2 bg-primary text-primary-foreground hover:opacity-90" onClick={() => {
                     if (activeTab === "dados") setActiveTab("servicos");
                     if (activeTab === "servicos") setActiveTab("prazos");
                     if (activeTab === "prazos") setActiveTab("clausulas");
                   }}>
                     Próxima Etapa <ChevronRight className="h-4 w-4" />
                   </Button>
                ) : (
                  <Button type="submit" onClick={handleSubmit} disabled={isSaving} className="font-oswald font-bold uppercase tracking-widest h-11 px-6 bg-emerald-600 text-white hover:bg-emerald-700 shadow-md flex items-center gap-2 scale-105 active:scale-100 transition-all">
                    <Save className="h-4 w-4" /> {isEdit ? "Salvar Proposta" : "Gerar Proposta Ouro"}
                  </Button>
                )}
              </div>
            </div>
          </Tabs>

        </div>
      </DialogContent>
      {/* Modal para Adicionar Cliente Rápidamente */}
      <ContatoModal open={newClientModalOpen} onClose={() => setNewClientModalOpen(false)} />
    </Dialog>
  );
}
