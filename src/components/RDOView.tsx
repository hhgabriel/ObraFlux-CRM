import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Sun, 
  CloudSun, 
  CloudRain, 
  AlertTriangle, 
  Users, 
  Wrench, 
  ShieldCheck, 
  Calendar, 
  Plus, 
  Printer, 
  Clock, 
  CheckCircle2, 
  HardHat,
  Search,
  Check
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { DailyConstructionLog, WeatherType } from '../types/crm';

export const RDOView: React.FC = () => {
  const { activeProject, rdos, addRDO } = useCRM();
  const [selectedRDOId, setSelectedRDOId] = useState<string>('');
  const [isNewRDOModalOpen, setIsNewRDOModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const projectRDOs = useMemo(() => {
    if (!activeProject) return [];
    return rdos
      .filter(r => r.projectId === activeProject.id)
      .sort((a, b) => b.reportNumber - a.reportNumber);
  }, [rdos, activeProject]);

  const activeRDO = useMemo(() => {
    if (selectedRDOId) {
      return projectRDOs.find(r => r.id === selectedRDOId) || projectRDOs[0] || null;
    }
    return projectRDOs[0] || null;
  }, [projectRDOs, selectedRDOId]);

  // Weather icon helper
  const getWeatherIcon = (type: WeatherType) => {
    switch (type) {
      case 'ensolarado':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'nublado':
        return <CloudSun className="w-4 h-4 text-slate-500" />;
      case 'chuva_fraca':
      case 'chuva_forte':
        return <CloudRain className="w-4 h-4 text-blue-500" />;
      case 'impraticavel':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const getWeatherLabel = (type: WeatherType) => {
    switch (type) {
      case 'ensolarado': return 'Ensolarado';
      case 'nublado': return 'Nublado';
      case 'chuva_fraca': return 'Chuva Fraca';
      case 'chuva_forte': return 'Chuva Forte';
      case 'impraticavel': return 'Impraticável';
    }
  };

  // Form state for New RDO modal
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [weatherMorning, setWeatherMorning] = useState<WeatherType>('ensolarado');
  const [weatherAfternoon, setWeatherAfternoon] = useState<WeatherType>('ensolarado');
  const [workability, setWorkability] = useState<'praticavel' | 'parcial' | 'impraticavel'>('praticavel');
  const [masons, setMasons] = useState(12);
  const [laborers, setLaborers] = useState(8);
  const [ironworkers, setIronworkers] = useState(6);
  const [carpenters, setCarpenters] = useState(4);
  const [electricians, setElectricians] = useState(2);
  const [plumbers, setPlumbers] = useState(2);
  const [activitiesInput, setActivitiesInput] = useState('');
  const [safetyInput, setSafetyInput] = useState('DDS realizado às 07:15. Uso obrigatório de EPIs fiscalizado. Nenhum acidente registrado.');
  const [occurrencesInput, setOccurrencesInput] = useState('Trabalhos transcorreram conforme programado.');

  const handleCreateRDO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject) return;

    const acts = activitiesInput
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    addRDO({
      projectId: activeProject.id,
      date: reportDate,
      weatherMorning,
      weatherAfternoon,
      workability,
      workforce: {
        engineers: 1,
        foremen: 1,
        masons: Number(masons),
        laborers: Number(laborers),
        ironworkers: Number(ironworkers),
        carpenters: Number(carpenters),
        electricians: Number(electricians),
        plumbers: Number(plumbers),
        subcontractorsCount: 4,
      },
      equipment: [
        { name: 'Grua de Torre 35m', quantity: 1, status: 'operando' },
        { name: 'Betoneira 400L', quantity: 2, status: 'operando' },
        { name: 'Guincho de Coluna 500kg', quantity: 1, status: 'operando' }
      ],
      activitiesCompleted: acts.length > 0 ? acts : ['Atividades de rotina no canteiro de obras.'],
      inspectionsAndSafety: safetyInput,
      occurrences: occurrencesInput,
      responsibleEngineer: activeProject.engineerName,
    });

    setIsNewRDOModalOpen(false);
  };

  if (!activeProject) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs">
        Selecione uma obra para acessar o Diário de Obra (RDO).
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">
              Diário de Obra Digital (RDO)
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-50 text-orange-700 font-semibold border border-orange-200">
              Livro de Ocorrências Diárias
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro diário de efetivo, condições meteorológicas, equipamentos e avanço dos serviços no canteiro.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Imprimir RDO</span>
          </button>

          <button
            onClick={() => setIsNewRDOModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Emitir Novo RDO</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Split: RDO History list & Active RDO Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 bg-slate-50/60">
            <span>Histórico de Diários ({projectRDOs.length})</span>
            <span className="text-[11px] text-slate-400 font-normal">Mais recentes</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[640px] overflow-y-auto">
            {projectRDOs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Nenhum RDO emitido para esta obra ainda.
              </div>
            ) : (
              projectRDOs.map((rdo) => {
                const isSelected = activeRDO?.id === rdo.id;
                const totalWorkers = Object.values(rdo.workforce).reduce((a, b) => a + b, 0);

                return (
                  <button
                    key={rdo.id}
                    onClick={() => setSelectedRDOId(rdo.id)}
                    className={`w-full text-left p-3.5 transition-colors flex flex-col gap-1.5 ${
                      isSelected ? 'bg-orange-50/60 border-l-2 border-orange-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 font-mono">
                        RDO #{rdo.reportNumber}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {rdo.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-600">
                      <span className="flex items-center gap-1">
                        {getWeatherIcon(rdo.weatherMorning)}
                        <span>{getWeatherLabel(rdo.weatherMorning)}</span>
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Users className="w-3 h-3 text-slate-400" />
                        {totalWorkers} operários
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {rdo.activitiesCompleted[0] || 'Sem atividades descritas'}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Detail Sheet (8 cols) */}
        {activeRDO ? (
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-xs">
            {/* Sheet Header */}
            <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 font-mono">
                    Relatório Diário de Obra #{activeRDO.reportNumber}
                  </h3>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                    activeRDO.workability === 'praticavel' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    Condição: {activeRDO.workability}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 font-mono mt-1">
                  <span>Data: {activeRDO.date}</span>
                  <span aria-hidden="true">·</span>
                  <span>Obra: {activeProject.name} ({activeProject.code})</span>
                </div>
              </div>

              <div className="text-right text-xs font-mono text-slate-500">
                <span>{activeRDO.responsibleEngineer}</span>
              </div>
            </div>

            {/* Weather & Climate Strip */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Clima Manhã</span>
                <div className="flex items-center gap-1.5 mt-1 font-medium text-slate-800">
                  {getWeatherIcon(activeRDO.weatherMorning)}
                  <span>{getWeatherLabel(activeRDO.weatherMorning)}</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Clima Tarde</span>
                <div className="flex items-center gap-1.5 mt-1 font-medium text-slate-800">
                  {getWeatherIcon(activeRDO.weatherAfternoon)}
                  <span>{getWeatherLabel(activeRDO.weatherAfternoon)}</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Praticabilidade</span>
                <div className="mt-1 font-medium capitalize text-slate-800">
                  {activeRDO.workability}
                </div>
              </div>
            </div>

            {/* Workforce Tally */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-orange-600" />
                <span>Efetivo no Canteiro de Obras (Mão de Obra Presente)</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 border border-slate-200 rounded-lg bg-slate-50/50">
                  <span className="text-[10px] text-slate-500 block">Pedreiros</span>
                  <span className="text-sm font-bold font-mono text-slate-900">{activeRDO.workforce.masons} profissionais</span>
                </div>
                <div className="p-2.5 border border-slate-200 rounded-lg bg-slate-50/50">
                  <span className="text-[10px] text-slate-500 block">Serventes</span>
                  <span className="text-sm font-bold font-mono text-slate-900">{activeRDO.workforce.laborers} profissionais</span>
                </div>
                <div className="p-2.5 border border-slate-200 rounded-lg bg-slate-50/50">
                  <span className="text-[10px] text-slate-500 block">Armadores</span>
                  <span className="text-sm font-bold font-mono text-slate-900">{activeRDO.workforce.ironworkers} profissionais</span>
                </div>
                <div className="p-2.5 border border-slate-200 rounded-lg bg-slate-50/50">
                  <span className="text-[10px] text-slate-500 block">Carpinteiros</span>
                  <span className="text-sm font-bold font-mono text-slate-900">{activeRDO.workforce.carpenters} profissionais</span>
                </div>
                <div className="p-2.5 border border-slate-200 rounded-lg bg-slate-50/50">
                  <span className="text-[10px] text-slate-500 block">Eletricistas</span>
                  <span className="text-sm font-bold font-mono text-slate-900">{activeRDO.workforce.electricians} profissionais</span>
                </div>
                <div className="p-2.5 border border-slate-200 rounded-lg bg-slate-50/50">
                  <span className="text-[10px] text-slate-500 block">Encanadores</span>
                  <span className="text-sm font-bold font-mono text-slate-900">{activeRDO.workforce.plumbers} profissionais</span>
                </div>
                <div className="p-2.5 border border-slate-200 rounded-lg bg-slate-50/50">
                  <span className="text-[10px] text-slate-500 block">Encarregados / Mestres</span>
                  <span className="text-sm font-bold font-mono text-slate-900">{activeRDO.workforce.foremen}</span>
                </div>
                <div className="p-2.5 border border-slate-200 rounded-lg bg-orange-50/40 border-orange-200">
                  <span className="text-[10px] text-orange-700 block font-semibold">Total Geral</span>
                  <span className="text-sm font-bold font-mono text-orange-950">
                    {Object.values(activeRDO.workforce).reduce((a, b) => a + b, 0)} operários
                  </span>
                </div>
              </div>
            </div>

            {/* Activities Completed */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Atividades Executadas no Dia</span>
              </h4>

              <ul className="space-y-1.5 text-xs text-slate-700 bg-slate-50/60 p-3.5 rounded-lg border border-slate-200">
                {activeRDO.activitiesCompleted.map((act, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold">•</span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Equipment status */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-slate-600" />
                <span>Equipamentos no Canteiro</span>
              </h4>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {activeRDO.equipment.map((eq, idx) => (
                  <div key={idx} className="p-2 border border-slate-200 rounded flex items-center justify-between">
                    <span className="font-medium text-slate-800">{eq.name} ({eq.quantity}x)</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded capitalize ${
                      eq.status === 'operando' ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
                    }`}>
                      {eq.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety & DDS + Occurrences */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                <span className="font-bold text-slate-900 flex items-center gap-1 text-[11px] uppercase">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Segurança, Meio Ambiente e DDS
                </span>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {activeRDO.inspectionsAndSafety}
                </p>
              </div>

              <div className="space-y-1.5 p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                <span className="font-bold text-slate-900 flex items-center gap-1 text-[11px] uppercase">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Ocorrências e Paralisações
                </span>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {activeRDO.occurrences}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
            Selecione um RDO no histórico para visualizar.
          </div>
        )}
      </div>

      {/* Modal: New RDO */}
      {isNewRDOModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                Emitir Novo Diário de Obra (RDO)
              </h3>
              <button onClick={() => setIsNewRDOModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRDO} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Data do Relatório</label>
                  <input
                    type="date"
                    required
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Condição Geral do Dia</label>
                  <select
                    value={workability}
                    onChange={(e) => setWorkability(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500"
                  >
                    <option value="praticavel">Praticável (Normal)</option>
                    <option value="parcial">Parcialmente Praticável</option>
                    <option value="impraticavel">Impraticável (Chuva/Parada)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Clima (Manhã)</label>
                  <select
                    value={weatherMorning}
                    onChange={(e) => setWeatherMorning(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500"
                  >
                    <option value="ensolarado">Ensolarado</option>
                    <option value="nublado">Nublado</option>
                    <option value="chuva_fraca">Chuva Fraca</option>
                    <option value="chuva_forte">Chuva Forte</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Clima (Tarde)</label>
                  <select
                    value={weatherAfternoon}
                    onChange={(e) => setWeatherAfternoon(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500"
                  >
                    <option value="ensolarado">Ensolarado</option>
                    <option value="nublado">Nublado</option>
                    <option value="chuva_fraca">Chuva Fraca</option>
                    <option value="chuva_forte">Chuva Forte</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700 block">Efetivo Presente no Canteiro</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500">Pedreiros:</span>
                    <input
                      type="number"
                      min="0"
                      value={masons}
                      onChange={(e) => setMasons(Number(e.target.value))}
                      className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Serventes:</span>
                    <input
                      type="number"
                      min="0"
                      value={laborers}
                      onChange={(e) => setLaborers(Number(e.target.value))}
                      className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Armadores:</span>
                    <input
                      type="number"
                      min="0"
                      value={ironworkers}
                      onChange={(e) => setIronworkers(Number(e.target.value))}
                      className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">
                  Atividades Executadas (1 por linha) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={activitiesInput}
                  onChange={(e) => setActivitiesInput(e.target.value)}
                  placeholder="Ex: Concretagem das vigas V10 e V11&#10;Assentamento de alvenaria no 4º andar&#10;Passagem de tubulações hidráulicas"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">
                  Ocorrências / Observações
                </label>
                <input
                  type="text"
                  value={occurrencesInput}
                  onChange={(e) => setOccurrencesInput(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewRDOModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Emitir RDO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
