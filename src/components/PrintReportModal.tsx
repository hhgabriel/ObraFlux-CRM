import React from 'react';
import { 
  Printer, 
  X, 
  HardHat, 
  Building2, 
  Calendar, 
  CheckCircle,
  FileText
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({ isOpen, onClose }) => {
  const { activeProject, getProjectFinancialReport, ganttTasks } = useCRM();

  if (!isOpen || !activeProject) return null;

  const report = getProjectFinancialReport(activeProject.id);
  if (!report) return null;

  const projectTasks = ganttTasks.filter(t => t.projectId === activeProject.id);

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-4xl w-full my-8 overflow-hidden">
        {/* Modal Action Bar (Hidden on print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-semibold">
              Visualização Prévia do Relatório Executivo de Engenharia
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Salvar em PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-12 space-y-6 text-slate-800 bg-white" id="printable-report">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <HardHat className="w-6 h-6 text-orange-600" />
                <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">
                  ObraFlux Construtora & Engenharia
                </h1>
              </div>
              <p className="text-xs text-slate-600 mt-1 font-mono">
                Relatório Gerencial de Status Físico-Financeiro de Obra
              </p>
            </div>

            <div className="text-right text-xs font-mono text-slate-600">
              <div>Emissão: {currentDate}</div>
              <div>Cód. Obra: <strong>{activeProject.code}</strong></div>
              <div>Status: <strong>Em Execução</strong></div>
            </div>
          </div>

          {/* Project Dossier Info */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 font-semibold uppercase text-[10px] block">Empreendimento</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{activeProject.name}</p>
              <p className="text-slate-600">{activeProject.address} - {activeProject.city}/{activeProject.state}</p>
              <p className="text-slate-500 mt-1">Área Construída: {activeProject.builtAreaM2} m²</p>
            </div>

            <div>
              <span className="text-slate-500 font-semibold uppercase text-[10px] block">Responsabilidade Técnica & Cliente</span>
              <p className="font-bold text-slate-900 mt-0.5">{activeProject.engineerName}</p>
              <p className="text-slate-600">Registro ART: {activeProject.artNumber}</p>
              <p className="text-slate-700 mt-1">
                Contratante: {report.client?.name || 'Cliente Cadastrado'} ({report.client?.document || '-'})
              </p>
            </div>
          </div>

          {/* Key Financial Numbers Matrix */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              1. Demonstrativo Resumido de Orçamento e Custos
            </h3>

            <div className="grid grid-cols-4 gap-3 text-xs">
              <div className="p-3 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Valor Contratado</span>
                <span className="font-mono font-bold text-slate-900 text-sm mt-1 block">
                  R$ {report.contractValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-3 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Custo Orçado Previsto</span>
                <span className="font-mono font-bold text-slate-900 text-sm mt-1 block">
                  R$ {report.budgetTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-3 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Custo Total Realizado</span>
                <span className="font-mono font-bold text-slate-900 text-sm mt-1 block">
                  R$ {report.spentTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Margem Bruta Estimada</span>
                <span className="font-mono font-bold text-emerald-800 text-sm mt-1 block">
                  {report.projectedNetMarginPercent.toFixed(1)}% (R$ {report.grossMargin.toLocaleString('pt-BR')})
                </span>
              </div>
            </div>
          </div>

          {/* Category Breakdown Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              2. Detalhamento por Grupo de Despesas Construtivas
            </h3>

            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 font-semibold text-slate-700">
                <tr>
                  <th className="py-2 px-3">Grupo de Serviço</th>
                  <th className="py-2 px-3 text-right">Orçado (R$)</th>
                  <th className="py-2 px-3 text-right">Realizado (R$)</th>
                  <th className="py-2 px-3 text-right">Variação (R$)</th>
                  <th className="py-2 px-3 text-right">% Consumido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {report.categories.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-sans font-medium text-slate-900">{c.category}</td>
                    <td className="py-2 px-3 text-right">{c.budgeted.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2 px-3 text-right font-bold">{c.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className={`py-2 px-3 text-right ${c.variance < 0 ? 'text-red-700 font-bold' : 'text-emerald-700'}`}>
                      {c.variance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-right">{c.percentSpent.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Physical Progress from Gantt Tasks */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              3. Resumo do Cronograma Físico de Obras (Avanço: {report.physicalProgress}%)
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {projectTasks.map((t) => (
                <div key={t.id} className="p-2 border border-slate-200 rounded flex items-center justify-between">
                  <span className="truncate pr-2 font-medium text-slate-800">{t.name}</span>
                  <span className="font-mono font-bold text-slate-900 shrink-0">{t.progress}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Signatures Footer */}
          <div className="pt-12 grid grid-cols-2 gap-12 text-center text-xs">
            <div className="border-t border-slate-400 pt-2">
              <p className="font-bold text-slate-900">{activeProject.engineerName}</p>
              <p className="text-slate-500 font-mono">Engenheiro Civil Responsável Técnico</p>
            </div>

            <div className="border-t border-slate-400 pt-2">
              <p className="font-bold text-slate-900">{report.client?.name || 'Cliente / Fiscalização'}</p>
              <p className="text-slate-500 font-mono">Representante do Contratante</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
