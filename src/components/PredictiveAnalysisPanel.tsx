import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  DollarSign, 
  RefreshCw,
  Layers,
  ShieldAlert
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { PredictiveAnalysis } from '../types/crm';

export const PredictiveAnalysisPanel: React.FC = () => {
  const { activeProject, getPredictiveAnalysis } = useCRM();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PredictiveAnalysis | null>(() => {
    return activeProject ? getPredictiveAnalysis(activeProject.id) : null;
  });

  if (!activeProject) return null;

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const result = getPredictiveAnalysis(activeProject.id);
      setAnalysis(result);
      setIsAnalyzing(false);
    }, 600);
  };

  const currentAnalysis = analysis || getPredictiveAnalysis(activeProject.id);

  const isCritical = currentAnalysis.riskLevel === 'critico';
  const isModerate = currentAnalysis.riskLevel === 'moderado';

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl p-6 shadow-sm border border-slate-800 space-y-6">
      {/* Title & Refresh Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Assistente Preditivo de Custos & Prazos (EVM + IA)
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${
                isCritical 
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : isModerate
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                Risco: {currentAnalysis.riskLevel}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Projeção preditiva baseada nos índices de desempenho CPI e SPI aferidos no canteiro.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunAnalysis}
          disabled={isAnalyzing}
          className="flex items-center gap-1.5 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs shrink-0 self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAnalyzing ? 'Processando Modelagem...' : 'Atualizar Diagnóstico com IA'}</span>
        </button>
      </div>

      {/* 4 Main Predictive Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* CPI */}
        <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/70">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            CPI (Índice de Custos)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-xl font-bold font-mono ${
              currentAnalysis.cpi >= 1.0 ? 'text-emerald-400' : 'text-orange-400'
            }`}>
              {currentAnalysis.cpi.toFixed(2)}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {currentAnalysis.cpi >= 1.0 ? 'Obra operando abaixo do orçamento' : 'Custo real acima do valor agregado'}
          </span>
        </div>

        {/* SPI */}
        <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/70">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            SPI (Índice de Cronograma)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-xl font-bold font-mono ${
              currentAnalysis.spi >= 1.0 ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {currentAnalysis.spi.toFixed(2)}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {currentAnalysis.spi >= 1.0 ? 'Ritmo compatível ou adiantado' : 'Velocidade de avanço reduzida'}
          </span>
        </div>

        {/* EAC */}
        <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/70">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Custo Estimado no Término (EAC)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-white">
              R$ {currentAnalysis.eac.toLocaleString('pt-BR')}
            </span>
          </div>
          <span className={`text-[10px] font-mono mt-1 block ${
            currentAnalysis.vac < 0 ? 'text-red-400' : 'text-emerald-400'
          }`}>
            Variação: {currentAnalysis.vac < 0 ? 'Estouro de R$' : 'Economia de R$'} {Math.abs(currentAnalysis.vac).toLocaleString('pt-BR')}
          </span>
        </div>

        {/* Projected Completion Date */}
        <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/70">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Término Projetado
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-orange-400">
              {currentAnalysis.projectedCompletionDate}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block font-mono">
            {currentAnalysis.projectedDelayDays > 0 
              ? `+${currentAnalysis.projectedDelayDays} dias de atraso projetado`
              : 'Entrega dentro da meta contratual'}
          </span>
        </div>
      </div>

      {/* Summary Narrative */}
      <div className="bg-slate-800/60 p-4 rounded-lg border border-slate-700 text-xs space-y-2">
        <span className="font-semibold text-orange-400 uppercase text-[10px] tracking-wider block">
          Parecer Técnico Executivo
        </span>
        <p className="text-slate-200 leading-relaxed font-mono">
          {currentAnalysis.executiveSummary}
        </p>
      </div>

      {/* Actionable Engineering Recommendations */}
      <div className="space-y-2">
        <span className="font-semibold text-slate-300 uppercase text-[10px] tracking-wider block">
          Recomendações Técnicas para o Engenheiro Residente
        </span>

        <div className="space-y-2 text-xs">
          {currentAnalysis.recommendations.map((rec, idx) => (
            <div key={idx} className="bg-slate-800/90 p-3 rounded-lg border border-slate-700/80 flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0 mt-1.5" />
              <p className="text-slate-300 leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
