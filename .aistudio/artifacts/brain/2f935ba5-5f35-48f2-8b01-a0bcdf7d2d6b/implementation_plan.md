# ObraFlux CRM — Sistema de Gestão para Construção Civil

O **ObraFlux CRM** é uma plataforma integrada de gestão para construtoras e empreiteiras, desenvolvida para unificar o ciclo de vida dos projetos: do relacionamento comercial e cadastro de clientes ao cronograma físico em Gantt, controle de requisições e estoque no canteiro de obras, e geração automatizada de relatórios financeiros de Orçado vs. Realizado.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Decisões confirmadas com o usuário:**
> 1. **Cronograma de Obras:** Visualização prioritária em **Gráfico de Gantt interativo** com etapas de engenharia (fundações, estrutura, alvenaria, instalações, acabamentos), datas de início/fim, marcos críticos e progresso percentual.
> 2. **Fluxo de Materiais:** Controle completo por obra, cobrindo requisição/pedidos de compra, confirmação de recebimento no canteiro, controle de estoque local e consumo em etapas da obra.
> 3. **Relatórios Financeiros:** Automação de cálculo de **Orçado vs. Realizado**, acompanhamento de fluxo de caixa (entradas e saídas por medição) e apuração de margem de lucro operacional por projeto, com opções de exportação (PDF executivo e planilha CSV) e diagnósticos automáticos.

---

## 1. Overview & Core Concept

- **O que a aplicação faz:**
  - **Gestão de Clientes & Obras:** Cadastro de clientes (PF/PJ), propostas, contratos, endereços de obra, engenheiro responsável e status geral do empreendimento.
  - **Cronograma Gantt Interativo:** Visualização temporal detalhada de cada fase da obra, com cálculo automático de dias úteis, linha do tempo interativa com marcação de progresso, marcos de entrega (milestones) e alertas de atraso.
  - **Fluxo de Suprimentos & Materiais:** Catálogo de insumos (cimento, aço CA-50, blocos, fios, revestimentos, etc.), requisição de compras, registro de notas de entrada no canteiro e controle de saldo/estoque por obra com limite mínimo de segurança.
  - **Relatórios Financeiros Automáticos:** Comparativo analítico Orçado vs. Realizado por categoria (Mão de Obra, Materiais, Equipamentos, Terceirizados), curva de fluxo de caixa mensal e cálculo automático de margem de lucro por projeto, com resumos gerenciais exportáveis.
  - **Persistência Local e Dados Pré-carregados:** Banco de dados client-side com dados reais de projetos de construção brasileiros (Edifício Residencial Horizonte, Reforma Comercial Paulista, Condomínio Villa Serena) com suporte total a CRUD e persistência contínua via `localStorage`.

- **Público-alvo:**
  - Engenheiros civis, mestres de obras, gestores de compras e diretores financeiros de construtoras e incorporadoras.

- **Valor Principal:**
  - Elimina planilhas desconexas, previne estouros de orçamento através de monitoramento em tempo real do Realizado vs. Orçado e dá visibilidade clara sobre entregas e abastecimento de materiais.

---

## 2. User Experience & Visual Design

### A. Estrutura de Navegação & Layout
- **Sidebar Utilitária (260px):**
  - Identidade visual da construtora (**ObraFlux** com indicador de versão e obra ativa).
  - Módulos rápidos:
    1. **Visão Geral / Dashboard** (KPIs consolidados de obras ativas, alertas de suprimentos e saúde financeira).
    2. **Obras & Cronograma Gantt** (seletor de obra, gráfico de Gantt interativo, marco de medições).
    3. **Fluxo de Materiais** (pedidos, recebimentos no canteiro, estoque e alerta de reposição).
    4. **Clientes & Contratos** (funil de clientes, contratos ativos, contatos e medições faturadas).
    5. **Relatórios Financeiros** (Orçado vs. Realizado, DRE simplificado da obra, fluxo de caixa e exportação).
- **Top Bar Contract:**
  - Trilha contextual / Breadcrumbs no lado esquerdo (`Obra Residencial Horizonte / Cronograma Gantt`).
  - Lado direito com seletor rápido de projeto ativo e botão de ação primária contextual (`+ Novo Projeto`, `+ Nova Etapa`, `+ Pedido de Material`).

### B. Identidade Visual & Design System
- **Paleta de Cores (Diretriz 60-30-10):**
  - **60% Canvas Neutro:** Fundo ardósia claro de engenharia (`bg-slate-50`), painéis estruturais em branco puro (`bg-white`) com bordas sutis `border-slate-200`.
  - **30% Superfícies & Tipografia:** Texto primário `text-slate-900`, secundário `text-slate-600`, superfícies auxiliares em `slate-100/slate-200`.
  - **10% Acentos Técnicos:** Laranja/Âmbar de segurança e construção civil (`#EA580C` / `bg-orange-600`) para ações primárias, combinado com Azul técnico (`#0284C7`) para marcos de engenharia e Verde esmeralda (`#16A34A`) para indicadores positivos de margem.
