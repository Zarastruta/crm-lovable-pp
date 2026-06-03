import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BuscaGlobalModal } from "@/components/modals/BuscaGlobalModal";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const [buscaOpen, setBuscaOpen] = useState(false);

  const openBusca = useCallback(() => setBuscaOpen(true), []);
  const newTrabalho = useCallback(() => navigate("/os"), [navigate]);

  useKeyboardShortcuts([
    { key: "k", ctrl: true, action: openBusca },
    { key: "n", action: newTrabalho },
  ]);

  return (
    <>
      <header className="h-[60px] flex items-center gap-3 px-4 border-b border-border bg-card min-h-[60px]">
        <button
          onClick={onMenuClick}
          aria-label="Abrir menu de navegação"
          className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex-1" />

        <button
          onClick={() => setBuscaOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-sm"
          title="Busca global (ctrl+k)"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline text-xs">Buscar...</span>
          <kbd className="hidden sm:inline text-2xs bg-background rounded px-1 py-0.5 border border-border ml-1">⌘K</kbd>
        </button>

        <Button
          size="sm"
          onClick={() => navigate("/os")}
          className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nova OS</span>
        </Button>
      </header>

      <BuscaGlobalModal open={buscaOpen} onClose={() => setBuscaOpen(false)} />
    </>
  );
}
