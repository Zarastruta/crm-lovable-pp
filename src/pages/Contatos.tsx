import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, ChevronRight, Phone, Mail } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TipoContatoBadge } from "@/components/shared/Badges";
import { ContatoModal } from "@/components/modals/ContatoModal";
import { SkeletonList } from "@/components/shared/SkeletonCard";

export default function Contatos() {
  const { contatos, trabalhos, dataLoading } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = contatos.filter(
    (c) =>
      c.nome.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.telefone.includes(search) ||
      c.cpf_cnpj.includes(search)
  );

  const getWorkCount = (contatoId: string) =>
    trabalhos.filter((t) => t.clienteId === contatoId || t.sindicoId === contatoId).length;

  return (
    <div className="space-y-5 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contatos</h1>
          <p className="text-sm text-muted-foreground">{contatos.length} contatos cadastrados</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Contato
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome, email, telefone ou CPF/CNPJ..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {dataLoading ? (
        <SkeletonList count={6} />
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground p-8 text-center">Nenhum contato encontrado.</p>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((contato) => (
                <li
                  key={contato.id}
                  onClick={() => navigate(`/contatos/${contato.id}`)}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-muted/40 cursor-pointer transition-all duration-200 hover:shadow-sm hover:-translate-y-px"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0">
                    {contato.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-foreground">{contato.nome}</p>
                      <TipoContatoBadge tipo={contato.tipo} />
                    </div>
                    <div className="flex items-center gap-4 mt-0.5">
                      {contato.telefone && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {contato.telefone}
                        </span>
                      )}
                      {contato.email && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {contato.email}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 shrink-0 text-right">
                    <div>
                      <p className="text-sm font-semibold">{getWorkCount(contato.id)}</p>
                      <p className="text-2xs text-muted-foreground">trabalhos</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <ContatoModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
