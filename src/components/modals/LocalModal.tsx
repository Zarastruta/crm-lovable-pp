import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Local } from "@/types";
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
  local?: Local;
}

export function LocalModal({ open, onClose, local }: Props) {
  const { addLocal, updateLocal } = useApp();
  const [isSaving, setIsSaving] = useState(false);
  const isEdit = !!local;

  const [form, setForm] = useState({
    nome: "",
    endereco: "",
    tipo_local: "comercial" as Local["tipo_local"],
    observacoes: "",
  });

  useEffect(() => {
    if (local) {
      setForm({
        nome: local.nome,
        endereco: local.endereco,
        tipo_local: local.tipo_local,
        observacoes: local.observacoes,
      });
    } else {
      setForm({ nome: "", endereco: "", tipo_local: "comercial", observacoes: "" });
    }
  }, [local, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      let success = false;
      if (isEdit && local) {
        success = await updateLocal(local.id, form);
      } else {
        const id = await addLocal(form);
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
          <DialogTitle>{isEdit ? "Editar Local" : "Novo Local"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome *</Label>
            <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome do local" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={form.tipo_local} onValueChange={(v) => setForm({ ...form, tipo_local: v as Local["tipo_local"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="residencial">Residencial</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="obra">Obra</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Endereço</Label>
              <Input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} placeholder="Rua, número, cidade..." />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} placeholder="Informações adicionais..." rows={3} />
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Salvando..." : (isEdit ? "Salvar" : "Criar Local")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
