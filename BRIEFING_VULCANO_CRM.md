# Briefing — Adaptação do crm-lovable-pp para Vulcano CRM

## Contexto

Este projeto é o CRM da **Vulcano Serralheria Metálica**, adaptado a partir do `crm-lovable-pp` (CRM de reformas em condomínios). A base de código já está clonada e funcionando. O objetivo é adaptar o domínio de **construção civil/condomínios** para **serralheria metálica industrial e residencial**, preservando toda a infraestrutura técnica (Supabase, React, TanStack Query, shadcn/ui).

**Identidade visual:** preto, creme e laranja (`#F97316` como cor primária).
**Repositório base:** https://github.com/Zarastruta/crm-lovable-pp

---

## FASE 1 — Tipos e constantes (`src/types/index.ts`)

### 1.1 Pipeline de produção
Substituir `StatusObra` de 4 etapas por 9 etapas específicas de metalurgia:

```ts
// REMOVER:
export type StatusObra = "aguardando" | "em_andamento" | "concluido" | "cancelado";

// ADICIONAR:
export const OS_STATUSES = [
  "Novo", "Medição", "Projeto", "Compras",
  "Fabricação", "Galvanização", "Pintura", "Instalação", "Finalizado"
] as const;
export type StatusObra = typeof OS_STATUSES[number];
```

### 1.2 Tipos de contato
```ts
// SUBSTITUIR:
export type TipoContato = "sindico" | "pessoa_fisica" | "empresa" | "administradora";

// POR:
export type TipoContato = "pessoa_fisica" | "empresa" | "construtora" | "engenheiro" | "arquiteto" | "sindico" | "administradora";
```

### 1.3 Tipo de serviço
```ts
// SUBSTITUIR:
export type TipoServico = "preventivo" | "corretivo" | "emergencial";

// POR:
export type TipoServico = "fabricacao" | "instalacao" | "manutencao" | "reforma" | "emergencial";
```

### 1.4 Custos no CatalogoServico
Substituir `custo_extras` por três campos separados:
```ts
custo_galvanizacao: number;
custo_pintura: number;
custo_corte_dobra: number;
// MANTER:
custo_material: number;
custo_mao_obra: number;
custo_deslocamento: number;
```

### 1.5 Renomear `Condominio` para `Local`
```ts
// RENOMEAR interface Condominio → Local
// Remover campos: cnpj, sindicoId, administradoraId
// Manter: id, nome, endereco, observacoes, criadoEm
// Adicionar: tipo_local: "residencial" | "comercial" | "industrial" | "obra"
```

### 1.6 Adicionar campos na interface `Trabalho` (OS)
```ts
codigo: string;           // ex: "OS-2026-001"
prioridade: "Baixa" | "Média" | "Alta" | "Crítica";
prazo: string | null;
responsavel_id: string | null;
status_pagamento_detalhado: "pendente" | "parcial" | "pago";
valor_pago: number;
compras_pendentes: boolean;
```

---

## FASE 2 — Catálogo de Serviços (`src/pages/CatalogoServicos.tsx`)

### 2.1 Substituir categorias

```ts
const CATEGORIAS = {
  "Estruturas Metálicas": {
    subs: ["Mezanino", "Galpão", "Cobertura", "Passarela", "Plataforma", "Escada Industrial", "Geral"],
    unidade: "kg", icone: "🏗️"
  },
  "Portões e Cancelas": {
    subs: ["Portão Deslizante", "Portão Basculante", "Portão Pivotante", "Cancela", "Automação", "Geral"],
    unidade: "un", icone: "🚪"
  },
  "Escadas e Corrimãos": {
    subs: ["Escada Reta", "Escada Caracol", "Corrimão Externo", "Corrimão Interno", "Guarda-corpo", "Geral"],
    unidade: "m", icone: "🪜"
  },
  "Grades e Proteções": {
    subs: ["Grade de Janela", "Grade de Porta", "Alambrado", "Tela Soldada", "Proteção Antifurto", "Geral"],
    unidade: "m²", icone: "🔒"
  },
  "Coberturas Metálicas": {
    subs: ["Telhado Simples", "Telhado com Calha", "Marquise", "Pergolado", "Toldo Metálico", "Geral"],
    unidade: "m²", icone: "🏠"
  },
  "Serralheria Fina": {
    subs: ["Janela de Ferro", "Basculante", "Treliça Decorativa", "Gradil Ornamental", "Letreiro Metálico", "Geral"],
    unidade: "un", icone: "✨"
  },
  "Manutenção": {
    subs: ["Soldagem", "Pintura Anticorrosiva", "Substituição de Peças", "Regulagem", "Revisão Geral"],
    unidade: "serv", icone: "🔧"
  },
};
```

