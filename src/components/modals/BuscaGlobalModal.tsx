import { formatCurrency } from "@/lib/utils";
import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Wrench, FileText, User, Building2, X } from "lucide-react";
import { useApp } from "@/context/AppContext";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface BuscaGlobalModalProps {
  open: boolean;
  onClose: () => void;
}

export function BuscaGlobalModal({ open, onClose }: BuscaGlobalModalProps) {
  const navigate = useNavigate();
  const { trabalhos, orcamentos, clientes, locais } = useApp();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const items: { type: string; label: string; sub: string; href: string; icon: React.ElementType }[] = [];

    trabalhos
      .filter((t) => t.titulo.toLowerCase().includes(q))
      .slice(0, 4)
      .forEach((t) =>
        items.push({
          type: "Trabalho",
          label: t.titulo,
          sub: formatCurrency(t.valor),
          href: `/trabalhos/${t.id}`,
          icon: Wrench,
        })
      );

    orcamentos
      .filter((o) => o.titulo.toLowerCase().includes(q))
      .slice(0, 4)
      .forEach((o) =>
        items.push({
          type: "Orçamento",
          label: `#${o.numero} ${o.titulo}`,
          sub: formatCurrency(o.valor),
          href: `/orcamentos/${o.id}`,
          icon: FileText,
        })
      );

    clientes
      .filter((c) => c.nome.toLowerCase().includes(q) || c.telefone.includes(q))
      .slice(0, 4)
      .forEach((c) =>
        items.push({
          type: "Cliente",
          label: c.nome,
          sub: c.telefone || c.email || c.tipo,
          href: `/clientes/${c.id}`,
          icon: User,
        })
      );

    locais
      .filter((l) => l.nome.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((l) =>
        items.push({
          type: "Local",
          label: l.nome,
          sub: l.endereco || "",
          href: `/locais/${l.id}`,
          icon: Building2,
        })
      );

    return items;
  }, [query, trabalhos, orcamentos, clientes, locais]);

  const handleSelect = (href: string) => {
    navigate(href);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden gap-0">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar trabalhos, orçamentos, clientes..."
            className="border-0 shadow-none focus-visible:ring-0 h-8 px-0 text-sm"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Limpar busca" className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {!query && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Digite para buscar em todo o CRM
            </p>
          )}
          {query && results.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum resultado encontrado para "{query}"
            </p>
          )}
          {results.length > 0 && (
            <ul className="divide-y divide-border">
              {results.map((item, i) => (
                <li
                  key={i}
                  onClick={() => handleSelect(item.href)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                  <span className="text-2xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                    {item.type}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
