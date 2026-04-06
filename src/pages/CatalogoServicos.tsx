import { useState } from "react";
import { 
  Package, Plus, Pencil, Trash2, Search, Tag, User as UserIcon
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { CatalogoServico } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

export default function CatalogoServicos() {
  const { catalogoServicos, addCatalogoServico, updateCatalogoServico, deleteCatalogoServico, funcionarios } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogoServico | null>(null);
  
  const [form, setForm] = useState({
    nome: "",
    unidade_padrao: "un",
    valor_base_sugerido: 0,
    custo_padrao: 0,
    prestador_padrao_id: "",
  });

  const filtered = catalogoServicos.filter(s => 
    s.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (item?: CatalogoServico) => {
    if (item) {
      setEditingItem(item);
      setForm({
        nome: item.nome,
        unidade_padrao: item.unidade_padrao,
        valor_base_sugerido: item.valor_base_sugerido,
        custo_padrao: item.custo_padrao,
        prestador_padrao_id: item.prestador_padrao_id || "",
      });
    } else {
      setEditingItem(null);
      setForm({ nome: "", unidade_padrao: "un", valor_base_sugerido: 0, custo_padrao: 0, prestador_padrao_id: "" });
    }
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      prestador_padrao_id: form.prestador_padrao_id ? form.prestador_padrao_id : null
    };

    if (editingItem) {
      updateCatalogoServico(editingItem.id, payload);
    } else {
      addCatalogoServico(payload);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Excluir este serviço do catálogo? Ele não será removido de orçamentos antigos.")) {
      deleteCatalogoServico(id);
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <div className="space-y-6 animate-slide-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-oswald uppercase tracking-tight">Catálogo de Serviços</h1>
          <p className="text-sm text-muted-foreground font-barlow tracking-wider">Padronização de Custos e Terceirizados</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2 font-oswald font-bold uppercase tracking-widest bg-foreground text-background hover:bg-foreground/90">
          <Plus className="h-4 w-4" /> Cadastrar Serviço
        </Button>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar serviço por nome..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 font-barlow"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-6 py-4 font-bold font-oswald uppercase text-[10px] tracking-wider text-muted-foreground whitespace-nowrap">Serviço / Item</th>
                <th className="text-center px-6 py-4 font-bold font-oswald uppercase text-[10px] tracking-wider text-muted-foreground whitespace-nowrap">Unidade</th>
                <th className="text-right px-6 py-4 font-bold font-oswald uppercase text-[10px] tracking-wider text-muted-foreground whitespace-nowrap">Valor Venda (Sugerido)</th>
                <th className="text-right px-6 py-4 font-bold font-oswald uppercase text-[10px] tracking-wider text-muted-foreground whitespace-nowrap">Custo Padrão</th>
                <th className="text-left px-6 py-4 font-bold font-oswald uppercase text-[10px] tracking-wider text-muted-foreground whitespace-nowrap">Parceiro Padrão</th>
                <th className="text-right px-6 py-4 font-bold font-oswald uppercase text-[10px] tracking-wider text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length > 0 ? (
                filtered.map((s) => {
                  const func = funcionarios.find(f => f.id === s.prestador_padrao_id);
                  const margem = s.valor_base_sugerido - s.custo_padrao;
                  
                  return (
                    <tr key={s.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/5 rounded-lg group-hover:bg-primary/10 transition-colors">
                            <Tag className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-bold font-oswald uppercase tracking-tight">{s.nome}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-muted font-bold font-oswald text-xs uppercase">
                          {s.unidade_padrao}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-emerald-600">{formatCurrency(s.valor_base_sugerido)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-destructive">{formatCurrency(s.custo_padrao)}</span>
                        {margem > 0 && (
                          <p className="text-[10px] text-muted-foreground font-barlow mt-0.5">Lucro: {formatCurrency(margem)}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs font-barlow">
                          <UserIcon className="h-3 w-3 text-muted-foreground" />
                          <span className={func ? "font-bold" : "text-muted-foreground"}>
                            {func ? func.nome : "Sem Vínculo"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 px-1">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenModal(s)} className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)} className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground font-barlow italic">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-8 w-8 opacity-20" />
                      <p>Nenhum serviço catalogado.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-oswald uppercase">
              {editingItem ? "Editar Serviço" : "Cadastrar Serviço"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2 col-span-2">
                <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground">Nome do Serviço</Label>
                <Input 
                  value={form.nome} 
                  onChange={(e) => setForm({ ...form, nome: e.target.value })} 
                  placeholder="Ex: Instalação de Porcelanato" 
                  required 
                  className="font-oswald uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground">UN Padrão</Label>
                <Input 
                  value={form.unidade_padrao} 
                  onChange={(e) => setForm({ ...form, unidade_padrao: e.target.value })} 
                  placeholder="Ex: m²" 
                  required
                  className="font-oswald uppercase"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground">Custo Padrão (R$)</Label>
                <Input 
                  type="number"
                  step="0.01"
                  value={form.custo_padrao} 
                  onChange={(e) => setForm({ ...form, custo_padrao: Number(e.target.value) })} 
                  className="font-oswald"
                />
              </div>
              <div className="space-y-2">
                <Label className="uppercase text-[10px] font-bold tracking-widest text-emerald-600">Venda Base Sugerida (R$)</Label>
                <Input 
                  type="number"
                  step="0.01"
                  value={form.valor_base_sugerido} 
                  onChange={(e) => setForm({ ...form, valor_base_sugerido: Number(e.target.value) })} 
                  className="font-oswald border-emerald-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground">Parceiro / Profissional Padrão</Label>
              <select 
                title="Parceiro / Profissional Padrão"
                value={form.prestador_padrao_id} 
                onChange={(e) => setForm({ ...form, prestador_padrao_id: e.target.value })}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 font-barlow"
              >
                <option value="">-- Nenhum Vínculo --</option>
                {funcionarios.map(f => (
                  <option key={f.id} value={f.id}>{f.nome} ({f.tipo})</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="flex-1 font-barlow font-bold">CANCELAR</Button>
              <Button type="submit" className="flex-1 bg-foreground text-background hover:bg-foreground/90 font-oswald font-bold uppercase tracking-widest">
                {editingItem ? "ATUALIZAR" : "CADASTRAR"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