### 2.2 Substituir unidades

```ts
const UNIDADES = ["un", "m²", "m", "kg", "barra", "ml", "conj", "vb", "serv", "h", "pç"];
```

### 2.3 Atualizar tipos de serviço no formulário

```ts
const TIPOS_SERVICO = [
  { value: "fabricacao",  label: "Fabricação" },
  { value: "instalacao",  label: "Instalação" },
  { value: "manutencao",  label: "Manutenção" },
  { value: "reforma",     label: "Reforma" },
  { value: "emergencial", label: "Emergencial" },
];
```

### 2.4 Atualizar campos de custo no formulário (Tab "Custo")
Substituir `custo_extras` por três campos:
- `custo_galvanizacao` — Galvanização (R$)
- `custo_pintura` — Pintura / Jateamento (R$)
- `custo_corte_dobra` — Corte e Dobra (R$)

Custo total:
```ts
const custoTotal = custo_material + custo_mao_obra + custo_deslocamento + custo_galvanizacao + custo_pintura + custo_corte_dobra;
```

---

## FASE 3 — Kanban (`src/components/shared/KanbanBoard.tsx`)

### 3.1 Substituir as 4 colunas pelas 9 etapas

```ts
import { OS_STATUSES, StatusObra } from "@/types";

const COLUNAS: { key: StatusObra; cor: string }[] = [
  { key: "Novo",          cor: "border-t-zinc-400" },
  { key: "Medição",       cor: "border-t-sky-400" },
  { key: "Projeto",       cor: "border-t-violet-400" },
  { key: "Compras",       cor: "border-t-yellow-400" },
  { key: "Fabricação",    cor: "border-t-orange-500" },
  { key: "Galvanização",  cor: "border-t-slate-400" },
  { key: "Pintura",       cor: "border-t-fuchsia-400" },
  { key: "Instalação",    cor: "border-t-blue-400" },
  { key: "Finalizado",    cor: "border-t-emerald-400" },
];
```

### 3.2 Chips de prioridade nos cards
- Crítica → vermelho
- Alta → laranja
- Média → amarelo
- Baixa → cinza

### 3.3 Alertas de prazo
- Prazo vencido → borda vermelha + ícone de alerta
- Prazo em até 3 dias → texto laranja

---

## FASE 4 — Módulo "Locais" (era Condominios)

### 4.1 Renomear tudo de Condominio → Local
- `src/pages/Condominios.tsx` → `src/pages/Locais.tsx`
- `src/pages/CondominioDetalhe.tsx` → `src/pages/LocalDetalhe.tsx`
- Rota `/condominios` → `/locais`
- Contexto: `condominios`, `addCondominio` → `locais`, `addLocal`
- Tabela Supabase: `condominios` → `locais`

### 4.2 Simplificar formulário
Remover: `cnpj`, `sindicoId`, `administradoraId`

Adicionar:
- `tipo_local`: select com Residencial / Comercial / Industrial / Obra

---

## FASE 5 — Orçamentos

### 5.1 Adicionar seção "Custos Adicionais"
No formulário de orçamento, após os itens:
- Mão de obra (R$)
- Galvanização (R$)
- Pintura / Jateamento (R$)
- Transporte / Instalação (R$)
- Outros (R$)
- Margem de lucro (%)

Cálculo automático do valor final:
```
subtotal = soma_itens + custos_adicionais
valor_final = subtotal / (1 - margem/100)
```

---

## FASE 6 — Multi-tenant (isolamento por usuário)

### 6.1 SQL — adicionar user_id em todas as tabelas

Executar no Supabase SQL Editor:

