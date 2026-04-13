import { useState } from "react";
import { MessageCircle, Sparkles, ChevronRight, Loader2, RotateCcw, AlertCircle, User, MapPin, Package, StickyNote, Trash2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { OrcamentoDraft } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencyInput } from "@/components/ui/currency-input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const UNIDADES = ["m²", "m", "m³", "un", "h", "vb", "kg", "pç", "sc", "cx", "l", "pt"];

interface ServicoExtraido {
  nome: string;
  quantidade: number;
  unidade: string;
  valor_unitario: number;
  observacao: string;
}

interface ParsedResult {
  titulo: string;
  cliente_nome: string;
  endereco: string;
  descricao: string;
  servicos: ServicoExtraido[];
  observacoes: string;
  data_prevista: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onDraftReady: (draft: OrcamentoDraft) => void;
}

export function WhatsAppParserModal({ open, onClose, onDraftReady }: Props) {
  const { catalogoServicos, clientes } = useApp();

  const [step, setStep] = useState<"input" | "loading" | "review">("input");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [result, setResult] = useState<ParsedResult | null>(null);

  const resetModal = () => {
    setStep("input");
    setMensagem("");
    setErro("");
    setResult(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const interpretar = async () => {
    if (!mensagem.trim()) {
      setErro("Cole uma mensagem antes de interpretar.");
      return;
    }
    setErro("");
    setStep("loading");

    try {
      const catalogoPayload = catalogoServicos.map(s => ({
        nome: s.nome,
        unidade: s.unidade_padrao,
        valor: s.valor_base_sugerido,
      }));

      const { data, error } = await supabase.functions.invoke("parse-whatsapp", {
        body: { mensagem, catalogo: catalogoPayload },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      // Garante estrutura mínima
      const parsed: ParsedResult = {
        titulo: data.titulo ?? "",
        cliente_nome: data.cliente_nome ?? "",
        endereco: data.endereco ?? "",
        descricao: data.descricao ?? "",
        servicos: Array.isArray(data.servicos) ? data.servicos.map((s: Partial<ServicoExtraido>) => ({
          nome: s.nome ?? "",
          quantidade: Number(s.quantidade) || 1,
          unidade: s.unidade ?? "un",
          valor_unitario: Number(s.valor_unitario) || 0,
          observacao: s.observacao ?? "",
        })) : [],
        observacoes: data.observacoes ?? "",
        data_prevista: data.data_prevista ?? "",
      };

      if (parsed.servicos.length === 0 && !parsed.titulo) {
        throw new Error("Não foi possível extrair informações da mensagem. Tente reformular ou seja mais específico.");
      }

      setResult(parsed);
      setStep("review");
    } catch (e) {
      setErro(String(e).replace("Error: ", ""));
      setStep("input");
    }
  };

  const updateServico = (idx: number, field: keyof ServicoExtraido, value: string | number) => {
    if (!result) return;
    const novos = [...result.servicos];
    novos[idx] = { ...novos[idx], [field]: value };
    setResult({ ...result, servicos: novos });
  };

  const removeServico = (idx: number) => {
    if (!result) return;
    setResult({ ...result, servicos: result.servicos.filter((_, i) => i !== idx) });
  };

  const addServico = () => {
    if (!result) return;
    setResult({ ...result, servicos: [...result.servicos, { nome: "", quantidade: 1, unidade: "un", valor_unitario: 0, observacao: "" }] });
  };

  const criarOrcamento = () => {
    if (!result) return;

    // Tenta associar cliente pelo nome
    const clienteEncontrado = result.cliente_nome
      ? clientes.find(c => c.nome.toLowerCase().includes(result.cliente_nome.toLowerCase()) || result.cliente_nome.toLowerCase().includes(c.nome.toLowerCase()))
      : undefined;

    // Mapeia serviços para itens do orçamento, tentando vincular ao catálogo
    const items = result.servicos.map(s => {
      const catalogoMatch = catalogoServicos.find(cs =>
        cs.nome.toLowerCase() === s.nome.toLowerCase() ||
        cs.nome.toLowerCase().includes(s.nome.toLowerCase()) ||
        s.nome.toLowerCase().includes(cs.nome.toLowerCase())
      );
      return {
        id: crypto.randomUUID(),
        servico_id: catalogoMatch?.id ?? null,
        nome: s.nome || (catalogoMatch?.nome ?? ""),
        unidade: s.unidade || catalogoMatch?.unidade_padrao || "un",
        quantidade: s.quantidade,
        valor_unitario: s.valor_unitario || catalogoMatch?.valor_base_sugerido || 0,
        custo_unitario: catalogoMatch?.custo_padrao ?? 0,
        funcionario_id: catalogoMatch?.prestador_padrao_id ?? null,
        observacao: s.observacao,
      };
    });

    const descricaoFinal = [result.descricao, result.observacoes].filter(Boolean).join("\n\n");

    const draft: OrcamentoDraft = {
      titulo: result.titulo,
      descricao: descricaoFinal,
      endereco_obra: result.endereco,
      clienteId: clienteEncontrado?.id ?? null,
      clienteNomeDetectado: result.cliente_nome,
      items,
    };

    if (clienteEncontrado) {
      toast.success(`Cliente "${clienteEncontrado.nome}" identificado automaticamente.`);
    } else if (result.cliente_nome) {
      toast.warning(`"${result.cliente_nome}" não encontrado na base. Selecione manualmente no orçamento.`);
    }

    onDraftReady(draft);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="max-w-2xl w-full p-0 gap-0 bg-background shadow-2xl overflow-hidden h-dvh sm:h-auto sm:max-h-[90vh] rounded-none sm:rounded-2xl"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="px-5 py-4 border-b border-border bg-gradient-to-r from-emerald-950/40 to-background shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <MessageCircle className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold font-oswald uppercase tracking-tight">
                  Zap → Orçamento
                </DialogTitle>
                <p className="text-xs text-muted-foreground font-barlow">Cole a mensagem do cliente e a IA extrai os dados do orçamento</p>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">

            {/* ── STEP: Input ── */}
            {step === "input" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground">
                    Mensagem do WhatsApp
                  </Label>
                  <Textarea
                    value={mensagem}
                    onChange={(e) => { setMensagem(e.target.value); setErro(""); }}
                    placeholder={`Cole aqui a mensagem do cliente.\n\nExemplo:\n"Bom dia, sou síndico do Ed. Palmas. Preciso pintar 3 apartamentos no 5º andar, cada um com uns 80m². Também tem um vazamento no telhado do bloco A que precisa ser reparado com urgência. Posso receber vocês na próxima semana?"`}
                    rows={10}
                    className="font-barlow text-sm leading-relaxed resize-none"
                    autoFocus
                  />
                </div>

                {erro && (
                  <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2.5">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span className="font-barlow">{erro}</span>
                  </div>
                )}

                <div className="bg-muted/40 rounded-xl p-4 border border-border/60 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Como funciona</p>
                  <ul className="space-y-1.5 text-xs font-barlow text-muted-foreground">
                    <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold mt-0.5">1.</span> Cole a mensagem do cliente (WhatsApp, e-mail, SMS...)</li>
                    <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold mt-0.5">2.</span> A IA identifica serviços, endereço, cliente e quantidades</li>
                    <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold mt-0.5">3.</span> Você revisa e ajusta o que for necessário</li>
                    <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold mt-0.5">4.</span> O orçamento é aberto já preenchido para finalizar</li>
                  </ul>
                </div>
              </div>
            )}

            {/* ── STEP: Loading ── */}
            {step === "loading" && (
              <div className="flex flex-col items-center justify-center py-20 gap-5">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <MessageCircle className="h-8 w-8 text-emerald-500" />
                  </div>
                  <Loader2 className="h-20 w-20 text-emerald-500/40 animate-spin absolute -top-2 -left-2" />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-oswald font-bold uppercase text-base">Interpretando mensagem...</p>
                  <p className="text-sm text-muted-foreground font-barlow">A IA está identificando os serviços e dados do orçamento</p>
                </div>
              </div>
            )}

            {/* ── STEP: Review ── */}
            {step === "review" && result && (
              <div className="space-y-5">
                {/* Cabeçalho de sucesso */}
                <div className="flex items-center gap-2 px-4 py-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                  <Sparkles className="h-4 w-4 text-emerald-500 shrink-0" />
                  <p className="text-xs font-barlow text-emerald-700 dark:text-emerald-400 font-bold">
                    IA identificou {result.servicos.length} serviço(s). Revise e ajuste antes de criar o orçamento.
                  </p>
                </div>

                {/* Título */}
                <div className="space-y-1.5">
                  <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground">Título do Orçamento</Label>
                  <Input
                    value={result.titulo}
                    onChange={(e) => setResult({ ...result, titulo: e.target.value })}
                    className="font-oswald font-bold uppercase text-base h-12"
                    placeholder="Título comercial da proposta..."
                  />
                </div>

                {/* Cliente + Endereço */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <User className="h-3 w-3" /> Cliente Detectado
                    </Label>
                    <Input
                      value={result.cliente_nome}
                      onChange={(e) => setResult({ ...result, cliente_nome: e.target.value })}
                      placeholder="Nome do cliente..."
                      className="font-barlow h-12"
                    />
                    <p className="text-[10px] text-muted-foreground font-barlow italic">
                      Será buscado na sua base de clientes
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" /> Endereço da Obra
                    </Label>
                    <Input
                      value={result.endereco}
                      onChange={(e) => setResult({ ...result, endereco: e.target.value })}
                      placeholder="Local da prestação de serviço..."
                      className="font-barlow h-12"
                    />
                  </div>
                </div>

                {/* Descrição */}
                {result.descricao && (
                  <div className="space-y-1.5">
                    <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground">Descrição do Projeto</Label>
                    <Textarea
                      value={result.descricao}
                      onChange={(e) => setResult({ ...result, descricao: e.target.value })}
                      rows={3}
                      className="font-barlow text-sm"
                    />
                  </div>
                )}

                {/* Serviços extraídos */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <Package className="h-3 w-3" /> Serviços Identificados
                    </Label>
                    <Button type="button" variant="outline" size="sm" className="h-7 text-xs font-oswald uppercase" onClick={addServico}>
                      + Adicionar
                    </Button>
                  </div>

                  {result.servicos.length === 0 && (
                    <p className="text-sm text-muted-foreground italic font-barlow text-center py-4">
                      Nenhum serviço identificado. Adicione manualmente.
                    </p>
                  )}

                  <div className="space-y-3">
                    {result.servicos.map((s, idx) => {
                      const catalogoMatch = catalogoServicos.find(cs =>
                        cs.nome.toLowerCase() === s.nome.toLowerCase() ||
                        s.nome.toLowerCase().includes(cs.nome.toLowerCase())
                      );
                      return (
                        <div key={idx} className="border border-border rounded-xl bg-card overflow-hidden">
                          {/* Nome do serviço */}
                          <div className="flex items-center gap-2 px-4 pt-3 pb-2">
                            <span className="text-[10px] font-bold text-muted-foreground font-oswald w-5 shrink-0">#{idx + 1}</span>
                            <Input
                              value={s.nome}
                              onChange={(e) => updateServico(idx, "nome", e.target.value)}
                              placeholder="Nome do serviço..."
                              className="flex-1 font-oswald font-bold uppercase text-sm h-10 border-0 border-b border-border/50 rounded-none px-0 focus-visible:ring-0 bg-transparent"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => removeServico(idx)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="px-4 pb-3 space-y-2">
                            {/* Qtd + Unidade + Valor */}
                            <div className="flex items-end gap-2">
                              <div className="space-y-1">
                                <p className="text-[9px] font-bold uppercase text-muted-foreground font-barlow">Qtd</p>
                                <Input
                                  type="number"
                                  min={0}
                                  step="0.5"
                                  value={s.quantidade}
                                  onChange={(e) => updateServico(idx, "quantidade", Number(e.target.value))}
                                  className="h-10 w-20 text-center font-barlow"
                                />
                              </div>
                              <div className="space-y-1">
                                <p className="text-[9px] font-bold uppercase text-muted-foreground font-barlow">UN</p>
                                <Select value={s.unidade} onValueChange={(v) => updateServico(idx, "unidade", v)}>
                                  <SelectTrigger className="h-10 w-24 text-xs font-barlow"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {UNIDADES.map(u => <SelectItem key={u} value={u} className="text-xs">{u}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex-1 space-y-1">
                                <p className="text-[9px] font-bold uppercase text-emerald-700 font-barlow">Valor Unit.</p>
                                <CurrencyInput
                                  value={s.valor_unitario}
                                  onChange={(v) => updateServico(idx, "valor_unitario", v)}
                                  className={cn("h-10 text-right font-bold", s.valor_unitario === 0 ? "text-orange-500 border-orange-300" : "text-emerald-700 border-emerald-300")}
                                />
                              </div>
                            </div>

                            {/* Vínculo com catálogo */}
                            <div className="flex items-center justify-between">
                              {catalogoMatch ? (
                                <span className="text-[10px] font-barlow text-emerald-600 font-bold flex items-center gap-1">
                                  <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full inline-block" />
                                  Vinculado ao catálogo: {catalogoMatch.nome}
                                </span>
                              ) : (
                                <span className="text-[10px] font-barlow text-muted-foreground italic">Item avulso (sem vínculo com catálogo)</span>
                              )}
                              {s.valor_unitario === 0 && (
                                <span className="text-[10px] text-orange-500 font-barlow font-bold">⚠ Sem valor</span>
                              )}
                            </div>

                            {/* Observação */}
                            {s.observacao && (
                              <p className="text-[10px] text-muted-foreground font-barlow italic bg-muted/40 px-2 py-1 rounded">
                                {s.observacao}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Observações gerais */}
                {result.observacoes && (
                  <div className="space-y-1.5">
                    <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <StickyNote className="h-3 w-3" /> Observações do Cliente
                    </Label>
                    <div className="text-xs font-barlow text-muted-foreground bg-muted/40 px-3 py-2.5 rounded-lg border border-border/60 leading-relaxed italic">
                      {result.observacoes}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-border bg-background shrink-0 flex gap-3">
            {step === "input" && (
              <>
                <Button type="button" variant="ghost" className="h-12 font-barlow" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button
                  type="button"
                  className="flex-1 h-12 font-oswald font-bold uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                  onClick={interpretar}
                  disabled={!mensagem.trim()}
                >
                  <Sparkles className="h-4 w-4" />
                  Interpretar com IA
                </Button>
              </>
            )}

            {step === "loading" && (
              <Button type="button" variant="outline" className="flex-1 h-12 font-oswald uppercase" disabled>
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Aguarde...
              </Button>
            )}

            {step === "review" && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 font-oswald uppercase gap-2"
                  onClick={() => setStep("input")}
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="hidden sm:inline">Tentar Novamente</span>
                </Button>
                <Button
                  type="button"
                  className="flex-1 h-12 font-oswald font-bold uppercase tracking-widest bg-primary text-primary-foreground gap-2"
                  onClick={criarOrcamento}
                >
                  Criar Orçamento
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
