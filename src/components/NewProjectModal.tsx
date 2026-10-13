import React, { useState } from 'react';
import { X, Building2 } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { ProjectStatus } from '../types/crm';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose }) => {
  const { clients, addProject } = useCRM();

  const [name, setName] = useState('');
  const [code, setCode] = useState(`OBRA-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`);
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [engineerName, setEngineerName] = useState('Eng. Carlos Eduardo Braga (CREA/PR 67.420-D)');
  const [artNumber, setArtNumber] = useState(`ART-BR-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Curitiba');
  const [state, setState] = useState('PR');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedEndDate, setExpectedEndDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });
  const [contractValue, setContractValue] = useState(2500000);
  const [budgetTotal, setBudgetTotal] = useState(1950000);
  const [builtAreaM2, setBuiltAreaM2] = useState(1400);
  const [description, setDescription] = useState('Construção civil residencial de alto padrão.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !clientId) return;

    addProject({
      name,
      code,
      clientId,
      engineerName,
      artNumber,
      address,
      city,
      state,
      startDate,
      expectedEndDate,
      status: 'in_progress' as ProjectStatus,
      contractValue: Number(contractValue),
      budgetTotal: Number(budgetTotal),
      builtAreaM2: Number(builtAreaM2),
      description,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-xl w-full p-6 my-8 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-orange-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Cadastrar Nova Obra / Empreendimento
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="font-medium text-slate-700 block mb-1">Nome do Empreendimento *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Residencial Parque das Flores"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="font-medium text-slate-700 block mb-1">Código da Obra</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="font-medium text-slate-700 block mb-1">Cliente / Contratante *</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="font-medium text-slate-700 block mb-1">Área Construída (m²)</label>
              <input
                type="number"
                value={builtAreaM2}
                onChange={(e) => setBuiltAreaM2(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-slate-700 block mb-1">Valor do Contrato (R$)</label>
              <input
                type="number"
                value={contractValue}
                onChange={(e) => setContractValue(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="font-medium text-slate-700 block mb-1">Custo Orçado Total (R$)</label>
              <input
                type="number"
                value={budgetTotal}
                onChange={(e) => setBudgetTotal(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-slate-700 block mb-1">Data Início</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="font-medium text-slate-700 block mb-1">Previsão de Entrega</label>
              <input
                type="date"
                value={expectedEndDate}
                onChange={(e) => setExpectedEndDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-slate-700 block mb-1">Engenheiro Responsável</label>
              <input
                type="text"
                value={engineerName}
                onChange={(e) => setEngineerName(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="font-medium text-slate-700 block mb-1">Nº Registro ART / RRT</label>
              <input
                type="text"
                value={artNumber}
                onChange={(e) => setArtNumber(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="font-medium text-slate-700 block mb-1">Endereço da Obra</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua, número e bairro"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="font-medium text-slate-700 block mb-1">Cidade / UF</label>
              <input
                type="text"
                value={`${city}/${state}`}
                onChange={(e) => {
                  const parts = e.target.value.split('/');
                  setCity(parts[0] || '');
                  setState(parts[1] || 'SP');
                }}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>
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
              Salvar Obra
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
