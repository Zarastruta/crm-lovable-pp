import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, ChevronRight, Building2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { CondominioModal } from "@/components/modals/CondominioModal";

export default function Condominios() {
  const { condominios, clientes, trabalhos, dataLoading } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const getCliente = (id: string | null) => id ? clientes.find((c) => c.id === id) : undefined;

  const filtered = condominios.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.endereco.toLowerCase().includes(search.toLowerCase())
  );

  const getStats = (condId: string) => {
    const trab = trabalhos.filter((t) => t.condominioId === condId);
    return {
      count: trab.length,
      total: trab.reduce((s, t) => s + t.valor, 0),
    };
  };

  return (
    <div className="space-y-5 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Condomínios</h1>
          <p className="text-sm text-muted-foreground">{condominios.length} condomínios cadastrados</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Condomínio
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar condomínios..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground p-8 text-center">Nenhum condomínio encontrado.</p>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((cond) => {
              const sindico = getCliente(cond.sindicoId);
              const admin = getCliente(cond.administradoraId);
              const stats = getStats(cond.id);
              return (
                <li
                  key={cond.id}
                  onClick={() => navigate(`/condominios/${cond.id}`)}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-muted/40 cursor-pointer transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{cond.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {sindico ? `Síndico: ${sindico.nome}` : "Sem síndico"} · {cond.endereco || "Sem endereço"}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 shrink-0 text-right">
                    <div>
                      <p className="text-sm font-semibold">{stats.count}</p>
                      <p className="text-2xs text-muted-foreground">trabalhos</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{formatCurrency(stats.total)}</p>
                      <p className="text-2xs text-muted-foreground">valor total</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <CondominioModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
