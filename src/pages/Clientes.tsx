import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, ChevronRight, Phone, Mail, User, UserPlus } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TipoContatoBadge } from "@/components/shared/Badges";
import { ContatoModal } from "@/components/modals/ContatoModal";
import { SkeletonList } from "@/components/shared/SkeletonCard";
import { supabase } from "@/integrations/supabase/client";

export default function Clientes() {
  const { orcamentos, condominios, clientes, trabalhos, dataLoading } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // Agora clientes é a lista unificada de todos os registros
  const clientesList = clientes;

  const filtered = clientesList.filter(
    (c) =>
      c.nome.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.telefone.includes(search) ||
      c.cpf_cnpj.includes(search)
  );

  const getCliente = (id: string | null) => id ? clientes.find((c) => c.id === id) : undefined;

  const getWorkCount = (clienteId: string) =>
    trabalhos.filter((t) => t.clienteId === clienteId).length;

  const getOrcamentoCount = (clienteId: string) =>
    orcamentos.filter((o) => o.clienteId === clienteId).length;

  return (
    <div className="space-y-5 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-oswald uppercase tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground font-barlow">{clientes.length} clientes cadastrados na carteira</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="gap-2 font-oswald font-bold uppercase tracking-widest bg-emerald-600 text-white hover:bg-emerald-700">
          <UserPlus className="h-4 w-4" /> Novo Cliente
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome, email, telefone ou CPF/CNPJ..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 font-barlow" />
      </div>

      {dataLoading ? (
        <SkeletonList count={6} />
      ) : (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground opacity-60">
              <User className="h-12 w-12 mb-3" />
              <p className="text-sm font-barlow italic">Nenhum cliente encontrado.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((cliente) => (
                <li
                  key={cliente.id}
                  onClick={() => navigate(`/clientes/${cliente.id}`)}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 cursor-pointer transition-all duration-200 group"
                >
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-lg font-bold text-emerald-600 font-oswald shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                    {cliente.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold font-oswald tracking-wide uppercase text-foreground">{cliente.nome}</p>
                      <TipoContatoBadge tipo={cliente.tipo} />
                    </div>
                    <div className="flex items-center gap-4 mt-0.5 font-barlow">
                      {cliente.telefone && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {cliente.telefone}
                        </span>
                      )}
                      {cliente.email && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {cliente.email}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-6 shrink-0 text-right font-barlow">
                    <div>
                      <p className="text-lg font-bold font-oswald text-primary">{getOrcamentoCount(cliente.id)}</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Propostas</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold font-oswald text-emerald-600">{getWorkCount(cliente.id)}</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Obras</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Ao abrir daqui, forçamos o tipo inicial do modal se quiséssemos, mas o ContatoModal padrão atende */}
      <ContatoModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
