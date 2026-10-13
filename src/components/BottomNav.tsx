import React from 'react';
import { 
  LayoutDashboard, 
  CalendarRange, 
  FileText, 
  Package, 
  Menu,
  BarChart3
} from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface BottomNavProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenMobileMenu: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenMobileMenu,
}) => {
  const quickItems = [
    { id: 'dashboard' as ActiveTab, label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'gantt' as ActiveTab, label: 'Gantt', icon: CalendarRange },
    { id: 'rdo' as ActiveTab, label: 'RDO', icon: FileText },
    { id: 'materials' as ActiveTab, label: 'Materiais', icon: Package },
    { id: 'financial' as ActiveTab, label: 'Financeiro', icon: BarChart3 },
  ];

  return (
    <nav 
      aria-label="Navegação rápida mobile"
      className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-around px-2 z-30 shadow-lg safe-area-bottom"
    >
      {quickItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-lg transition-colors ${
              isActive 
                ? 'text-orange-600 font-semibold' 
                : 'text-slate-500 hover:text-slate-900 font-normal'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-orange-600 stroke-[2.5]' : 'text-slate-400'}`} />
            <span className="text-[10px] mt-1 truncate max-w-[54px]">{item.label}</span>
          </button>
        );
      })}

      {/* Button to open full mobile drawer for remaining tabs */}
      {(() => {
        const isMoreActive = currentTab === 'measurements' || currentTab === 'clients';
        return (
          <button
            onClick={onOpenMobileMenu}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-lg transition-colors ${
              isMoreActive 
                ? 'text-orange-600 font-semibold' 
                : 'text-slate-500 hover:text-slate-900 font-normal'
            }`}
            title="Abrir menu completo de módulos"
          >
            <Menu className={`w-4 h-4 ${isMoreActive ? 'text-orange-600 stroke-[2.5]' : 'text-slate-500'}`} />
            <span className="text-[10px] mt-1">
              {currentTab === 'measurements' ? 'Medição' : currentTab === 'clients' ? 'Clientes' : 'Mais'}
            </span>
          </button>
        );
      })()}
    </nav>
  );
};
