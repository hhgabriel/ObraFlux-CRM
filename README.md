# ObraFlux CRM — Sistema de Gestão & CRM para Construção Civil

> **Plataforma integrada e dinâmica de engenharia para gestão de cronograma físico em Gantt, fluxo de materiais e canteiro, Curva S físico-financeira, Diário de Obra (RDO), medição de empreiteiros, carteira de clientes e relatórios financeiros automáticos.**

---

## 📌 Descrição Rápida (para o campo "About" do GitHub)
> **CRM e ERP operacional para construção civil com Cronograma Gantt interativo, Curva S físico-financeira, RDO digital, controle de suprimentos/estoque de canteiro, medição de empreiteiros e relatórios automatizados (Web, Tablet & Mobile).**

**Tópicos / Tags recomendadas para o repositório:**
`construction-management` · `civil-engineering` · `crm` · `gantt-chart` · `react` · `typescript` · `tailwind-css` · `s-curve` · `gestao-de-obras` · `diario-de-obra-rdo` · `engenharia-civil`

---

## 🚀 Funcionalidades Principais

### 1. 🏗️ Cronograma de Obras & Gráfico de Gantt Interativo
* **Visão Panorâmica & Linha do Tempo:** Escala contínua de meses, barras com percentual de avanço físico, custos orçados e marcos de medição (*milestones*).
* **Modo Dinâmico para Celulares & Tablets:** Alternador instantâneo entre **Gráfico Gantt Panorâmico** e **Cartões de Campo Mobile** com botões de medição rápida (`-10%`, `+10%`, `100% Concluir`).
* **Indicador Temporal:** Marcador visual em tempo real do dia atual ("Hoje") com alerta de etapas em atraso.
* **Importação & Exportação:** Importe cronogramas a partir de planilhas CSV/Excel e exporte o planejamento completo com um clique.

### 2. 📈 Curva S Físico-Financeira & Análise Preditiva
* **Curva S Oficial:** Plotagem mês a mês do **Previsto Acumulado vs. Realizado Acumulado**, calculando desvios de prazo e custo.
* **Diagnóstico Preditivo de Conclusão:** Projeção inteligente de custo final estimado na conclusão (EAC) e previsão de entrega com base no ritmo real da equipe de campo.

### 3. 📋 Diário de Obra Digital (RDO — Relatório Diário de Obra)
* **Registro de Condições Climáticas:** Manhã e tarde (ensolarado, nublado, chuva fraca, chuva forte, impraticável) e praticabilidade do canteiro.
* **Efetivo de Mão de Obra:** Contagem diária de pedreiros, serventes, armadores, carpinteiros, eletricistas, encarregados e engenheiros.
* **Segurança do Trabalho & Ocorrências:** Registro de reuniões diárias (DDS), checagem de EPIs, interferências e visitas fiscais.
* **Emissão com Formatação Oficial:** Visualização limpa para assinatura do engenheiro responsável (CREA) e fiscalização.

### 4. 📦 Fluxo de Suprimentos, Cotações (RFQ) & Estoque por Canteiro
* **Catálogo de Insumos da Construção:** Controle de cimento, aço CA-50, areia, brita, blocos estruturais e tintas com estoque mínimo e estoque atual.
* **Alerta Inteligente de Desabastecimento:** Avisos automáticos na interface quando qualquer material atinge nível crítico.
* **Recebimento com 1 Clique:** Entrada direta no canteiro ao receber pedidos, atualizando o estoque e gerando a despesa financeira da obra.
* **Mapa de Cotações com Fornecedores (RFQ):** Comparativo de propostas comerciais de múltiplos distribuidores de materiais de construção.

### 5. 📐 Boletim de Medição de Empreiteiros & Terceirizados
* **Controle de Serviços Terceirizados:** Alvenaria, contrapiso, pintura, impermeabilização e instalações.
* **Cálculo de Retenções Fiscais:** Apuração automática de retenções (INSS, ISS) sobre o valor bruto medido.
* **Fluxo de Aprovação em Campo:** Engenheiro aprova medições no canteiro e o valor líquido é imediatamente integrado ao contas a pagar da obra.

### 6. 👥 Gestão de Clientes, Contratos e Propostas Comerciais
* **Dossiê do Cliente:** Cadastro de incorporadoras, fundos imobiliários, condomínios e clientes finais com CPF/CNPJ e contatos diretos.
* **Controle de Saldo Contratual:** Comparativo de Valor Contratado vs. Valor Já Faturado vs. Saldo Remanescente a Medir.
* **Multiprojetos Vinculados:** Histórico de empreendimentos ativos e concluídos por cliente.