- **Tipografia:**
  - Família sem serifa moderna e limpa (`Plus Jakarta Sans` ou `DM Sans`) para títulos e navegação.
  - Alinhamento numérico tabular (`tabular-nums font-mono`) para todas as métricas de moeda (R$), percentuais, datas e volumes de materiais.
- **Zero-Pill Discipline:**
  - Metadados e datas sem formatos de "pílulas decorativas"; uso de tipografia unboxed com separadores sutis (`·`, `/`).

---

## 3. Arquitetura Técnica & Modelo de Dados

### A. Diagrama do Sistema

```
┌────────────────────────────────────────────────────────────────────────┐
│                             OBRAFLUX CRM                               │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   ┌─────────────────────┐   ┌──────────────────────────────────────┐   │
│   │   Sidebar Nav       │   │        Top Bar & Breadcrumbs         │   │
│   │   - Dashboard       │   │   [Obra Ativa]   [Exportar / + Ação] │   │
│   │   - Obras & Gantt   │   └──────────────────────────────────────┘   │
│   │   - Materiais       │                                              │
│   │   - Clientes        │   ┌──────────────────────────────────────┐   │
│   │   - Financeiro      │   │          Main Workspace View         │   │
│   └─────────────────────┘   │                                      │   │
│              │              │  ┌────────────────────────────────┐  │   │
│              ▼              │  │  Active View Component         │  │   │
│   ┌─────────────────────┐   │  │  - GanttChartViewer            │  │   │
│   │ State / LocalStore  │   │  │  - MaterialFlowManager         │  │   │
│   │  • Projects & Tasks │───┼─▶│  - FinancialReportGenerator    │  │   │
│   │  • Material Orders  │   │  │  - ClientContractManager       │  │   │
│   │  • Financial Entries│   │  └────────────────────────────────┘  │   │
│   └─────────────────────┘   └──────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

### B. Entidades de Dados Principais

1. **Project / Obra:**
   - `id`, `name`, `client_id`, `budget_total`, `spent_total`, `start_date`, `expected_end_date`, `status` (`planning`, `in_progress`, `inspection`, `completed`), `address`, `manager`.
2. **GanttTask / Etapa:**
   - `id`, `project_id`, `name`, `category` (ex: Fundações, Estrutura, Instalações, Acabamentos), `start_date`, `end_date`, `progress` (0-100%), `budget`, `actual_cost`, `dependencies` (task_id[]), `is_milestone`.
3. **Material & Inventory / Insumos & Estoque:**
   - `id`, `project_id`, `item_name`, `unit` (m³, kg, un, m², saco), `min_stock`, `current_stock`, `unit_cost`.
4. **MaterialOrder / Pedido de Compra e Entrada:**
   - `id`, `project_id`, `material_id`, `supplier`, `quantity`, `total_price`, `order_date`, `delivery_date`, `status` (`requested`, `in_transit`, `received_at_site`).
5. **Client / Cliente:**
   - `id`, `name`, `document` (CPF/CNPJ), `email`, `phone`, `total_contract_value`, `active_projects_count`.
6. **FinancialRecord / Lançamentos Financeiros:**
   - `id`, `project_id`, `type` (`income` [medições recebidas] / `expense` [materiais, folha, maquinário]), `category`, `amount`, `date`, `description`, `status` (`realized`, `planned`).

---

## 4. Etapas de Implementação

1. **Infraestrutura e Tipos Base:**
   - Definição completa das interfaces TypeScript em `src/types/crm.ts`.
   - Seed de dados realistas e completos em português com 3 obras completas com cronogramas reais, pedidos de cimento/ferro/tijolo e transações financeiras.
   - Sistema de persistência local com reatividade instantânea via `localStorage`.
2. **Componente de Cronograma Gantt Interativo:**
   - Linha do tempo visual em SVG/HTML com barras de duração calculadas com base nas datas.
   - Marcador do dia atual (Hoje), marcos de entrega (losangos/milestones), linhas de dependência e controle de porcentagem de conclusão arrastável/editável.
   - Filtros por etapa construtiva e alternância de escala (dias / semanas / meses).
3. **Módulo de Fluxo de Materiais no Canteiro:**
   - Tabela de estoque por obra com alerta visual de nível crítico.
   - Fluxo de requisição: solicitação $\rightarrow$ transporte $\rightarrow$ botão de confirmação de recebimento no canteiro com incremento automático de estoque.
4. **Módulo de Clientes e Propostas:**
   - Listagem e ficha do cliente com histórico de obras contratadas e pagamentos de medições.
   - Modal para cadastrar novo cliente e vincular nova obra.
5. **Relatórios Financeiros Automáticos:**
   - Painel analítico de Orçado vs. Realizado com variação percentual (Delta) e indicador de estouro ou economia.
   - Gráfico de fluxo de caixa mensal (Receitas de Medições vs. Desembolsos de Obra).
   - Cálculo automático de Margem Bruta e Líquida por projeto.
   - Modal de Relatório Executivo pronto para impressão / exportação em PDF e botão de download em CSV/Excel.
6. **Validação & Refinamento:**
   - Verificação com `compile_applet` e ajustes para garantir zero erros TypeScript e conformidade com o guia de design.
