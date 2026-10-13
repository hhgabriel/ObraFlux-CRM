import React from 'react';
import { 
  Plus, 
  FileText, 
  MapPin, 
  HardHat, 
  Calendar,
  Building,
  Menu
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
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenNewProject,
  onOpenNewTask,
  onOpenNewOrder,
  onOpenNewClient,
  onOpenExportReport,
  onOpenMobileMenu,
}) => {
  const { activeProject } = useCRM();

  const tabTitles: Record<ActiveTab, string> = {
    dashboard: 'Visão Geral Executiva',
    gantt: 'Cronograma Físico & Gantt',
    rdo: 'Diário de Obra (RDO)',
    materials: 'Materiais & Cotações',
    measurements: 'Medição de Empreiteiros',
    clients: 'Clientes & Obras',
    financial: 'Relatórios, Curva S & Preditivo',
  };

  const getPrimaryAction = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <button
            onClick={onOpenNewProject}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">Nova Obra</span>
            <span className="xs:hidden">Obra</span>
          </button>
        );
      case 'gantt':
        return (
          <button
            onClick={onOpenNewTask}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nova Etapa / Marco</span>
            <span className="sm:hidden">Etapa</span>
          </button>
        );
      case 'materials':
        return (
          <button
            onClick={onOpenNewOrder}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Novo Pedido</span>
            <span className="sm:hidden">Pedido</span>
          </button>
        );
      case 'clients':
        return (
          <button
            onClick={onOpenNewClient}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Novo Cliente</span>
            <span className="sm:hidden">Cliente</span>
          </button>
        );
      case 'financial':
        return (
          <button
            onClick={onOpenExportReport}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden sm:inline">Relatório Executivo PDF</span>
            <span className="sm:hidden">PDF / Relatório</span>
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between gap-3 sm:gap-6 shrink-0 z-20">
      {/* Zone 1: Mobile Hamburger + Breadcrumbs & Active Obra Info */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
            aria-label="Abrir menu de navegação"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1 font-medium text-slate-700 truncate max-w-[140px] sm:max-w-xs">
              <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {activeProject?.name || 'Selecione uma obra'}
            </span>
            <span aria-hidden="true" className="text-slate-300">/</span>
            <span className="font-semibold text-orange-600 truncate">{tabTitles[currentTab]}</span>
          </div>
          {activeProject && (
            <div className="flex items-center gap-2 sm:gap-3 text-[11px] text-slate-500 mt-0.5">
              <span className="flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                {activeProject.city} - {activeProject.state}
              </span>
              <span aria-hidden="true" className="text-slate-300 hidden sm:inline">·</span>
              <span className="hidden sm:flex items-center gap-1 truncate">
                <HardHat className="w-3 h-3 text-slate-400 shrink-0" />
                {activeProject.engineerName.split('(')[0]}
              </span>
              <span aria-hidden="true" className="text-slate-300 hidden md:inline">·</span>
              <span className="hidden md:flex items-center gap-1 font-mono">
                <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                Entrega: {activeProject.expectedEndDate}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Zone 3: Primary Action */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {currentTab !== 'financial' && (
          <button
            onClick={onOpenExportReport}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
            title="Visualizar e Imprimir Relatório Executivo"
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
