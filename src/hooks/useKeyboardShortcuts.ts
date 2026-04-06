import { useEffect } from "react";

interface Shortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  action: () => void;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      // Não disparar quando em campo de texto
      const tag = (e.target as HTMLElement)?.tagName;
      const isTyping = tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable;

      for (const sc of shortcuts) {
        const ctrlMatch = sc.ctrl ? (e.ctrlKey || e.metaKey) : true;
        const metaMatch = sc.meta ? e.metaKey : true;
        const modifierOk = sc.ctrl || sc.meta ? ctrlMatch && metaMatch : true;
        const noModifier = !sc.ctrl && !sc.meta;

        // Combinações com Ctrl/Meta podem disparar em campos de texto
        // Teclas solo só disparam fora de inputs
        if (noModifier && isTyping) continue;

        if (e.key.toLowerCase() === sc.key.toLowerCase() && modifierOk) {
          // Para combos com Ctrl, não bloquear se também for noModifier
          if ((sc.ctrl || sc.meta) !== (e.ctrlKey || e.metaKey)) continue;
          e.preventDefault();
          sc.action();
          break;
        }
      }
    };

    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [shortcuts]);
}
