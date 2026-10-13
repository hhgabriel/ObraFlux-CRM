import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Milestone, 
  Plus, 
  Filter, 
  Layers,
  ChevronDown,
  Info,
  Download,
  Upload,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { GanttTask, TaskCategory } from '../types/crm';

interface GanttViewProps {
  onOpenNewTask: () => void;
}

export const GanttView: React.FC<GanttViewProps> = ({ onOpenNewTask }) => {
  const { activeProject, ganttTasks, updateTaskProgress, deleteTask, importTasksFromCSV } = useCRM();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const projectTasks = useMemo(() => {
    if (!activeProject) return [];
    return ganttTasks.filter(t => t.projectId === activeProject.id);
  }, [ganttTasks, activeProject]);

  const handleExportCSV = () => {
    if (!activeProject || projectTasks.length === 0) return;
    const headers = ['Nome', 'Categoria', 'DataInicio', 'DataFim', 'Orcado', 'Realizado', 'Progresso', 'Marco'];
    const rows = projectTasks.map(t => [
      `"${t.name.replace(/"/g, '""')}"`,
      `"${t.category}"`,
      t.startDate,
      t.endDate,
      t.budgetCost,
      t.actualCost,
      t.progress,
      t.isMilestone ? 'SIM' : 'NAO'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Cronograma_Gantt_${activeProject.code}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Cronograma exportado em formato CSV!');
  };

  const handleImportCSVSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) return;

    try {
      const lines = importText.trim().split('\n');
      const parsedTasks: Array<Omit<GanttTask, 'id' | 'projectId'>> = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || (i === 0 && line.toLowerCase().includes('nome'))) continue; // skip header

        const cols = line.split(/[;,]/).map(c => c.trim().replace(/^["']|["']$/g, ''));
        if (cols.length >= 4) {
          const name = cols[0];
          const category = (cols[1] as TaskCategory) || 'Estrutura & Alvenaria';
          const startDate = cols[2];
          const endDate = cols[3];
          const budgetCost = cols[4] ? Number(cols[4]) : 0;
          const progress = cols[6] ? Number(cols[6]) : 0;
          const isMilestone = cols[7]?.toUpperCase() === 'SIM' || cols[7]?.toUpperCase() === 'TRUE';

          parsedTasks.push({
            name,
            category,
            startDate,
            endDate,
            budgetCost,
            actualCost: 0,
            progress: Math.min(100, Math.max(0, progress)),
            isMilestone,
          });
        }
      }

      if (parsedTasks.length > 0) {
        importTasksFromCSV(parsedTasks);
        showToast(`${parsedTasks.length} etapas importadas para o cronograma com sucesso!`);
        setIsImportModalOpen(false);
        setImportText('');
      } else {
        alert('Não foi possível identificar etapas válidas no texto. Verifique o formato CSV.');
      }
    } catch (err) {
      alert('Erro ao processar arquivo CSV.');
    }
  };

  const filteredTasks = useMemo(() => {
    if (selectedCategory === 'all') return projectTasks;
    if (selectedCategory === 'milestones') return projectTasks.filter(t => t.isMilestone);
    return projectTasks.filter(t => t.category === selectedCategory);
  }, [projectTasks, selectedCategory]);

  // Determine Gantt timeline boundaries
  const { minDate, maxDate, totalDays } = useMemo(() => {
    if (projectTasks.length === 0) {
      const now = new Date();
      const end = new Date();
      end.setMonth(end.getMonth() + 6);
      return { minDate: now, maxDate: end, totalDays: 180 };
    }

    const startTimestamps = projectTasks.map(t => new Date(t.startDate).getTime());
    const endTimestamps = projectTasks.map(t => new Date(t.endDate).getTime());
    
    // Add margin
    const minTime = Math.min(...startTimestamps) - (3 * 86400000);
    const maxTime = Math.max(...endTimestamps) + (7 * 86400000);

    const min = new Date(minTime);
    const max = new Date(maxTime);
    const diff = Math.max(30, Math.ceil((max.getTime() - min.getTime()) / 86400000));

    return { minDate: min, maxDate: max, totalDays: diff };
  }, [projectTasks]);

  // Generate month headers
  const monthHeaders = useMemo(() => {
    const months: Array<{ name: string; leftPercent: number; widthPercent: number }> = [];
    const cur = new Date(minDate);
    cur.setDate(1);

    while (cur <= maxDate) {
      const mStart = new Date(Math.max(cur.getTime(), minDate.getTime()));
      const nextMonth = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
      const mEnd = new Date(Math.min(nextMonth.getTime() - 86400000, maxDate.getTime()));

      const left = ((mStart.getTime() - minDate.getTime()) / (totalDays * 86400000)) * 100;
      const width = ((mEnd.getTime() - mStart.getTime() + 86400000) / (totalDays * 86400000)) * 100;

      const monthName = cur.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).toUpperCase();

      months.push({
        name: monthName,
        leftPercent: Math.max(0, left),
        widthPercent: Math.min(100 - left, width),
      });

      cur.setMonth(cur.getMonth() + 1);
    }
    return months;
  }, [minDate, maxDate, totalDays]);

  // Today marker percentage
  const todayPercent = useMemo(() => {
    const today = new Date().getTime();
    if (today < minDate.getTime() || today > maxDate.getTime()) return null;
    return ((today - minDate.getTime()) / (totalDays * 86400000)) * 100;
  }, [minDate, maxDate, totalDays]);

  // Calculate task bar position
  const getTaskCoords = (task: GanttTask) => {
    const start = new Date(task.startDate).getTime();
    const end = new Date(task.endDate).getTime();
    const left = ((start - minDate.getTime()) / (totalDays * 86400000)) * 100;
    const width = Math.max(1.5, ((end - start + 86400000) / (totalDays * 86400000)) * 100);
    return { left: Math.max(0, left), width: Math.min(100 - left, width) };
  };

  const categoriesList: TaskCategory[] = [
    'Planejamento & Projetos',
    'Fundação & Terraplenagem',
    'Estrutura & Alvenaria',
    'Instalações Hidráulicas & Elétricas',
    'Cobertura & Impermeabilização',
    'Acabamentos & Revestimentos',
    'Vistoria & Entrega das Chaves'
  ];

  if (!activeProject) {
    return (
      <div className="p-8 text-center text-slate-500">
        Nenhuma obra selecionada para visualização do cronograma.
      </div>
    );
  }

  // Calculate overall progress
  const nonMilestones = projectTasks.filter(t => !t.isMilestone);
  const avgProgress = nonMilestones.length > 0
    ? Math.round(nonMilestones.reduce((acc, t) => acc + t.progress, 0) / nonMilestones.length)
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Top Controls & Metrics Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-6 flex-wrap">
          <div>
            <span className="text-xs text-slate-500 block">Progresso Geral da Obra</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {avgProgress}%
              </span>
              <div className="w-28 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-orange-600 h-full rounded-full transition-all duration-300" 
                  style={{ width: `${avgProgress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-200 hidden sm:block" />

          <div>
            <span className="text-xs text-slate-500 block">Horizonte da Obra</span>
            <span className="text-xs font-semibold text-slate-800 font-mono mt-0.5 block">
              {activeProject.startDate} ➔ {activeProject.expectedEndDate}
            </span>
          </div>

          <div className="h-8 w-px bg-slate-200 hidden sm:block" />

          <div>
            <span className="text-xs text-slate-500 block">Etapas Cadastradas</span>
            <span className="text-xs font-semibold text-slate-800 font-mono mt-0.5 block">
              {projectTasks.length} fases ({projectTasks.filter(t => t.isMilestone).length} marcos)
            </span>
          </div>
        </div>

        {/* Filter & Import/Export controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:border-orange-500 appearance-none"
            >
              <option value="all">Todas as Categorias ({projectTasks.length})</option>
              <option value="milestones">Apenas Marcos Críticos</option>
              {categoriesList.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors shrink-0"
            title="Exportar cronograma atual para CSV / Excel"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors shrink-0"
            title="Importar etapas a partir de arquivo ou texto CSV"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Importar CSV</span>
          </button>

          <button
            onClick={onOpenNewTask}
            className="flex items-center gap-1.5 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Etapa</span>
          </button>
        </div>
      </div>

      {/* Main Gantt Grid Container */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Info Legend Banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-3 rounded-xs bg-orange-600 inline-block" />
              Etapa Construtiva
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rotate-45 bg-blue-600 inline-block" />
              Marco de Medição (Milestone)
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              100% Concluído
            </span>
          </div>
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Info className="w-3 h-3 text-slate-400" />
            Clique na barra ou no seletor de progresso para atualizar a medição física da etapa.
          </span>
        </div>

        {/* Scrollable Gantt Table & Chart Area */}
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* Header row: Left Columns + Timeline Scale */}
            <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-100/70 text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
              {/* Task metadata headers (5 cols) */}
              <div className="col-span-5 p-3 border-r border-slate-200 flex items-center justify-between">
                <span>Etapa / Serviço de Engenharia</span>
                <span className="text-[10px] text-slate-500 font-mono">Início · Fim · Custo</span>
              </div>

              {/* Timeline Month Headers (7 cols) */}
              <div className="col-span-7 relative h-10 border-b border-slate-200 overflow-hidden">
                {monthHeaders.map((m, idx) => (
                  <div
                    key={idx}
                    className="absolute top-0 bottom-0 border-r border-slate-200 px-2 py-2.5 text-center truncate font-mono text-[10px] text-slate-600 font-semibold"
                    style={{ left: `${m.leftPercent}%`, width: `${m.widthPercent}%` }}
                  >
                    {m.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Task rows */}
            <div className="divide-y divide-slate-100 relative">
              {/* Today line indicator */}
              {todayPercent !== null && (
                <div 
                  className="absolute top-0 bottom-0 z-20 pointer-events-none"
                  style={{ left: `calc(41.666% + (${todayPercent}% * 0.5833))` }}
                >
                  <div className="w-0.5 h-full bg-red-500 border-r border-red-500" />
                  <span className="absolute -top-5 -translate-x-1/2 bg-red-600 text-white text-[9px] font-mono px-1 rounded">
                    Hoje
                  </span>
                </div>
              )}

              {filteredTasks.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Nenhuma etapa encontrada para o filtro selecionado.
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const { left, width } = getTaskCoords(task);
                  const isCompleted = task.progress === 100;
                  const isMilestone = !!task.isMilestone;
                  const isLate = !isCompleted && new Date(task.endDate).getTime() < new Date().getTime();

                  return (
                    <div 
                      key={task.id}
                      className="grid grid-cols-12 hover:bg-slate-50/80 transition-colors group text-xs items-center"
                    >
                      {/* Left: Task Details */}
                      <div className="col-span-5 p-3 border-r border-slate-200 flex flex-col gap-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {isMilestone ? (
                              <div className="w-4 h-4 rotate-45 bg-blue-600 flex items-center justify-center shrink-0 shadow-xs">
                                <Milestone className="w-2.5 h-2.5 text-white -rotate-45" />
                              </div>
                            ) : isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : isLate ? (
                              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                            ) : (
                              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                            <span className={`font-medium truncate ${isMilestone ? 'text-blue-900 font-semibold' : 'text-slate-800'}`}>
                              {task.name}
                            </span>
                          </div>

                          {/* Quick progress button / badge */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="font-mono text-[11px] font-semibold tabular-nums text-slate-700">
                              {task.progress}%
                            </span>
                          </div>
                        </div>

                        {/* Unboxed Metadata Line (Zero-Pill Discipline) */}
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                          <span className="truncate max-w-[140px] text-slate-600">{task.category}</span>
                          <span aria-hidden="true">·</span>
                          <span>{task.startDate} a {task.endDate}</span>
                          {task.budgetCost > 0 && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-slate-700">
                                R$ {task.budgetCost.toLocaleString('pt-BR')}
                              </span>
                            </>
                          )}
                          {task.assignedTeam && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-slate-500 truncate max-w-[120px]">{task.assignedTeam}</span>
                            </>
                          )}
                        </div>

                        {/* Progress slider when hovering or editing */}
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">Ajustar medição:</span>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={task.progress}
                            onChange={(e) => updateTaskProgress(task.id, parseInt(e.target.value, 10))}
                            className="w-24 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                          />
                        </div>
                      </div>

                      {/* Right: Gantt Graphic Bar Area */}
                      <div className="col-span-7 relative h-16 p-2 flex items-center bg-slate-50/30">
                        {/* Background grid lines matching months */}
                        {monthHeaders.map((m, idx) => (
                          <div
                            key={idx}
                            className="absolute top-0 bottom-0 border-r border-slate-100 pointer-events-none"
                            style={{ left: `${m.leftPercent}%`, width: `${m.widthPercent}%` }}
                          />
                        ))}

                        {/* Task Bar */}
                        {isMilestone ? (
                          <div
                            className="absolute flex items-center gap-1 z-10 cursor-pointer"
                            style={{ left: `${left}%` }}
                            title={`Marco: ${task.name} (${task.startDate})`}
                          >
                            <div className="w-5 h-5 rotate-45 bg-blue-600 border-2 border-white shadow-sm flex items-center justify-center hover:scale-110 transition-transform">
                              <span className="text-[9px] text-white -rotate-45 font-bold">★</span>
                            </div>
                            <span className="text-[10px] font-semibold text-blue-900 bg-white/90 px-1 py-0.5 rounded shadow-2xs border border-blue-200 truncate max-w-[180px]">
                              {task.name}
                            </span>
                          </div>
                        ) : (
                          <div
                            className="absolute h-7 rounded-md overflow-hidden shadow-xs cursor-pointer group/bar transition-all"
                            style={{ 
                              left: `${left}%`, 
                              width: `${width}%`,
                              minWidth: '24px'
                            }}
                            onClick={() => {
                              const nextProg = task.progress >= 100 ? 0 : Math.min(100, task.progress + 25);
                              updateTaskProgress(task.id, nextProg);
                            }}
                            title={`${task.name}: ${task.progress}% concluído. Clique para avançar medição.`}
                          >
                            {/* Base track */}
                            <div className="w-full h-full bg-slate-200 border border-slate-300 relative">
                              {/* Filled progress */}
                              <div
                                className={`h-full transition-all duration-300 ${
                                  isCompleted 
                                    ? 'bg-emerald-600' 
                                    : isLate 
                                      ? 'bg-amber-600' 
                                      : 'bg-orange-600'
                                }`}
                                style={{ width: `${task.progress}%` }}
                              />
                              {/* Label on top of bar */}
                              <span className="absolute inset-0 flex items-center px-2 text-[10px] font-medium text-slate-800 drop-shadow-2xs truncate">
                                {task.progress}% · {task.name}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 text-xs">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Import CSV Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-orange-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Importar Etapas do Cronograma (CSV / Excel)
                </h3>
              </div>
              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1 font-mono">
              <p className="font-bold text-slate-800">Formato aceito das colunas (separadas por ponto-e-vírgula ou vírgula):</p>
              <p className="text-slate-500">Nome;Categoria;DataInicio;DataFim;CustoOrcado;CustoReal;Progresso;Marco</p>
              <p className="text-slate-400 text-[10px]">Exemplo: Concretagem Laje 5;Estrutura & Alvenaria;2026-11-01;2026-11-20;120000;0;0;NAO</p>
            </div>

            <form onSubmit={handleImportCSVSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">
                  Cole os dados CSV ou edite as etapas:
                </label>
                <textarea
                  rows={6}
                  required
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Nome;Categoria;DataInicio;DataFim;Custo;0;Progresso;Marco&#10;Armação de Pilares;Estrutura & Alvenaria;2026-11-10;2026-11-25;45000;0;0;NAO"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-[11px] focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Importar Etapas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
