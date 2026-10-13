import React from 'react';
import { 
  LayoutDashboard, 
  CalendarRange, 
  Package, 
  Users, 
  BarChart3, 
  HardHat, 
  Building2, 
  ChevronRight,
  RotateCcw,
  FileText,
  FileCheck2
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';

export type ActiveTab = 'dashboard' | 'gantt' | 'rdo' | 'materials' | 'measurements' | 'clients' | 'financial';

interface SidebarProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { projects, activeProjectId, setActiveProjectId, materials, resetToDefaults } = useCRM();

  // Count low stock items for badge
  const lowStockCount = materials.filter(
    m => m.projectId === activeProjectId && m.currentStock <= m.minStock
  ).length;

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'gantt' as ActiveTab, label: 'Cronograma Gantt', icon: CalendarRange },
    { id: 'rdo' as ActiveTab, label: 'Diário de Obra (RDO)', icon: FileText },
    { 
      id: 'materials' as ActiveTab, 
      label: 'Materiais & Cotações', 
      icon: Package,
      alertCount: lowStockCount > 0 ? lowStockCount : undefined
    },
    { id: 'measurements' as ActiveTab, label: 'Medição de Terceiros', icon: FileCheck2 },
    { id: 'clients' as ActiveTab, label: 'Clientes & Obras', icon: Users },
    { id: 'financial' as ActiveTab, label: 'Relatórios & Curva S', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col h-screen shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-orange-600 flex items-center justify-center text-white shadow-sm">
            <HardHat className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              ObraFlux
              <span className="text-[10px] font-mono uppercase tracking-wider text-orange-400 bg-orange-950/60 border border-orange-800/60 px-1 py-0.2 rounded">
                CRM
              </span>
            </h1>
            <p className="text-xs text-slate-400">Engenharia & Obras</p>
          </div>
        </div>
      </div>

      {/* Project Switcher Selector */}
      <div className="p-4 border-b border-slate-800/60">
        <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-1.5 block">
          Obra em Execução
        </label>
        <div className="relative">
          <select
            value={activeProjectId}
            onChange={(e) => setActiveProjectId(e.target.value)}
            className="w-full bg-slate-800/90 text-slate-100 text-xs rounded-lg border border-slate-700 py-2 pl-3 pr-8 appearance-none focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
          >
            {projects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.code} · {proj.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
            <Building2 className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Módulos
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.alertCount ? (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  isActive ? 'bg-orange-800 text-white' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}>
                  {item.alertCount} alerta{item.alertCount > 1 ? 's' : ''}
                </span>
              ) : isActive ? (
                <ChevronRight className="w-3.5 h-3.5 text-orange-200" />
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Footer Info & Reset */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-2">
        <div className="flex items-center justify-between px-2 py-1">
          <span>Obras cadastradas:</span>
          <span className="font-mono text-slate-200 font-medium">{projects.length} ativas</span>
        </div>
        <button
          onClick={() => {
            if (window.confirm('Deseja restaurar os dados de demonstração da construtora?')) {
              resetToDefaults();
            }
          }}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Restaurar Demonstração</span>
        </button>
      </div>
    </aside>
  );
};
