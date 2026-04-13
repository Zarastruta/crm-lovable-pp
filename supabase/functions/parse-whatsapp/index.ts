import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mensagem, catalogo } = await req.json() as {
      mensagem: string;
      catalogo: { nome: string; unidade: string; valor?: number }[];
    };

    if (!mensagem?.trim()) {
      return new Response(JSON.stringify({ error: "Mensagem vazia." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: "Chave da API não configurada no servidor." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const catalogoTexto = catalogo.length > 0
      ? `\nCatálogo de serviços da empresa (use os nomes exatos quando houver correspondência):\n${catalogo.map(s =>
          `- "${s.nome}" (unidade: ${s.unidade}${s.valor ? `, referência: R$ ${s.valor.toFixed(2)}` : ""})`
        ).join("\n")}`
      : "";

    const prompt = `Você é um assistente especializado em interpretar pedidos de clientes de uma empresa de manutenção predial recebidos por WhatsApp e convertê-los em dados estruturados para geração de orçamento.${catalogoTexto}

Analise a mensagem abaixo e extraia as informações solicitadas.

Regras importantes:
- "titulo": título comercial objetivo do serviço, ex: "Pintura Apartamento 302 - Bloco B" ou "Reforma Banheiro Cobertura"
- "cliente_nome": nome da pessoa que enviou ou foi mencionada como cliente. Deixe vazio se não identificado.
- "endereco": endereço ou local da obra. Deixe vazio se não mencionado.
- "descricao": breve resumo da situação/problema descrito pelo cliente, em linguagem formal para constar no orçamento.
- "servicos": lista dos serviços identificados. Para cada serviço:
  - "nome": use EXATAMENTE o nome do catálogo se houver correspondência clara, senão descreva o serviço com clareza
  - "quantidade": número mencionado (ex: "30 metros" → 30). Use 1 se não especificado.
  - "unidade": unidade correta (m², m, m³, un, h, vb, kg, pç, sc). Se o catálogo especifica a unidade, use-a.
  - "valor_unitario": APENAS se o cliente mencionou um valor específico. Senão use 0.
  - "observacao": detalhe específico deste item (ex: "cor branco gelo", "piso 45x45cm", "área molhada")
- "observacoes": qualquer informação adicional relevante (urgência, horário, condições especiais)
- "data_prevista": data de início mencionada no formato YYYY-MM-DD. Deixe vazio se não mencionada.

Mensagem do cliente:
"""
${mensagem}
"""

Responda APENAS com JSON válido, sem markdown, sem explicações:
{
  "titulo": "",
  "cliente_nome": "",
  "endereco": "",
  "descricao": "",
  "servicos": [
    {
      "nome": "",
      "quantidade": 1,
      "unidade": "un",
      "valor_unitario": 0,
      "observacao": ""
    }
  ],
  "observacoes": "",
  "data_prevista": ""
}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Claude API error: ${err}`);
    }

    const aiData = await response.json();
    const rawText = aiData.content?.[0]?.text ?? "{}";

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      // Tenta extrair JSON de dentro de bloco de código caso Claude tenha ignorado a instrução
      const match = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
      parsed = match ? JSON.parse(match[1]) : {};
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("parse-whatsapp error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
