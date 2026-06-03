import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, ChevronRight, MapPin } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocalModal } from "@/components/modals/LocalModal";

const TIPO_LABEL: Record<string, string> = {
  residencial: "Residencial",
  comercial: "Comercial",
  industrial: "Industrial",
  obra: "Obra",
};

export default function Locais() {
  const { locais, trabalhos, dataLoading } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = locais.filter((l) =>
    l.nome.toLowerCase().includes(search.toLowerCase()) ||
    l.endereco.toLowerCase().includes(search.toLowerCase())
  );

  const getStats = (localId: string) => {
    const trab = trabalhos.filter((t) => t.condominioId === localId);
    return {
      count: trab.length,
      total: trab.reduce((s, t) => s + t.valor, 0),
    };
  };

  return (
    <div className="space-y-5 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Locais</h1>
          <p className="text-sm text-muted-foreground">{locais.length} locais cadastrados</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Local
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar locais..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground p-8 text-center">Nenhum local encontrado.</p>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((local) => {
              const stats = getStats(local.id);
              return (
                <li
                  key={local.id}
                  onClick={() => navigate(`/locais/${local.id}`)}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-muted/40 cursor-pointer transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{local.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {TIPO_LABEL[local.tipo_local] ?? local.tipo_local} · {local.endereco || "Sem endereço"}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 shrink-0 text-right">
                    <div>
                      <p className="text-sm font-semibold">{stats.count}</p>
                      <p className="text-2xs text-muted-foreground">OS</p>
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

      <LocalModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
