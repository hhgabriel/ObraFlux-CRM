import React, { useState, useMemo } from 'react';
import { 
  FileCheck2, 
  CheckCircle, 
  Clock, 
  Plus, 
  DollarSign, 
  HardHat, 
  Building2, 
  ShieldCheck,
  Check
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { ContractorMeasurement } from '../types/crm';

export const ContractorMeasurementsView: React.FC = () => {
  const { 
    activeProject, 
    contractorMeasurements, 
    addContractorMeasurement, 
    approveContractorMeasurement 
  } = useCRM();

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const projectMeasurements = useMemo(() => {
    if (!activeProject) return [];
    return contractorMeasurements.filter(m => m.projectId === activeProject.id);
  }, [contractorMeasurements, activeProject]);

  // Form state
  const [subcontractorName, setSubcontractorName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [serviceTitle, setServiceTitle] = useState('');
  const [measurementNumber, setMeasurementNumber] = useState(1);
  const [unit, setUnit] = useState('m²');
  const [unitRate, setUnitRate] = useState(45.00);
  const [contractTotalQty, setContractTotalQty] = useState(1000);
  const [previousMeasuredQty, setPreviousMeasuredQty] = useState(0);
  const [currentPeriodQty, setCurrentPeriodQty] = useState(250);
  const [withholdingPercent, setWithholdingPercent] = useState(11); // 11% INSS
  const [periodStart, setPeriodStart] = useState(new Date().toISOString().split('T')[0]);
  const [periodEnd, setPeriodEnd] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !subcontractorName || !serviceTitle) return;

    const gross = currentPeriodQty * unitRate;
    const tax = gross * (withholdingPercent / 100);

    addContractorMeasurement({
      projectId: activeProject.id,
      subcontractorName,
      cnpj,
      serviceTitle,
      measurementNumber: Number(measurementNumber),
      periodStart,
      periodEnd,
      unit,
      unitRate: Number(unitRate),
      contractTotalQty: Number(contractTotalQty),
      previousMeasuredQty: Number(previousMeasuredQty),
      currentPeriodQty: Number(currentPeriodQty),
      withholdingTax: tax,
      status: 'pendente',
    });

    setIsNewModalOpen(false);
    showToast('Boletim de medição cadastrado com sucesso!');
  };

  const handleApprove = (mId: string, title: string) => {
    approveContractorMeasurement(mId, 'Aprovado pelo Engenheiro Responsável no canteiro.');
    showToast(`Medição aprovada! Pagamento lançado no controle financeiro da obra.`);
  };

  const totalGrossMeasured = projectMeasurements.reduce((acc, m) => acc + m.grossAmount, 0);
  const totalApproved = projectMeasurements
    .filter(m => m.status === 'aprovado' || m.status === 'pago')
    .reduce((acc, m) => acc + m.netAmountToPay, 0);

  if (!activeProject) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs">
        Selecione uma obra para gerenciar as medições de empreiteiros.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 text-xs">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Boletins de Medição de Empreiteiros & Terceirizados
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              Controle de Mão de Obra
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Aprovação técnica de serviços executados por produtividade e liberação de pagamento aos prestadores.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Novo Boletim de Medição</span>
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase block">
            Total Medido Acumulado (Bruto)
          </span>
          <span className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-1 block">
            R$ {totalGrossMeasured.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block font-mono">
            {projectMeasurements.length} boletins registrados
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase block">
            Total Aprovado / Liberado (Líquido)
          </span>
          <span className="text-lg font-bold font-mono tabular-nums text-emerald-700 mt-1 block">
            R$ {totalApproved.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block font-mono">
            Despesas creditadas no financeiro
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase block">
            Medições em Análise Técnica
          </span>
          <span className="text-lg font-bold font-mono tabular-nums text-amber-700 mt-1 block">
            {projectMeasurements.filter(m => m.status === 'pendente').length} pendente(s)
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Aguardando conferência do engenheiro
          </span>
        </div>
      </div>

      {/* Measurements Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-800">
            Quadro de Medições de Subempreiteiras
          </span>
          <span className="text-slate-500 font-mono text-[11px]">
            {projectMeasurements.length} medições na obra
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Empreiteiro / Serviço</th>
                <th className="py-3 px-4">Período de Medição</th>
                <th className="py-3 px-4 text-right">Qtd. no Período</th>
                <th className="py-3 px-4 text-right">Saldo Contrato</th>
                <th className="py-3 px-4 text-right">Valor Bruto</th>
                <th className="py-3 px-4 text-right">Retenções (INSS)</th>
                <th className="py-3 px-4 text-right">Valor Líquido</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projectMeasurements.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Nenhum boletim de medição cadastrado para esta obra.
                  </td>
                </tr>
              ) : (
                projectMeasurements.map((m) => {
                  const isApproved = m.status === 'aprovado' || m.status === 'pago';
                  const remaining = Math.max(0, m.contractTotalQty - m.accumulatedQty);

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{m.subcontractorName}</span>
                        <span className="text-slate-600 block">{m.serviceTitle}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          Medição #{m.measurementNumber} · {m.cnpj}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        <div>De: {m.periodStart}</div>
                        <div>Até: {m.periodEnd}</div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {m.currentPeriodQty.toLocaleString('pt-BR')} {m.unit}
                        <span className="text-[10px] text-slate-400 font-normal block">
                          (R$ {m.unitRate.toFixed(2)}/{m.unit})
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-600 tabular-nums">
                        {remaining.toLocaleString('pt-BR')} {m.unit}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-900 tabular-nums">
                        R$ {m.grossAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-red-700 tabular-nums">
                        - R$ {m.withholdingTax.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800 tabular-nums">
                        R$ {m.netAmountToPay.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {isApproved ? (
                          <span className="text-emerald-700 font-semibold text-[11px] inline-flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            Aprovado
                          </span>
                        ) : (
                          <span className="text-amber-700 font-medium text-[11px] inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Em Análise
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {isApproved ? (
                          <span className="text-[11px] text-slate-400 font-mono italic">
                            {m.approvalDate}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApprove(m.id, m.serviceTitle)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors inline-flex items-center gap-1 text-[11px] shadow-2xs"
                          >
                            <span>Aprovar Medição</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Measurement */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                Cadastrar Novo Boletim de Medição
              </h3>
              <button onClick={() => setIsNewModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Empreiteiro / Subcontratado *</label>
                  <input
                    type="text"
                    required
                    value={subcontractorName}
                    onChange={(e) => setSubcontractorName(e.target.value)}
                    placeholder="Ex: SoloFirme Fundações Ltda"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">CNPJ do Prestador</label>
                  <input
                    type="text"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Título do Serviço Medido *</label>
                <input
                  type="text"
                  required
                  value={serviceTitle}
                  onChange={(e) => setServiceTitle(e.target.value)}
                  placeholder="Ex: Execução de alvenaria estrutural no 5º andar"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Unidade</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="m², m, kg, un"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Preço Unitário (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={unitRate}
                    onChange={(e) => setUnitRate(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Qtd. Medida</label>
                  <input
                    type="number"
                    min="1"
                    value={currentPeriodQty}
                    onChange={(e) => setCurrentPeriodQty(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 font-mono text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Valor Bruto da Medição:</span>
                  <span className="font-bold text-slate-900">
                    R$ {(currentPeriodQty * unitRate).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Retenção Tributária (11% INSS):</span>
                  <span>
                    - R$ {((currentPeriodQty * unitRate) * 0.11).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-800 font-bold border-t border-slate-200 pt-1">
                  <span>Valor Líquido a Pagar:</span>
                  <span>
                    R$ {((currentPeriodQty * unitRate) * 0.89).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Início do Período</label>
                  <input
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Término do Período</label>
                  <input
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Cadastrar Boletim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
