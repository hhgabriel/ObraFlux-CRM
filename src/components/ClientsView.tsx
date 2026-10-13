import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  FileCheck, 
  Plus, 
  Search, 
  ArrowUpRight,
  Receipt,
  FileText
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Client } from '../types/crm';

interface ClientsViewProps {
  onOpenNewClient: () => void;
  onOpenNewProject: () => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({ onOpenNewClient, onOpenNewProject }) => {
  const { clients, projects, financialRecords, setActiveProjectId } = useCRM();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');

  const filteredClients = useMemo(() => {
    return clients.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.document.includes(searchTerm) ||
      (c.companyName && c.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [clients, searchTerm]);

  const selectedClient = useMemo(() => {
    return clients.find(c => c.id === selectedClientId) || clients[0] || null;
  }, [clients, selectedClientId]);

  // Projects of the selected client
  const clientProjects = useMemo(() => {
    if (!selectedClient) return [];
    return projects.filter(p => p.clientId === selectedClient.id);
  }, [projects, selectedClient]);

  // Incomes / measurements billed to this client across all their projects
  const clientIncomes = useMemo(() => {
    if (!selectedClient) return [];
    const clientProjectIds = new Set(clientProjects.map(p => p.id));
    return financialRecords.filter(r => r.type === 'income' && clientProjectIds.has(r.projectId));
  }, [financialRecords, clientProjects]);

  const totalContracted = clientProjects.reduce((acc, p) => acc + p.contractValue, 0);
  const totalReceived = clientIncomes.reduce((acc, r) => acc + r.amount, 0);
  const balanceToReceive = totalContracted - totalReceived;

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Top Bar with Search & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Carteira de Clientes & Contratantes</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerenciamento de incorporadoras, investidores e proprietários vinculados às obras.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar cliente ou CPF/CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-orange-500 w-56 sm:w-64"
            />
          </div>

          <button
            onClick={onOpenNewClient}
            className="flex items-center gap-1.5 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Cliente</span>
          </button>
        </div>
      </div>

      {/* 2-Column Split: Client List & Client Detail Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Client List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 bg-slate-50/60">
            <span>Clientes Cadastrados ({filteredClients.length})</span>
            <span className="text-[11px] text-slate-400 font-normal">Selecione para ver obras</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[620px] overflow-y-auto">
            {filteredClients.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Nenhum cliente encontrado.
              </div>
            ) : (
              filteredClients.map((client) => {
                const isSelected = client.id === selectedClientId;
                const pCount = projects.filter(p => p.clientId === client.id).length;

                return (
                  <button
                    key={client.id}
                    onClick={() => setSelectedClientId(client.id)}
                    className={`w-full text-left p-4 transition-colors flex flex-col gap-1.5 ${
                      isSelected ? 'bg-orange-50/60 border-l-2 border-orange-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {client.name}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 shrink-0">
                        {pCount} obra{pCount !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {client.companyName && (
                      <span className="text-[11px] text-slate-600 truncate block">
                        {client.companyName}
                      </span>
                    )}

                    {/* Unboxed metadata line */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                      <span>{client.document}</span>
                      <span aria-hidden="true">·</span>
                      <span>{client.phone}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Client Deep Dossier (7 cols) */}
        {selectedClient ? (
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-xs">
            {/* Header info */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedClient.name}
                </h3>
                {selectedClient.companyName && (
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    {selectedClient.companyName}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 flex-wrap font-mono">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    {selectedClient.document}
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {selectedClient.phone}
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {selectedClient.email}
                  </span>
                </div>
                {selectedClient.address && (
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {selectedClient.address}
                  </p>
                )}
              </div>

              <button
                onClick={onOpenNewProject}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Vincular Nova Obra</span>
              </button>
            </div>

            {/* Financial Overview for this client */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                  Valor Total Contratado
                </span>
                <span className="text-sm font-bold font-mono tabular-nums text-slate-900 mt-1 block">
                  R$ {totalContracted.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="bg-emerald-50/50 p-3.5 rounded-lg border border-emerald-200">
                <span className="text-[11px] font-medium text-emerald-800 uppercase tracking-wider block">
                  Total Recebido (Medições)
                </span>
                <span className="text-sm font-bold font-mono tabular-nums text-emerald-900 mt-1 block">
                  R$ {totalReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                  Saldo a Faturar
                </span>
                <span className="text-sm font-bold font-mono tabular-nums text-slate-900 mt-1 block">
                  R$ {balanceToReceive.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Contracted Projects List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Empreendimentos & Obras em Andamento ({clientProjects.length})
              </h4>

              {clientProjects.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-lg text-center text-xs text-slate-500 border border-dashed border-slate-200">
                  Nenhuma obra vinculada a este cliente ainda.
                </div>
              ) : (
                <div className="space-y-2">
                  {clientProjects.map((p) => (
                    <div 
                      key={p.id}
                      className="p-4 rounded-lg border border-slate-200 hover:border-orange-300 transition-colors bg-white flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-orange-600 shrink-0" />
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {p.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            ({p.code})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1 font-mono">
                          <span>{p.city} - {p.state}</span>
                          <span aria-hidden="true">·</span>
                          <span>Área: {p.builtAreaM2} m²</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-700 font-semibold">
                            Contrato: R$ {p.contractValue.toLocaleString('pt-BR')}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveProjectId(p.id)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-orange-600 hover:text-white text-slate-700 text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1 shrink-0"
                      >
                        <span>Ver no Cronograma</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Measurement Incomes Ledger */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Histórico de Medições e Pagamentos
              </h4>

              {clientIncomes.length === 0 ? (
                <p className="text-xs text-slate-400">Nenhum pagamento registrado para as obras deste cliente.</p>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs">
                  {clientIncomes.map((inc) => (
                    <div key={inc.id} className="p-3 bg-white flex items-center justify-between gap-3">
                      <div>
                        <span className="font-semibold text-slate-900 block">{inc.description}</span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {inc.category} · {inc.date}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-emerald-700 tabular-nums">
                        + R$ {inc.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
            Selecione um cliente para exibir o dossiê completo.
          </div>
        )}
      </div>
    </div>
  );
};
