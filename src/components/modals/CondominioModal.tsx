import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Condominio } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onClose: () => void;
  condominio?: Condominio;
}

export function CondominioModal({ open, onClose, condominio }: Props) {
  const { addCondominio, updateCondominio, clientes } = useApp();
  const [isSaving, setIsSaving] = useState(false);
  const isEdit = !!condominio;

  const sindicos = clientes.filter((c) => c.tipo === "sindico");
  const administradoras = clientes.filter((c) => c.tipo === "administradora");

  const [form, setForm] = useState({
    nome: "",
    cnpj: "",
    endereco: "",
    sindicoId: null as string | null,
    administradoraId: null as string | null,
    observacoes: "",
  });

  useEffect(() => {
    if (condominio) {
      setForm({
        nome: condominio.nome, cnpj: condominio.cnpj, endereco: condominio.endereco,
        sindicoId: condominio.sindicoId, administradoraId: condominio.administradoraId,
        observacoes: condominio.observacoes,
      });
    } else {
      setForm({ nome: "", cnpj: "", endereco: "", sindicoId: null, administradoraId: null, observacoes: "" });
    }
  }, [condominio, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      let success = false;
      if (isEdit && condominio) {
        success = await updateCondominio(condominio.id, form);
      } else {
        const id = await addCondominio(form);
        success = !!id;
      }
      if (success) onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()} className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Condomínio" : "Novo Condomínio"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome *</Label>
            <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome do condomínio" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>CNPJ</Label>
              <Input value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} placeholder="00.000.000/0001-00" />
            </div>
            <div className="space-y-1.5">
              <Label>Endereço</Label>
              <Input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} placeholder="Rua, número, cidade..." />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Síndico</Label>
            <Select value={form.sindicoId ?? "_none"} onValueChange={(v) => setForm({ ...form, sindicoId: v === "_none" ? null : v })}>
              <SelectTrigger><SelectValue placeholder="Selecionar síndico..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">Nenhum</SelectItem>
                {sindicos.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Administradora</Label>
            <Select value={form.administradoraId ?? "_none"} onValueChange={(v) => setForm({ ...form, administradoraId: v === "_none" ? null : v })}>
              <SelectTrigger><SelectValue placeholder="Selecionar administradora..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">Nenhuma</SelectItem>
                {administradoras.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} placeholder="Informações adicionais..." rows={3} />
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
            <Button type="submit" disabled={isSaving}>
               {isSaving ? "Salvando..." : (isEdit ? "Salvar" : "Criar Condomínio")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
