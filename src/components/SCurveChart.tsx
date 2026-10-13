import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Info, 
  Calendar, 
  Activity, 
  HelpCircle,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { SCurvePoint } from '../types/crm';

export const SCurveChart: React.FC = () => {
  const { activeProject, getSCurveData, getPredictiveAnalysis } = useCRM();
  const [hoveredPoint, setHoveredPoint] = useState<SCurvePoint | null>(null);

  if (!activeProject) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs">
        Selecione uma obra para visualizar a Curva S.
      </div>
    );
  }

  const curveData = getSCurveData(activeProject.id);
  const predictive = getPredictiveAnalysis(activeProject.id);

  if (curveData.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs">
        Dados insuficientes de datas para gerar a Curva S da obra.
      </div>
    );
  }

  // SVG Chart Dimensions
  const width = 800;
  const height = 320;
  const paddingLeft = 50;
  const paddingRight = 40;
  const paddingTop = 30;
  const paddingBottom = 45;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const numPoints = curveData.length;
  const getX = (index: number) => paddingLeft + (index / (numPoints - 1)) * chartWidth;
  const getY = (percent: number) => paddingTop + (1 - percent / 100) * chartHeight;

  // Build SVG Path strings
  const plannedPath = curveData
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(p.plannedCumulativePercent)}`)
    .join(' ');

  const actualPoints = curveData.filter(p => p.actualCumulativePercent !== null);
  const actualPath = actualPoints
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(p.actualCumulativePercent!)}`)
    .join(' ');

  // Projected line starting from last actual point
  const lastActualIdx = actualPoints.length - 1;
  const projectedPoints = curveData.slice(lastActualIdx);
  const projectedPath = projectedPoints
    .map((p, idx) => {
      const realIdx = lastActualIdx + idx;
      const pct = p.projectedCumulativePercent ?? p.actualCumulativePercent ?? 0;
      return `${idx === 0 ? 'M' : 'L'} ${getX(realIdx)} ${getY(pct)}`;
    })
    .join(' ');

  const currentMonthPoint = actualPoints[actualPoints.length - 1] || curveData[0];
  const physicalDeviation = (currentMonthPoint.actualCumulativePercent ?? 0) - currentMonthPoint.plannedCumulativePercent;
  const isAhead = physicalDeviation >= 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-xs">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Curva S Físico-Financeira Acumulada
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              Padrão PMI / EVM
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Comparativo da linha de base planejada (Baseline) contra a curva real de avanço e custos realizados da obra.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-600 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 bg-blue-600 rounded-full inline-block" />
            <span>Planejado (Baseline)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1.5 bg-orange-600 rounded-full inline-block" />
            <span>Realizado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 border-t-2 border-dashed border-slate-400 inline-block" />
            <span>Projeção Futura</span>
          </div>
        </div>
      </div>

      {/* EVM Indicator Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase block">
            SPI (Índice de Prazo)
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className={`text-base font-bold font-mono ${
              predictive.spi >= 1.0 ? 'text-emerald-700' : predictive.spi >= 0.9 ? 'text-amber-700' : 'text-red-700'
            }`}>
              {predictive.spi.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {predictive.spi >= 1.0 ? 'No prazo' : 'Atraso de ritmo'}
            </span>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase block">
            CPI (Índice de Custos)
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className={`text-base font-bold font-mono ${
              predictive.cpi >= 1.0 ? 'text-emerald-700' : predictive.cpi >= 0.9 ? 'text-amber-700' : 'text-red-700'
            }`}>
              {predictive.cpi.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {predictive.cpi >= 1.0 ? 'Econômico' : 'Sobrecusto'}
            </span>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase block">
            Desvio Físico Atual
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className={`text-base font-bold font-mono ${
              isAhead ? 'text-emerald-700' : 'text-amber-700'
            }`}>
              {isAhead ? '+' : ''}{physicalDeviation}%
            </span>
            <span className="text-[10px] text-slate-500">
              vs. previsto p/ o mês
            </span>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase block">
            Custo Previsto no Término (EAC)
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-base font-bold font-mono text-slate-900">
              R$ {(predictive.eac / 1000000).toFixed(2)}M
            </span>
          </div>
        </div>
      </div>

      {/* SVG Interactive S-Curve Chart Container */}
      <div className="relative overflow-x-auto">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-auto min-w-[650px] overflow-visible"
        >
          {/* Horizontal Grid lines & Y-axis labels */}
          {[0, 25, 50, 75, 100].map((pct) => {
            const y = getY(pct);
            return (
              <g key={pct}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                  strokeDasharray={pct === 0 || pct === 100 ? '0' : '4 4'}
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-mono"
                >
                  {pct}%
                </text>
              </g>
            );
          })}

          {/* X-axis Month Labels */}
          {curveData.map((p, idx) => {
            const x = getX(idx);
            return (
              <g key={p.month}>
                <line
                  x1={x}
                  y1={height - paddingBottom}
                  x2={x}
                  y2={height - paddingBottom + 5}
                  stroke="#CBD5E1"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={height - paddingBottom + 18}
                  textAnchor="middle"
                  className="text-[9px] fill-slate-500 font-mono font-medium"
                >
                  {p.monthLabel}
                </text>
              </g>
            );
          })}

          {/* Planned Curve (Blue Line) */}
          <path
            d={plannedPath}
            fill="none"
            stroke="#2563EB"
            strokeWidth="3"
            strokeLinecap="round"
            className="transition-all duration-300"
          />

          {/* Projected Curve (Dashed Gray) */}
          {projectedPoints.length > 1 && (
            <path
              d={projectedPath}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="2.5"
              strokeDasharray="5 5"
              strokeLinecap="round"
            />
          )}

          {/* Actual Curve (Orange Line) */}
          {actualPoints.length > 0 && (
            <path
              d={actualPath}
              fill="none"
              stroke="#EA580C"
              strokeWidth="3.5"
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          )}

          {/* Data Points on Curves */}
          {curveData.map((p, idx) => {
            const x = getX(idx);
            const plannedY = getY(p.plannedCumulativePercent);
            const isActual = p.actualCumulativePercent !== null;
            const actualY = isActual ? getY(p.actualCumulativePercent!) : null;

            return (
              <g key={idx} className="cursor-pointer group">
                {/* Planned point dot */}
                <circle
                  cx={x}
                  cy={plannedY}
                  r="3.5"
                  fill="#FFFFFF"
                  stroke="#2563EB"
                  strokeWidth="2"
                  onMouseEnter={() => setHoveredPoint(p)}
                />

                {/* Actual point dot */}
                {isActual && actualY !== null && (
                  <circle
                    cx={x}
                    cy={actualY}
                    r="4.5"
                    fill="#EA580C"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    onMouseEnter={() => setHoveredPoint(p)}
                    className="hover:scale-125 transition-transform"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Card */}
        {hoveredPoint && (
          <div className="absolute top-2 right-4 bg-slate-900 text-white p-3 rounded-lg shadow-lg border border-slate-700 text-xs font-mono space-y-1 pointer-events-none z-10 animate-fade-in">
            <div className="font-bold text-orange-400 border-b border-slate-700 pb-1">
              {hoveredPoint.monthLabel} ({hoveredPoint.month})
            </div>
            <div className="text-blue-300">
              Planejado: {hoveredPoint.plannedCumulativePercent}% (R$ {hoveredPoint.plannedCumulativeAmount.toLocaleString('pt-BR')})
            </div>
            {hoveredPoint.actualCumulativePercent !== null ? (
              <div className="text-orange-300 font-bold">
                Realizado: {hoveredPoint.actualCumulativePercent}% (R$ {(hoveredPoint.actualCumulativeAmount ?? 0).toLocaleString('pt-BR')})
              </div>
            ) : (
              <div className="text-slate-400 italic">
                Projeção: {hoveredPoint.projectedCumulativePercent}%
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          Passe o mouse sobre os pontos para ver o desembolso acumulado em cada mês.
        </span>
        <span className="font-mono text-[11px] text-slate-500">
          Orçamento Base: R$ {activeProject.budgetTotal.toLocaleString('pt-BR')}
        </span>
      </div>
    </div>
  );
};