### 7. 📊 Relatórios Financeiros Automáticos & Exportação
* **Orçado vs. Realizado:** Apuração de desvios orçamentários por categoria de despesa (materiais, mão de obra própria, empreiteiros, locação de equipamentos, etc.).
* **Fluxo de Caixa Mensal:** Demonstrativo de entradas (medições pagas pelo cliente) contra saídas operacionais.
* **Exportação para Planilha CSV:** Download completo de lançamentos e extratos para conciliação bancária.
* **Relatório Executivo Impresso / PDF:** Formato diagramado para impressão executiva com dados de ART/CREA, resumo orçamentário e termos de responsabilidade técnica.

### 8. 📱 Experiência Dinâmica & Responsiva (Mobile, Tablet e Desktop)
* **Mobile-First no Canteiro:** Barra inferior (*Bottom Navigation Bar*) para acesso imediato aos módulos com uma só mão.
* **Drawer Lateral Deslizante:** Menu retrátil para telas touch com seletor rápido de obras ativas.
* **Layout Fluido:** Gráficos, tabelas e formulários adaptados para smartphones modernos, tablets (iPad/Android) e monitores ultrawide.

---

## 🛠️ Tecnologias Utilizadas

* **Framework Principal:** [React 19](https://react.dev/) com [TypeScript](https://www.typescriptlang.org/)
* **Build Tool:** [Vite 8](https://vitejs.dev/)
* **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/)
* **Ícones:** [Lucide React](https://lucide.dev/)
* **Animações e Transições:** [Motion](https://motion.dev/)
* **Persistência de Dados:** LocalStorage resiliente com pré-carregamento de dados de obras de referência (Curitiba, São Paulo e Campinas).

---

## 💻 Como Executar o Projeto Localmente

### Pré-requisitos
* Node.js (versão 18 ou superior)
* Gerenciador de pacotes `npm` ou `pnpm`

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/SEU_USUARIO/obraflux-crm.git

# 2. Acesse a pasta do projeto
cd obraflux-crm

# 3. Instale as dependências
npm install

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

Abra seu navegador em `http://localhost:3000` (ou a porta informada pelo Vite).

---

## 📁 Estrutura de Pastas

```text
├── index.html                  # Ponto de entrada HTML com meta tags e fontes
├── package.json                # Dependências e scripts
├── src/
│   ├── App.tsx                 # Layout principal, controle de abas e modais
│   ├── main.tsx                # Inicialização React
│   ├── index.css               # Configurações do Tailwind CSS e tipografia
│   ├── components/             # Componentes e telas modulares
│   │   ├── BottomNav.tsx       # Navegação rápida para celulares e tablets
│   │   ├── Sidebar.tsx         # Barra lateral e seletor de obras (drawer móvel)
│   │   ├── Header.tsx          # Top bar com 3 zonas e botão de menu mobile
│   │   ├── DashboardView.tsx   # Painel executivo e indicadores de canteiro
│   │   ├── GanttView.tsx       # Cronograma Gantt e modo de cartões de campo
│   │   ├── SCurveChart.tsx     # Curva S físico-financeira acumulada
│   │   ├── PredictiveAnalysisPanel.tsx # Previsão preditiva de custo e prazo
│   │   ├── RDOView.tsx         # Diário de Obra Digital completo
│   │   ├── MaterialsView.tsx   # Estoque, fluxo de insumos e cotações RFQ
│   │   ├── RFQQuotesView.tsx   # Mapa comparativo de cotações com fornecedores
│   │   ├── ContractorMeasurementsView.tsx # Boletins de medição de terceiros
│   │   ├── ClientsView.tsx     # CRM de clientes, propostas e contratos
│   │   ├── FinancialReportsView.tsx # Relatórios Orçado vs Realizado & Fluxo de Caixa
│   │   └── PrintReportModal.tsx # Emissão do Relatório Técnico Oficial para PDF
│   ├── context/
│   │   └── CRMContext.tsx      # Gerenciamento de estado global e regras de negócio
│   ├── data/
│   │   └── initialData.ts      # Dados estruturados de obras da construção civil
│   └── types/
│       └── crm.ts              # Modelos e tipagens TypeScript completas
```

---

## 📄 Licença
Distribuído sob a licença **Apache-2.0**. Consulte o arquivo de licença para mais detalhes.
