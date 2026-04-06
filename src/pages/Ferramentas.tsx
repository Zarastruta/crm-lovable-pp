import { useState } from "react";
import { 
  Wrench, Plus, Pencil, Trash2, MapPin, 
  Search, Package, AlertCircle 
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Ferramenta } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

export default function Ferramentas() {
  const { ferramentas, addFerramenta, updateFerramenta, deleteFerramenta } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Ferramenta | null>(null);
  
  const [form, setForm] = useState({
    nome: "",
    local_atual: "",
    quantidade: 1,
    observacoes: "",
  });

  const filtered = ferramentas.filter(f => 
    f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.local_atual.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (item?: Ferramenta) => {
    if (item) {
      setEditingItem(item);
      setForm({
        nome: item.nome,
        local_atual: item.local_atual,
        quantidade: item.quantidade,
        observacoes: item.observacoes,
      });
    } else {
      setEditingItem(null);
      setForm({ nome: "", local_atual: "", quantidade: 1, observacoes: "" });
    }
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateFerramenta(editingItem.id, form);
    } else {
      addFerramenta(form);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Excluir esta ferramenta do inventário?")) {
      deleteFerramenta(id);
    }
  };

  return (
    <div className="space-y-6 animate-slide-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-oswald uppercase tracking-tight">Controle de Ferramentas</h1>
          <p className="text-sm text-muted-foreground font-barlow tracking-wider">Gestão de Inventário e Localização de Ativos</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2 font-oswald font-bold uppercase tracking-widest bg-foreground text-background hover:bg-foreground/90">
          <Plus className="h-4 w-4" /> Novo Item
        </Button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm border-l-4 border-l-primary">
          <div className="flex items-center gap-3 mb-2">
            <Package className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-bold uppercase text-muted-foreground font-barlow">Total no Inventário</span>
          </div>
          <p className="text-3xl font-bold font-oswald">{ferramentas.reduce((acc, f) => acc + f.quantidade, 0)}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-3 mb-2">
            <Wrench className="h-4 w-4 text-emerald-600" />
            <span className="text-[10px] font-bold uppercase text-muted-foreground font-barlow">Tipos de Ferramentas</span>
          </div>
          <p className="text-3xl font-bold font-oswald">{ferramentas.length}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm border-l-4 border-l-orange-500">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="h-4 w-4 text-orange-600" />
            <span className="text-[10px] font-bold uppercase text-muted-foreground font-barlow">Locais Ativos</span>
          </div>
          <p className="text-3xl font-bold font-oswald">
            {new Set(ferramentas.map(f => f.local_atual).filter(l => l && l.toLowerCase() !== "almoxarifado")).size}
          </p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nome ou local..." 
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
                <th className="text-left px-6 py-4 font-bold font-oswald uppercase text-[10px] tracking-wider text-muted-foreground">Item / Nome</th>
                <th className="text-left px-6 py-4 font-bold font-oswald uppercase text-[10px] tracking-wider text-muted-foreground whitespace-nowrap">Local Atual</th>
                <th className="text-center px-6 py-4 font-bold font-oswald uppercase text-[10px] tracking-wider text-muted-foreground whitespace-nowrap">Qtd</th>
                <th className="text-left px-6 py-4 font-bold font-oswald uppercase text-[10px] tracking-wider text-muted-foreground">Observações</th>
                <th className="text-right px-6 py-4 font-bold font-oswald uppercase text-[10px] tracking-wider text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length > 0 ? (
                filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/5 rounded-lg group-hover:bg-primary/10 transition-colors">
                          <Wrench className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-bold font-oswald uppercase tracking-tight">{f.nome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-barlow">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className={f.local_atual.toLowerCase() === "almoxarifado" ? "text-muted-foreground" : "text-primary font-bold"}>
                          {f.local_atual || "Não Informado"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-muted font-bold font-oswald text-xs">
                        {f.quantidade}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-[10px] font-barlow text-muted-foreground italic">
                      {f.observacoes || "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 px-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(f)} className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(f.id)} className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground font-barlow italic">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-8 w-8 opacity-20" />
                      <p>Nenhuma ferramenta encontrada.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-oswald uppercase">
              {editingItem ? "Editar Ferramenta" : "Cadastrar Nova Ferramenta"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground">Nome do Item</Label>
              <Input 
                value={form.nome} 
                onChange={(e) => setForm({ ...form, nome: e.target.value })} 
                placeholder="Ex: Furadeira Makita HP1640" 
                required 
                className="font-oswald uppercase"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground">Local / Obra Atual</Label>
                <Input 
                  value={form.local_atual} 
                  onChange={(e) => setForm({ ...form, local_atual: e.target.value })} 
                  placeholder="Ex: Almoxarifado" 
                  className="font-barlow"
                />
              </div>
              <div className="space-y-2">
                <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground">Quantidade</Label>
                <Input 
                  type="number"
                  value={form.quantidade} 
                  onChange={(e) => setForm({ ...form, quantidade: Number(e.target.value) })} 
                  min={1}
                  className="font-oswald"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground">Observações Técnicas</Label>
              <Textarea 
                value={form.observacoes} 
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })} 
                placeholder="Ex: Voltagem 110v, necessita troca de carvão..." 
                rows={3}
                className="font-barlow text-xs"
              />
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
