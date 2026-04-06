import { formatCurrency, formatDate } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Pencil, Trash2, Building2, User, Calendar, 
  DollarSign, MapPin, FileText, ArrowRight, Download 
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { OrcamentoStatusBadge } from "@/components/shared/Badges";
import { OrcamentoModal } from "@/components/modals/OrcamentoModal";
import { generateOrcamentoPdf } from "@/services/PdfService";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { OrcamentoItem } from "@/types";

export default function OrcamentoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orcamentos, condominios, clientes, deleteOrcamento, updateOrcamento, addTrabalho, refreshAll } = useApp();
  const [editOpen, setEditOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [items, setItems] = useState<OrcamentoItem[]>([]);
  const [ocultarUnitarios, setOcultarUnitarios] = useState(false);

  const orcamento = orcamentos.find((o) => o.id === id);

  useEffect(() => {
    const fetchItems = async () => {
      if (!orcamento) return;
      const { data } = await supabase.from("orcamento_itens").select("*").eq("orcamento_id", orcamento.id).order("criado_em", { ascending: true });
      if (data) setItems(data as unknown as OrcamentoItem[]);
    };
    fetchItems();
  }, [orcamento]);

  if (!orcamento) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3 font-barlow">
        <FileText className="h-10 w-10 opacity-20" />
        <p>Orçamento não encontrado.</p>
        <Button variant="outline" onClick={() => navigate("/orcamentos")}>Voltar para lista</Button>
      </div>
    );
  }

  const cond = orcamento.condominioId ? condominios.find((c) => c.id === orcamento.condominioId) : undefined;
  const cliente = orcamento.clienteId ? clientes.find((c) => c.id === orcamento.clienteId) : undefined;
  const sindico = orcamento.sindicoId ? clientes.find((c) => c.id === orcamento.sindicoId) : undefined;

  const handleExportPdf = () => {
    try {
      toast.info("Gerando documento PratesPaiva...");
      generateOrcamentoPdf(orcamento, items, cliente, cond, ocultarUnitarios);
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar PDF.");
    }
  };

  const handleDelete = () => {
    if (confirm("Excluir este orçamento?")) {
      deleteOrcamento(orcamento.id);
      navigate("/orcamentos");
    }
  };

  const handleConvert = async () => {
    if (isConverting) return;
    setIsConverting(true);
    try {
      await addTrabalho({
        titulo: orcamento.titulo,
        descricao: orcamento.descricao,
        data: new Date().toISOString().split("T")[0],
        valor: orcamento.valor,
        status_pagamento: "nao_pago",
        status_obra: "aguardando",
        nota_fiscal: "",
        nota_fiscal_data: null,
        nota_fiscal_hora: null,
        data_pagamento: null,
        nota_fiscal_foto_path: "",
        condominioId: orcamento.condominioId,
        clienteId: orcamento.clienteId,
        sindicoId: orcamento.sindicoId,
        endereco_obra: orcamento.endereco_obra,
        observacoes: orcamento.observacoes,
        conclusao_percentual: 0,
        etapa_atual: "Início / Mobilização",
        custo_estimado: 0,
      });
      await refreshAll();
      await updateOrcamento(orcamento.id, { status: "convertido" });
      toast.success("Orçamento convertido em trabalho!");
      setConvertDialogOpen(false);
    } catch {
      toast.error("Erro ao converter orçamento.");
    } finally {
      setIsConverting(false);
    }
  };

  const canConvert = orcamento.status === "aprovado";

  return (
    <div className="space-y-6 animate-slide-in pb-10">
      {/* Action Header */}
      <div className="flex items-center gap-4 flex-wrap border-b border-border pb-5">
        <Button variant="ghost" size="icon" onClick={() => navigate("/orcamentos")} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase tracking-wider">Proposta #{orcamento.numero || orcamento.id.slice(0,5)}</span>
            <OrcamentoStatusBadge status={orcamento.status} />
          </div>
          <h1 className="text-2xl font-bold font-oswald uppercase truncate tracking-tight">{orcamento.titulo}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleExportPdf} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-oswald font-bold uppercase text-xs">
            <Download className="h-4 w-4" /> Exportar PDF
          </Button>
          
          {canConvert && (
            <Button size="sm" onClick={() => setConvertDialogOpen(true)} className="gap-2 font-oswald font-bold uppercase text-xs">
              <ArrowRight className="h-4 w-4" /> Converter p/ Obra
            </Button>
          )}
          
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="h-9 w-9 p-0">
            <Pencil className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="sm" onClick={handleDelete} className="text-destructive h-9 w-9 p-0">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <h2 className="text-sm font-bold font-oswald uppercase text-muted-foreground mb-4 tracking-wide border-b border-border pb-2">Informações da Proposta</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {cond && (
                  <InfoRow icon={Building2} label="Local/Condomínio">
                    <button onClick={() => navigate(`/condominios/${cond.id}`)} className="text-primary font-bold hover:underline text-sm font-barlow">
                      {cond.nome}
                    </button>
                  </InfoRow>
                )}
                {cliente && (
                  <InfoRow icon={User} label="Cliente">
                    <button onClick={() => navigate(`/clientes/${cliente.id}`)} className="text-primary font-bold hover:underline text-sm font-barlow">
                      {cliente.nome}
                    </button>
                  </InfoRow>
                )}
                <InfoRow icon={MapPin} label="Endereço da Obra">
                  <span className="text-sm font-barlow text-muted-foreground">{orcamento.endereco_obra || "Endereço não especificado"}</span>
                </InfoRow>
              </div>

              <div className="space-y-4">
                <InfoRow icon={Calendar} label="Data de Emissão">
                  <span className="text-sm font-barlow font-bold">{formatDate(orcamento.data_emissao)}</span>
                </InfoRow>
                {orcamento.validade && (
                  <InfoRow icon={Calendar} label="Validade Proposta">
                    <span className="text-sm font-barlow font-bold text-orange-600">{formatDate(orcamento.validade)}</span>
                  </InfoRow>
                )}
                {orcamento.trabalhoId && (
                  <InfoRow icon={FileText} label="Ordem de Serviço vinculada">
                    <button onClick={() => navigate(`/trabalhos/${orcamento.trabalhoId}`)} className="text-emerald-600 font-bold hover:underline text-xs uppercase font-oswald flex items-center gap-1">
                      Visualizar OS <ArrowRight className="h-3 w-3" />
                    </button>
                  </InfoRow>
                )}
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <h2 className="text-sm font-bold font-oswald uppercase text-muted-foreground mb-3 tracking-wide">Escopo Técnico</h2>
            <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
              <p className="text-sm font-barlow leading-relaxed whitespace-pre-wrap">{orcamento.descricao || "Nenhum detalhe técnico informado."}</p>
            </div>
          </div>

          {orcamento.observacoes && (
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h2 className="text-sm font-bold font-oswald uppercase text-muted-foreground mb-2 tracking-wide">Notas Internas</h2>
              <p className="text-xs font-barlow italic text-muted-foreground">{orcamento.observacoes}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-3xl border border-border p-8 shadow-lg border-l-4 border-l-primary flex flex-col items-center text-center">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 font-barlow">Investimento Total</p>
            <h2 className="text-4xl font-bold font-oswald text-primary mb-4">{formatCurrency(orcamento.valor)}</h2>
            <div className="w-full h-px bg-border mb-6" />
            <div className="w-full">
               <OrcamentoStatusBadge status={orcamento.status} />
            </div>
            {orcamento.status === "enviado" && (
               <p className="text-[10px] text-muted-foreground mt-4 font-barlow uppercase">Aguardando Aprovação do Cliente</p>
            )}
          </div>

          <div className="bg-muted/40 p-6 rounded-2xl border border-dashed border-border text-center">
             <FileText className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
             <p className="text-xs font-bold font-oswald uppercase text-muted-foreground mb-4">Documentação Profissional</p>
             <div className="flex items-center justify-between bg-background p-2 rounded mb-3 border border-border">
               <label htmlFor="ocultar-valores" className="text-[10px] font-barlow font-bold uppercase text-muted-foreground mr-2 cursor-pointer">Ocultar Preços Unitários</label>
               <input id="ocultar-valores" title="Ocultar valores unitários no PDF" type="checkbox" checked={ocultarUnitarios} onChange={(e) => setOcultarUnitarios(e.target.checked)} className="accent-primary w-4 h-4" />
             </div>
             <Button onClick={handleExportPdf} variant="outline" className="w-full font-oswald font-bold uppercase text-[10px] h-8 bg-background hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200">
                Baixar Proposta Oficial PDF
             </Button>
          </div>
        </div>
      </div>

      <OrcamentoModal open={editOpen} onClose={() => setEditOpen(false)} orcamento={orcamento} />

      <AlertDialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-oswald uppercase">Gerar Ordem de Serviço?</AlertDialogTitle>
            <AlertDialogDescription className="font-barlow">
              Isso criará automaticamente uma OS em "Trabalhos" com os dados desta proposta. Deseja prosseguir com a mobilização da equipe?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isConverting} className="font-barlow">Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={isConverting} onClick={handleConvert} className="font-oswald uppercase bg-primary text-primary-foreground">
               {isConverting ? "Convertendo..." : "Confirmar Mobilização"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function InfoRow({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-barlow">{label}</p>
        <div className="truncate">{children}</div>
      </div>
    </div>
  );
}
