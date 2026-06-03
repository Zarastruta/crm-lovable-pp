import { formatCurrency, formatDate } from "@/lib/utils";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Pencil, Trash2, Building2, User, Calendar, 
  DollarSign, FileText, MapPin, Clock, Image, 
  TrendingUp, ListTodo, ClipboardCheck 
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PagamentoBadge, ObraStatusBadge } from "@/components/shared/Badges";
import { TrabalhoModal } from "@/components/modals/TrabalhoModal";
import { Progress } from "@/components/ui/progress";

export default function TrabalhoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { trabalhos, locais, clientes, deleteTrabalho, dataLoading } = useApp();
  const [editOpen, setEditOpen] = useState(false);

  const trabalho = trabalhos.find((t) => t.id === id);
  if (!trabalho) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3 font-barlow">
        <p>Ordem de Serviço não encontrada.</p>
        <Button variant="outline" onClick={() => navigate("/os")}>Voltar</Button>
      </div>
    );
  }

  const getCondominio = (id: string | null) => id ? locais.find((l) => l.id === id) : undefined;
  const getCliente = (id: string | null) => id ? clientes.find((c) => c.id === id) : undefined;
  
  const cond = getCondominio(trabalho.condominioId);
  const cliente = getCliente(trabalho.clienteId);
  const sindico = getCliente(trabalho.sindicoId);

  const nfFotoUrl = trabalho.nota_fiscal_foto_path
    ? supabase.storage.from("notas-fiscais").getPublicUrl(trabalho.nota_fiscal_foto_path).data.publicUrl
    : null;

  const lucroEstimado = trabalho.valor - (trabalho.custo_estimado || 0);
  const margemLucro = trabalho.valor > 0 ? (lucroEstimado / trabalho.valor) * 100 : 0;

  const handleDelete = () => {
    if (confirm("Excluir esta OS?")) {
      deleteTrabalho(trabalho.id);
      navigate("/os");
    }
  };

  return (
    <div className="space-y-6 animate-slide-in pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap border-b border-border pb-5 bg-background sticky top-0 z-10 backdrop-blur-sm">
        <Button variant="ghost" size="icon" onClick={() => navigate("/os")} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-bold uppercase tracking-wider">Serviço #{trabalho.id.slice(0, 5)}</span>
            <ObraStatusBadge status={trabalho.status_obra ?? "Novo"} />
          </div>
          <h1 className="text-2xl font-bold font-oswald uppercase truncate tracking-tight">{trabalho.titulo}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="gap-2 font-barlow font-bold">
            <Pencil className="h-4 w-4" /> Editar
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete} className="text-destructive hover:bg-destructive/10 h-9 w-9 p-0">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Operational Progress Card */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 border-l-4 border-l-primary">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <ListTodo className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-bold font-oswald uppercase text-sm tracking-wide">Monitoramento de Execução</h2>
                  <p className="text-xs text-muted-foreground font-barlow">Status atual da obra em tempo real.</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold font-oswald">{trabalho.conclusao_percentual || 0}%</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <Progress value={trabalho.conclusao_percentual || 0} className="h-3 bg-muted" />
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-muted/30 p-3 rounded-xl border border-border/50">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Etapa Atual</p>
                  <p className="text-sm font-bold font-oswald uppercase">{trabalho.etapa_atual || "Não Definida"}</p>
                </div>
                <div className="bg-muted/30 p-3 rounded-xl border border-border/50">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Data Fixada</p>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <p className="text-sm font-bold font-oswald">{formatDate(trabalho.data)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <h3 className="text-sm font-bold font-oswald uppercase text-muted-foreground mb-4 flex items-center gap-2">
                  <Building2 className="h-4 w-4" /> Localização & Cliente
                </h3>
                <div className="space-y-4">
                  {cond && (
                    <InfoRow icon={Building2} label="Condomínio/Local">
                      <button onClick={() => navigate(`/locais/${cond.id}`)} className="text-primary font-bold hover:underline font-barlow text-sm block truncate">
                        {cond.nome}
                      </button>
                    </InfoRow>
                  )}
                  {cliente && (
                    <InfoRow icon={User} label="Proprietário">
                      <button onClick={() => navigate(`/clientes/${cliente.id}`)} className="text-primary font-bold hover:underline font-barlow text-sm block truncate">
                        {cliente.nome}
                      </button>
                    </InfoRow>
                  )}
                  {trabalho.endereco_obra && (
                    <InfoRow icon={MapPin} label="Endereço Completo">
                      <span className="text-xs font-barlow block leading-tight text-muted-foreground">{trabalho.endereco_obra}</span>
                    </InfoRow>
                  )}
                </div>
             </div>

             <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <h3 className="text-sm font-bold font-oswald uppercase text-muted-foreground mb-4 flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Resumo Administrativo
                </h3>
                <div className="space-y-4">
                   <InfoRow icon={ClipboardCheck} label="Documentação">
                      <div className="flex items-center gap-2 mt-1">
                        {trabalho.nota_fiscal ? (
                          <span className="text-xs font-bold font-barlow text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">NF: {trabalho.nota_fiscal}</span>
                        ) : (
                          <span className="text-xs font-barlow text-muted-foreground italic">Sem Nota Fiscal vinculada</span>
                        )}
                      </div>
                   </InfoRow>
                   <InfoRow icon={Clock} label="Última Atualização">
                      <span className="text-xs font-barlow text-muted-foreground">{formatDate(trabalho.criadoEm)}</span>
                   </InfoRow>
                </div>
             </div>
          </div>

          {trabalho.descricao && (
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h2 className="text-sm font-bold font-oswald uppercase text-muted-foreground mb-3 tracking-wider">Escopo do Serviço</h2>
              <p className="text-sm font-barlow text-foreground leading-relaxed whitespace-pre-wrap">{trabalho.descricao}</p>
            </div>
          )}

          {trabalho.observacoes && (
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h2 className="text-sm font-bold font-oswald uppercase text-muted-foreground mb-3 tracking-wider">Diário de Campo / Observações</h2>
              <p className="text-sm font-barlow text-foreground leading-relaxed whitespace-pre-wrap italic">{trabalho.observacoes}</p>
            </div>
          )}
        </div>

        {/* Financial Column */}
        <div className="space-y-6">
          <div className="bg-card rounded-3xl border border-border p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <TrendingUp className="h-20 w-20" />
            </div>
            <h2 className="text-sm font-bold font-oswald uppercase text-muted-foreground mb-4 tracking-wider">Resultado Financeiro</h2>
            
            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Valor Contratado</p>
                  <p className="text-3xl font-bold font-oswald text-foreground">{formatCurrency(trabalho.valor)}</p>
                </div>
                <PagamentoBadge status={trabalho.status_pagamento} />
              </div>

              <div className="h-px bg-border w-full" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Custo Equipe</p>
                  <p className="text-lg font-bold font-oswald text-destructive">{formatCurrency(trabalho.custo_estimado || 0)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Lucro Provisório</p>
                  <p className={`text-lg font-bold font-oswald ${lucroEstimado >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                    {formatCurrency(lucroEstimado)}
                  </p>
                </div>
              </div>

              <div className="bg-muted p-3 rounded-xl flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-muted-foreground font-barlow">Margem de Lucro</span>
                <span className={`text-sm font-bold font-oswald ${margemLucro > 30 ? 'text-emerald-600' : 'text-orange-500'}`}>
                  {margemLucro.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Photo Preview / Attachment Shortcut */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
             <h3 className="text-sm font-bold font-oswald uppercase text-muted-foreground mb-4 flex items-center gap-2">
                <Image className="h-4 w-4" /> Anexos de Obra
             </h3>
             {nfFotoUrl ? (
                <div className="group relative rounded-xl overflow-hidden cursor-pointer shadow-sm border border-border hover:border-primary/50 transition-all">
                  <img src={nfFotoUrl} alt="Documentação" className="w-full h-32 object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" size="sm" className="font-oswald" onClick={() => window.open(nfFotoUrl, '_blank')}>VISUALIZAR</Button>
                  </div>
                </div>
             ) : (
                <div className="py-8 text-center bg-muted/40 rounded-xl border border-dashed border-border flex flex-col items-center">
                   <Image className="h-8 w-8 text-muted-foreground/30 mb-2" />
                   <p className="text-[10px] font-bold text-muted-foreground uppercase font-barlow">Nenhum anexo</p>
                </div>
             )}
          </div>
        </div>
      </div>

      <TrabalhoModal open={editOpen} onClose={() => setEditOpen(false)} trabalho={trabalho} />
    </div>
  );
}

function InfoRow({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-primary mt-1 shrink-0 bg-primary/5 p-0.5 rounded" />
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-barlow">{label}</p>
        <div className="font-barlow">{children}</div>
      </div>
    </div>
  );
}
