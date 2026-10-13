import React from 'react';
import { 
  Plus, 
  FileText, 
  MapPin, 
  HardHat, 
  Calendar,
  Building
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { ActiveTab } from './Sidebar';

interface HeaderProps {
  currentTab: ActiveTab;
  onOpenNewProject: () => void;
  onOpenNewTask: () => void;
  onOpenNewOrder: () => void;
  onOpenNewClient: () => void;
  onOpenExportReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenNewProject,
  onOpenNewTask,
  onOpenNewOrder,
  onOpenNewClient,
  onOpenExportReport,
}) => {
  const { activeProject } = useCRM();

  const tabTitles: Record<ActiveTab, string> = {
    dashboard: 'Visão Geral Executiva',
    gantt: 'Cronograma Físico & Gráfico de Gantt',
    rdo: 'Diário de Obra Digital (RDO)',
    materials: 'Fluxo de Materiais & Cotações',
    measurements: 'Medição de Empreiteiros',
    clients: 'Clientes & Gestão de Contratos',
    financial: 'Relatórios, Curva S & Preditivo',
  };

  const getPrimaryAction = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <button
            onClick={onOpenNewProject}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Obra</span>
          </button>
        );
      case 'gantt':
        return (
          <button
            onClick={onOpenNewTask}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Etapa / Marco</span>
          </button>
        );
      case 'materials':
        return (
          <button
            onClick={onOpenNewOrder}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Pedido de Material</span>
          </button>
        );
      case 'clients':
        return (
          <button
            onClick={onOpenNewClient}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Cliente / Proposta</span>
          </button>
        );
      case 'financial':
        return (
          <button
            onClick={onOpenExportReport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5 text-orange-400" />
            <span>Relatório Executivo PDF / Imprimir</span>
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-6 shrink-0 z-10">
      {/* Zone 1: Breadcrumbs & Active Obra Info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1 font-medium text-slate-700 truncate max-w-xs">
              <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {activeProject?.name || 'Selecione uma obra'}
            </span>
            <span aria-hidden="true" className="text-slate-300">/</span>
            <span className="font-semibold text-orange-600 truncate">{tabTitles[currentTab]}</span>
          </div>
          {activeProject && (
            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
              <span className="flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 text-slate-400" />
                {activeProject.city} - {activeProject.state}
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="flex items-center gap-1 truncate">
                <HardHat className="w-3 h-3 text-slate-400" />
                {activeProject.engineerName.split('(')[0]}
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="flex items-center gap-1 font-mono">
                <Calendar className="w-3 h-3 text-slate-400" />
                Entrega: {activeProject.expectedEndDate}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Zone 3: Primary Action */}
      <div className="flex items-center gap-2.5 shrink-0">
        {currentTab !== 'financial' && (
          <button
            onClick={onOpenExportReport}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
            title="Visualizar e Imprimir Relatório"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Emitir Relatório</span>
          </button>
        )}
        {getPrimaryAction()}
      </div>
    </header>
  );
};
