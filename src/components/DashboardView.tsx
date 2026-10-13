import React from 'react';
import { 
  Building2, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Package, 
  HardHat, 
  ArrowRight,
  Truck,
  Plus
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { ActiveTab } from './Sidebar';

interface DashboardViewProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenNewProject: () => void;
  onOpenNewTask: () => void;
  onOpenNewOrder: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onOpenNewProject,
  onOpenNewTask,
  onOpenNewOrder,
}) => {
  const { 
    projects, 
    activeProject, 
    ganttTasks, 
    materials, 
    orders, 
    getProjectFinancialReport,
    setActiveProjectId
  } = useCRM();

  const report = activeProject ? getProjectFinancialReport(activeProject.id) : null;

  // Active project low stock items
  const lowStock = materials.filter(
    m => m.projectId === activeProject?.id && m.currentStock <= m.minStock
  );

  // Active project upcoming milestones
  const upcomingMilestones = ganttTasks
    .filter(t => t.projectId === activeProject?.id && t.isMilestone && t.progress < 100)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  // Orders in transit
  const inTransitOrders = orders.filter(
    o => o.projectId === activeProject?.id && o.status !== 'received_at_site'
  );

  return (
    <div className="p-6 space-y-6">
      {/* Welcome & Active Project Headline Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-mono text-orange-400">
            <span>OBRA ATIVA: {activeProject?.code}</span>
            <span aria-hidden="true">·</span>
            <span>{activeProject?.city} - {activeProject?.state}</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            {activeProject?.name || 'Painel de Controle da Construtora'}
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            {activeProject?.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 font-mono">
            <span>Eng. Responsável: {activeProject?.engineerName}</span>
            <span aria-hidden="true">·</span>
            <span>ART: {activeProject?.artNumber}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
          <button
            onClick={() => onNavigateTab('gantt')}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Ver Cronograma Gantt</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigateTab('financial')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Relatório Financeiro</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      {report && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Valor Contratado (Cliente)
            </span>
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1 block">
              R$ {report.contractValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-slate-500 mt-2 block font-mono">
              Faturado em medições: R$ {report.totalIncome.toLocaleString('pt-BR')}
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Custo Orçado vs. Realizado
            </span>
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1 block">
              R$ {report.spentTotal.toLocaleString('pt-BR')}
              <span className="text-xs text-slate-400 font-normal"> / R$ {report.budgetTotal.toLocaleString('pt-BR')}</span>
            </span>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-orange-600 h-full rounded-full" 
                  style={{ width: `${Math.min(100, report.percentBudgetSpent)}%` }}
                />
              </div>
              <span className="text-[11px] font-mono font-semibold text-slate-700">
                {report.percentBudgetSpent.toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Progresso Físico da Obra
            </span>
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1 block">
              {report.physicalProgress}% concluído
            </span>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full rounded-full" 
                  style={{ width: `${report.physicalProgress}%` }}
                />
              </div>
              <span className="text-[11px] font-mono font-semibold text-emerald-700">
                Físico
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Margem Bruta Estimada
            </span>
            <span className="text-xl font-bold font-mono tabular-nums text-emerald-700 mt-1 block">
              {report.projectedNetMarginPercent.toFixed(1)}%
            </span>
            <span className="text-[11px] text-slate-500 mt-2 block font-mono">
              Lucro previsto: R$ {report.grossMargin.toLocaleString('pt-BR')}
            </span>
          </div>
        </div>
      )}

      {/* 3-Column Action / Alert Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Materiais Críticos no Canteiro */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-orange-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Estoque no Canteiro
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('materials')}
              className="text-xs text-orange-600 hover:text-orange-700 font-semibold"
            >
              Ver todos ➔
            </button>
          </div>

          {lowStock.length === 0 ? (
            <div className="p-4 bg-emerald-50/60 rounded-lg text-emerald-800 text-xs flex items-center gap-2 border border-emerald-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Todos os insumos essenciais estão acima do estoque mínimo.</span>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[11px] text-amber-800 font-medium">
                {lowStock.length} insumo(s) em nível crítico para a obra:
              </p>
              {lowStock.slice(0, 3).map((item) => (
                <div key={item.id} className="p-2.5 bg-amber-50/70 rounded-lg border border-amber-200/80 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-900 block truncate max-w-[170px]">{item.name}</span>
                    <span className="text-[11px] text-amber-700 font-mono">
                      Atual: {item.currentStock} {item.unit} (Mín: {item.minStock})
                    </span>
                  </div>
                  <button
                    onClick={onOpenNewOrder}
                    className="px-2 py-1 bg-amber-600 text-white rounded text-[10px] font-semibold hover:bg-amber-700 shrink-0"
                  >
                    Repor
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Column 2: Pedidos de Insumos em Trânsito / Aguardando */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Suprimentos em Rota
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('materials')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
            >
              Gerenciar ➔
            </button>
          </div>

          {inTransitOrders.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-lg text-slate-500 text-xs">
              Nenhum pedido de material pendente de entrega no momento.
            </div>
          ) : (
            <div className="space-y-2">
              {inTransitOrders.slice(0, 3).map((ord) => (
                <div key={ord.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 truncate max-w-[160px]">{ord.materialName}</span>
                    <span className="text-[10px] font-mono text-blue-700 font-semibold">
                      {ord.status === 'in_transit' ? 'Em trânsito' : 'Solicitado'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>{ord.quantity} {ord.unit}</span>
                    <span>Chegada: {ord.expectedDeliveryDate}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Column 3: Próximos Marcos do Cronograma */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Próximos Marcos (Gantt)
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('gantt')}
              className="text-xs text-purple-600 hover:text-purple-700 font-semibold"
            >
              Ver tudo ➔
            </button>
          </div>

          {upcomingMilestones.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-lg text-slate-500 text-xs">
              Nenhum marco pendente cadastrado.
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingMilestones.slice(0, 3).map((m) => (
                <div key={m.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                    <span className="w-2 h-2 rotate-45 bg-blue-600 inline-block shrink-0" />
                    <span className="truncate">{m.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Data: {m.startDate}</span>
                    <span className="font-semibold text-slate-700">{m.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All Projects Overview Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Painel Geral de Obras da Empresa ({projects.length})
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Acompanhamento simultâneo de todos os empreendimentos ativos no CRM.
            </p>
          </div>

          <button
            onClick={onOpenNewProject}
            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cadastrar Obra</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Código / Obra</th>
                <th className="py-3 px-4">Localização & Área</th>
                <th className="py-3 px-4 text-right">Orçamento Previsto</th>
                <th className="py-3 px-4 text-right">Realizado</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map((proj) => {
                const isCurrent = proj.id === activeProject?.id;
                return (
                  <tr 
                    key={proj.id} 
                    className={`transition-colors ${isCurrent ? 'bg-orange-50/30' : 'hover:bg-slate-50/60'}`}
                  >
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{proj.name}</span>
                      <span className="text-[11px] font-mono text-slate-500">{proj.code}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{proj.city} - {proj.state}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{proj.builtAreaM2} m² construídos</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium tabular-nums text-slate-900">
                      R$ {proj.budgetTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                      R$ {proj.spentTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-[11px] font-medium text-slate-700">
                        {proj.status === 'in_progress' ? 'Em Execução' : proj.status === 'planning' ? 'Planejamento' : 'Concluído'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isCurrent ? (
                        <span className="text-[11px] font-bold text-orange-600 font-mono">
                          ✓ Obra Selecionada
                        </span>
                      ) : (
                        <button
                          onClick={() => setActiveProjectId(proj.id)}
                          className="px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                        >
                          Selecionar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
