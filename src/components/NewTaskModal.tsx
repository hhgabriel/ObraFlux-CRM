import React, { useState } from 'react';
import { X, CalendarRange, Milestone } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { TaskCategory } from '../types/crm';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose }) => {
  const { activeProject, addTask, ganttTasks } = useCRM();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Estrutura & Alvenaria');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 21);
    return d.toISOString().split('T')[0];
  });
  const [budgetCost, setBudgetCost] = useState(150000);
  const [assignedTeam, setAssignedTeam] = useState('Equipe Própria de Canteiro');
  const [isMilestone, setIsMilestone] = useState(false);
  const [dependencyTaskId, setDependencyTaskId] = useState('');

  if (!isOpen || !activeProject) return null;

  const currentProjectTasks = ganttTasks.filter(t => t.projectId === activeProject.id);

  const categories: TaskCategory[] = [
    'Planejamento & Projetos',
    'Fundação & Terraplenagem',
    'Estrutura & Alvenaria',
    'Instalações Hidráulicas & Elétricas',
    'Cobertura & Impermeabilização',
    'Acabamentos & Revestimentos',
    'Vistoria & Entrega das Chaves'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    addTask({
      projectId: activeProject.id,
      name,
      category,
      startDate,
      endDate: isMilestone ? startDate : endDate,
      progress: 0,
      budgetCost: isMilestone ? 0 : Number(budgetCost),
      actualCost: 0,
      assignedTeam: isMilestone ? undefined : assignedTeam,
      isMilestone,
      dependencyTaskId: dependencyTaskId || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <CalendarRange className="w-4 h-4 text-orange-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Adicionar Etapa / Marco no Cronograma
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-medium text-slate-700 block mb-1">Nome da Etapa ou Serviço *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Concretagem das Vigas do 5º Pavimento"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-slate-700 block mb-1">Categoria de Engenharia</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={isMilestone}
                  onChange={(e) => setIsMilestone(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                />
                <span>É um Marco Crítico (Milestone)?</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-slate-700 block mb-1">Data Início</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-orange-500"
              />
            </div>

            {!isMilestone && (
              <div>
                <label className="font-medium text-slate-700 block mb-1">Data Término</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-orange-500"
                />
              </div>
            )}
          </div>

          {!isMilestone && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Custo Orçado Previsto (R$)</label>
                <input
                  type="number"
                  value={budgetCost}
                  onChange={(e) => setBudgetCost(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Equipe / Empreiteira Responsável</label>
                <input
                  type="text"
                  value={assignedTeam}
                  onChange={(e) => setAssignedTeam(e.target.value)}
                  placeholder="Ex: Turma de Armadores 2"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="font-medium text-slate-700 block mb-1">Depende de outra etapa anterior?</label>
            <select
              value={dependencyTaskId}
              onChange={(e) => setDependencyTaskId(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500"
            >
              <option value="">Nenhuma dependência direta</option>
              {currentProjectTasks.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-xs"
            >
              Adicionar ao Cronograma
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
