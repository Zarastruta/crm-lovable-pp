import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { Plus, Search, User, DollarSign, Briefcase } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { toast } from "sonner";
import { Funcionario, TipoFuncionario } from "@/types";

export default function Equipe() {
  const { funcionarios, addFuncionario, updateFuncionario, deleteFuncionario, dataLoading } = useApp();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFunc, setEditingFunc] = useState<Funcionario | null>(null);

  const filtered = (funcionarios || []).filter((f) =>
    f.nome.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      nome: formData.get("nome") as string,
      tipo: formData.get("tipo") as TipoFuncionario,
      valor_diaria: Number(formData.get("valor_diaria")),
      ativo: true,
    };

    if (editingFunc) {
      await updateFuncionario(editingFunc.id, data);
    } else {
      await addFuncionario(data);
    }
    setIsModalOpen(false);
    setEditingFunc(null);
  };

  return (
    <div className="space-y-5 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-oswald uppercase tracking-tight">Equipe e Colaboradores</h1>
          <p className="text-sm text-muted-foreground font-barlow">Gestão de pessoal e controle de custos de diárias.</p>
        </div>
        <Button onClick={() => { setEditingFunc(null); setIsModalOpen(true); }} className="gap-2 bg-foreground text-background hover:bg-foreground/90">
          <Plus className="h-4 w-4" /> Novo Colaborador
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar colaborador..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="pl-9 bg-card border-border/50 focus:border-primary/50 transition-all font-barlow"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && !dataLoading ? (
          <div className="col-span-full py-20 text-center bg-card rounded-xl border border-dashed border-border/60">
            <User className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground font-barlow">Nenhum colaborador encontrado.</p>
          </div>
        ) : (
          filtered.map((f) => (
            <div key={f.id} className="bg-card p-5 rounded-xl border border-border shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                  <User className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setEditingFunc(f); setIsModalOpen(true); }} className="h-8 w-8 p-0">
                    <Briefcase className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <h3 className="font-bold text-lg font-oswald uppercase group-hover:text-primary transition-colors">{f.nome}</h3>
              <p className="text-sm text-muted-foreground font-barlow capitalize mb-3">{f.tipo}</p>
              
              <div className="flex items-center gap-2 text-sm font-semibold bg-muted/50 p-2 rounded-md border border-border/40">
                <DollarSign className="h-4 w-4 text-emerald-500" />
                <span className="font-barlow">Valor Diária: {formatCurrency(f.valor_diaria)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md p-6 rounded-2xl border border-border shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold font-oswald uppercase mb-4">{editingFunc ? "Editar Colaborador" : "Novo Colaborador"}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Nome Completo</label>
                <Input name="nome" defaultValue={editingFunc?.nome} required className="font-barlow" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Tipo</label>
                  <select 
                    name="tipo" 
                    title="Tipo de Colaborador"
                    defaultValue={editingFunc?.tipo || "proprio"} 
                    className="w-full h-10 px-3 rounded-md border border-input bg-background font-barlow text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="proprio">Próprio</option>
                    <option value="terceirizado">Terceirizado</option>
                    <option value="parceiro">Parceiro</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Valor Diária</label>
                  <Input name="valor_diaria" type="number" step="0.01" defaultValue={editingFunc?.valor_diaria} required className="font-barlow" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1 font-barlow">Cancelar</Button>
                <Button type="submit" className="flex-1 bg-foreground text-background hover:bg-foreground/90 font-barlow font-bold">Salvar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
