import * as React from "react";
import { cn } from "@/lib/utils";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
}

export function CurrencyInput({ value, onChange, className, placeholder = "R$ 0,00" }: CurrencyInputProps) {
  const [display, setDisplay] = React.useState("");

  React.useEffect(() => {
    if (value > 0) {
      setDisplay(formatCurrency(value));
    } else {
      setDisplay("");
    }
  }, [value]);

  function formatCurrency(val: number): string {
    return val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function parseCurrency(raw: string): number {
    const digits = raw.replace(/\D/g, "");
    return Number(digits) / 100;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const numericValue = parseCurrency(raw);
    setDisplay(numericValue > 0 ? formatCurrency(numericValue) : "");
    onChange(numericValue);
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
        R$
      </span>
      <input
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
      />
    </div>
  );
}
