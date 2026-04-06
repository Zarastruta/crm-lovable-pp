import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useApp } from "@/context/AppContext";

function formatShortCurrency(value: number) {
  if (value >= 1000) return `R$${(value / 1000).toFixed(0)}k`;
  return `R$${value.toFixed(0)}`;
}

export function FaturamentoChart() {
  const { trabalhos } = useApp();

  const data = useMemo(() => {
    const map: Record<string, { pago: number; nao_pago: number }> = {};
    const hoje = new Date();

    // Garantir os últimos 6 meses existam no mapa mesmo sem dados
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map[key] = { pago: 0, nao_pago: 0 };
    }

    trabalhos.forEach((t) => {
      if (!t.data) return;
      const key = t.data.substring(0, 7);
      if (!map[key]) return; // ignora meses fora dos 6 últimos
      if (t.status_pagamento === "pago") map[key].pago += t.valor;
      else map[key].nao_pago += t.valor;
    });

    return Object.entries(map).map(([key, val]) => ({
      name: new Date(key + "-01").toLocaleDateString("pt-BR", { month: "short" }),
      Pago: val.pago,
      "Não Pago": val.nao_pago,
    }));
  }, [trabalhos]);

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-5">
      <h2 className="font-semibold text-sm mb-4">Faturamento — Últimos 6 Meses</h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barGap={4} barCategoryGap="30%">
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatShortCurrency}
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip
            formatter={(value: number) =>
              value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
            }
            contentStyle={{
              borderRadius: "8px",
              fontSize: "12px",
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
          <Bar dataKey="Pago" fill="hsl(var(--success, 142 71% 45%))" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Não Pago" fill="hsl(var(--emergency, 0 84% 60%))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
