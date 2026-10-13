import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  Building2, 
  Plus, 
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { SCurveChart } from './SCurveChart';
import { PredictiveAnalysisPanel } from './PredictiveAnalysisPanel';

interface FinancialReportsViewProps {
  onOpenNewTransaction: () => void;
  onOpenPrintModal: () => void;
}

export const FinancialReportsView: React.FC<FinancialReportsViewProps> = ({
  onOpenNewTransaction,
  onOpenPrintModal,
}) => {
  const { activeProject, getProjectFinancialReport, financialRecords } = useCRM();
  const [activeReportTab, setActiveReportTab] = useState<'overview' | 'scurve' | 'predictive'>('overview');

  const report = activeProject ? getProjectFinancialReport(activeProject.id) : null;

  const handleExportCSV = () => {
    if (!activeProject) return;
    const projectRecords = financialRecords.filter(r => r.projectId === activeProject.id);

    const headers = ['ID', 'Data', 'Tipo', 'Categoria', 'Descricao', 'Valor (R$)', 'Status'];
    const rows = projectRecords.map(r => [
      r.id,
      r.date,
      r.type === 'income' ? 'Receita / Medição' : 'Despesa / Custo',
      r.category,
      `"${r.description.replace(/"/g, '""')}"`,
      r.amount.toFixed(2),
      r.paymentStatus === 'paid' ? 'Pago / Faturado' : 'Pendente'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
      [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Relatorio_Financeiro_${activeProject.code}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!activeProject || !report) {
    return (
      <div className="p-8 text-center text-slate-500">
        Selecione uma obra para gerar os relatórios financeiros automáticos.
      </div>
    );
  }

  const isOverBudget = report.budgetVariance < 0;

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Top Controls & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">
              Diagnóstico Financeiro Automatizado: {activeProject.name}
            </h2>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase tracking-wider ${
              report.healthStatus === 'healthy'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : report.healthStatus === 'attention'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              Status: {report.healthStatus === 'healthy' ? 'Equilibrado' : report.healthStatus === 'attention' ? 'Atenção' : 'Risco de Sobrecusto'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Apuração automática de Orçado vs. Realizado, liquidez das medições e margem de contribuição da obra.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors shadow-2xs"
            title="Baixar planilha completa em formato CSV/Excel"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={onOpenPrintModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-orange-400" />
            <span>Imprimir / PDF Executivo</span>
          </button>

          <button
            onClick={onOpenNewTransaction}
            className="flex items-center gap-1.5 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Lançamento</span>
          </button>
        </div>
      </div>

      {/* Subtab Bar for Financial Reports */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg w-fit">
        <button
          onClick={() => setActiveReportTab('overview')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
            activeReportTab === 'overview'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Orçado vs. Realizado & Custos</span>
        </button>

        <button
          onClick={() => setActiveReportTab('scurve')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
            activeReportTab === 'scurve'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-blue-600" />
          <span>Curva S Físico-Financeira</span>
        </button>

        <button
          onClick={() => setActiveReportTab('predictive')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
            activeReportTab === 'predictive'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-orange-500" />
          <span>Diagnóstico Preditivo com IA (EVM)</span>
        </button>
      </div>

      {/* View: Curva S */}
      {activeReportTab === 'scurve' && (
        <SCurveChart />
      )}

      {/* View: Preditivo com IA */}
      {activeReportTab === 'predictive' && (
        <PredictiveAnalysisPanel />
      )}

      {/* View: Overview */}
      {activeReportTab === 'overview' && (
        <div className="space-y-6">
          {/* 4 Main Financial KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Orçamento Previsto */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Custo Orçado Total
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
              R$ {report.budgetTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-mono">
            Contrato com cliente: R$ {report.contractValue.toLocaleString('pt-BR')}
          </div>
        </div>

        {/* Card 2: Custo Realizado */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Custo Realizado (Desembolso)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
              R$ {report.spentTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Taxa de Queima:</span>
            <span className="font-mono font-bold text-slate-800">
              {report.percentBudgetSpent.toFixed(1)}% do orçamento
            </span>
          </div>
        </div>

        {/* Card 3: Saldo / Desvio Orçamentário */}
        <div className={`p-4 rounded-xl border shadow-2xs ${
          isOverBudget ? 'bg-red-50/50 border-red-200' : 'bg-emerald-50/50 border-emerald-200'
        }`}>
          <span className={`text-[11px] font-semibold uppercase tracking-wider block ${
            isOverBudget ? 'text-red-700' : 'text-emerald-800'
          }`}>
            {isOverBudget ? 'Sobrecusto / Estouro' : 'Saldo Orçamentário Restante'}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-xl font-bold font-mono tabular-nums ${
              isOverBudget ? 'text-red-700' : 'text-emerald-700'
            }`}>
              R$ {Math.abs(report.budgetVariance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-600">
            {isOverBudget ? 'Gastos superaram o teto da obra' : 'Disponível para etapas futuras'}
          </div>
        </div>

        {/* Card 4: Margem Operacional da Obra */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Margem Bruta Projetada
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
              {report.projectedNetMarginPercent.toFixed(1)}%
            </span>
            <span className="text-xs font-mono text-emerald-700 font-semibold">
              (R$ {report.grossMargin.toLocaleString('pt-BR')})
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-mono">
            Recebido em medições: R$ {report.totalIncome.toLocaleString('pt-BR')}
          </div>
        </div>
      </div>

      {/* Automated Insights & Executive Health Section */}
      <div className="bg-slate-900 text-slate-100 rounded-xl p-5 shadow-xs border border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-orange-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400">
            Diagnóstico Analítico do Engenheiro de Custos
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {report.insights.map((insight, idx) => (
            <div key={idx} className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/60 leading-relaxed text-slate-200">
              {insight}
            </div>
          ))}
          <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/60 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Progresso Físico Ponderado (Cronograma):</span>
            <span className="font-bold text-white text-sm">{report.physicalProgress}%</span>
          </div>
          <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/60 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Desembolso Financeiro Realizado:</span>
            <span className="font-bold text-orange-400 text-sm">{report.percentBudgetSpent.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Detailed Category Breakdown (Orçado vs Realizado) & Monthly Cash Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Orçado vs Realizado por Categoria Construtiva (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Composição de Custos: Orçado vs. Realizado
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Valores agrupados pelos grupos de serviço da construção civil.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {report.categories.map((cat, idx) => {
              const isOver = cat.variance < 0;
              const barWidth = Math.min(100, Math.max(2, cat.percentSpent));

              return (
                <div key={idx} className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{cat.category}</span>
                    <div className="flex items-center gap-3 font-mono tabular-nums text-[11px]">
                      <span className="text-slate-500">
                        Orçado: R$ {cat.budgeted.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="font-bold text-slate-900">
                        Realizado: R$ {cat.spent.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className={`font-semibold ${isOver ? 'text-red-600' : 'text-emerald-600'}`}>
                        {cat.percentSpent.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Progress track */}
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOver 
                          ? 'bg-red-600' 
                          : cat.percentSpent > 80 
                            ? 'bg-amber-500' 
                            : 'bg-orange-600'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Monthly Cash Flow Ledger (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Fluxo de Caixa Mensal
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Entradas (medições) vs. Saídas (pagamentos).
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {report.monthlyCashFlow.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Nenhum fluxo registrado.</p>
            ) : (
              report.monthlyCashFlow.map((cf, idx) => {
                const isPositive = cf.balance >= 0;
                return (
                  <div key={idx} className="p-3 bg-slate-50/70 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold font-mono text-slate-800 block">{cf.month}</span>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 mt-0.5">
                        <span className="text-emerald-700">Entrada: +R$ {cf.income.toLocaleString('pt-BR')}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-red-700">Saída: -R$ {cf.expense.toLocaleString('pt-BR')}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Saldo do Mês</span>
                      <span className={`font-mono font-bold tabular-nums text-xs ${
                        isPositive ? 'text-emerald-700' : 'text-red-700'
                      }`}>
                        {isPositive ? '+' : ''} R$ {cf.balance.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      </div>
      )}
    </div>
  );
};