```sql
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE condominios ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE trabalhos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE orcamentos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE orcamento_itens ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE funcionarios ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE ferramentas ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE catalogo_servicos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE ponto_diario ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
```

### 6.2 SQL — atualizar políticas RLS

```sql
-- Repetir para cada tabela (exemplo com clientes):
DROP POLICY IF EXISTS "Autenticados podem tudo em clientes" ON clientes;
CREATE POLICY "usuarios_isolados_clientes" ON clientes
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

### 6.3 AppContext — injetar user_id automaticamente

Em `handleAdd`:
```ts
const enrichedPayload = { ...payload, user_id: user!.id };
```

Em cada `fetchXxx`, adicionar filtro:
```ts
.eq("user_id", user.id)
```

---

## FASE 7 — Código OS automático

### 7.1 Função no Supabase

```sql
CREATE OR REPLACE FUNCTION next_os_code(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_year TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
  v_seq  INT;
BEGIN
  SELECT COUNT(*) + 1 INTO v_seq
  FROM trabalhos
  WHERE user_id = p_user_id
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  RETURN 'OS-' || v_year || '-' || LPAD(v_seq::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;
```

### 7.2 Usar na criação de OS

```ts
const { data: codeData } = await supabase.rpc('next_os_code', { p_user_id: user.id });
const codigo = codeData ?? `OS-${Date.now()}`;
```

---

## FASE 8 — Textos e nomenclatura (find & replace global)

| Encontrar | Substituir |
|-----------|-----------|
| `Trabalhos` (UI) | `Ordens de Serviço` |
| `Trabalho` (singular UI) | `Ordem de Serviço` |
| `trabalho` (rotas/links) | `os` |
| `Condominios` / `Condomínios` | `Locais` |
| `condominio` (rotas) | `locais` |
| `PratesPaiva` | `Vulcano` |
| `biz-tasks-mate` | `vulcano-crm` |
| `Painel de Gestão` | `Dashboard — Vulcano CRM` |

---

## FASE 9 — Visual

No `tailwind.config.ts`, cor primária laranja:
```ts
primary: {
  DEFAULT: "#F97316",
  foreground: "#ffffff",
},
```

---

## FASE 10 — Dashboard (`src/pages/Dashboard.tsx`)

Atualizar KPIs:

| Atual | Vulcano |
|-------|---------|
| Obras Ativas | OS Ativas |
| A Receber | A Receber |
| Faturamento | Faturado (pago) |
| Orçamentos | Em Negociação |
| — | OS Atrasadas *(novo)* |
| — | Compras Pendentes *(novo)* |

Adicionar seção "OS Atrasadas" com destaque vermelho para OS com prazo vencido.

---

## Ordem de execução recomendada

1. Fase 1 — Tipos (base de tudo)
2. Fase 6 — Multi-tenant (SQL + RLS + AppContext)
3. Fase 4 — Locais (renomear Condominios)
4. Fase 3 — Kanban 9 etapas
5. Fase 2 — Catálogo de Serviços de metalurgia
6. Fase 5 — Orçamentos com custos de metalurgia
7. Fase 7 — Código OS automático
8. Fase 8 — Textos / find & replace
9. Fase 9 — Visual (cor laranja)
10. Fase 10 — Dashboard

---

## Arquivos que NÃO precisam de mudança significativa

- `src/pages/Financeiro.tsx` — funciona perfeitamente, só renomear "Trabalho" → "OS"
- `src/pages/Equipe.tsx` — sem mudanças
- `src/pages/Ferramentas.tsx` — sem mudanças
- `src/pages/ControleDiario.tsx` — sem mudanças
- `src/components/modals/WhatsAppParserModal.tsx` — manter intacto (feature valiosa)
- `src/lib/`, `src/components/ui/` — sem mudanças

---

## Notas

- O banco Supabase atual tem RLS para qualquer autenticado. Executar Fase 6 antes de abrir para múltiplos usuários.
- O `AppContext.tsx` carrega tudo no login — funciona bem para volume pequeno/médio de OS.
- O parser de WhatsApp usa heurísticas de texto — testar com mensagens reais de clientes da Vulcano após a adaptação.
