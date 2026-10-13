import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  CheckCircle, 
  Plus, 
  Truck, 
  DollarSign, 
  Clock, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { SupplierRFQ, VendorQuoteOption, MaterialUnit } from '../types/crm';

export const RFQQuotesView: React.FC = () => {
  const { activeProject, rfqs, addRFQ, approveRFQQuote } = useCRM();
  const [selectedRFQId, setSelectedRFQId] = useState<string>('');
  const [isNewRFQModalOpen, setIsNewRFQModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const projectRFQs = useMemo(() => {
    if (!activeProject) return [];
    return rfqs.filter(r => r.projectId === activeProject.id);
  }, [rfqs, activeProject]);

  const activeRFQ = useMemo(() => {
    if (selectedRFQId) {
      return projectRFQs.find(r => r.id === selectedRFQId) || projectRFQs[0] || null;
    }
    return projectRFQs[0] || null;
  }, [projectRFQs, selectedRFQId]);

  // Form state for New RFQ
  const [title, setTitle] = useState('');
  const [materialName, setMaterialName] = useState('');
  const [quantity, setQuantity] = useState(200);
  const [unit, setUnit] = useState<MaterialUnit>('sacos');
  const [vendor1Name, setVendor1Name] = useState('Votorantim Cimentos');
  const [vendor1Price, setVendor1Price] = useState(38.50);
  const [vendor1Days, setVendor1Days] = useState(3);
  const [vendor1Terms, setVendor1Terms] = useState('28 dias');

  const [vendor2Name, setVendor2Name] = useState('InterCement Brasil');
  const [vendor2Price, setVendor2Price] = useState(40.00);
  const [vendor2Days, setVendor2Days] = useState(2);
  const [vendor2Terms, setVendor2Terms] = useState('30 dias');

  const handleCreateRFQ = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !title || !materialName) return;

    const v1Total = quantity * vendor1Price;
    const v2Total = quantity * vendor2Price;

    const quotes: VendorQuoteOption[] = [
      {
        vendorId: `v-${Date.now()}-1`,
        vendorName: vendor1Name,
        unitPrice: Number(vendor1Price),
        totalPrice: v1Total,
        deliveryDays: Number(vendor1Days),
        paymentTerms: vendor1Terms,
        freightType: 'CIF (Incluso)',
        isBestPrice: v1Total <= v2Total,
        isRecommended: v1Total <= v2Total,
      },
      {
        vendorId: `v-${Date.now()}-2`,
        vendorName: vendor2Name,
        unitPrice: Number(vendor2Price),
        totalPrice: v2Total,
        deliveryDays: Number(vendor2Days),
        paymentTerms: vendor2Terms,
        freightType: 'CIF (Incluso)',
        isBestPrice: v2Total < v1Total,
        isRecommended: v2Total < v1Total,
      }
    ];

    addRFQ({
      projectId: activeProject.id,
      title,
      materialName,
      quantity: Number(quantity),
      unit,
      requestedDate: new Date().toISOString().split('T')[0],
      status: 'cotacao',
      quotes,
    });

    setIsNewRFQModalOpen(false);
    showToast('Mapa de Cotação criado com sucesso!');
  };

  const handleApprove = (rfqId: string, vendorId: string, vendorName: string) => {
    approveRFQQuote(rfqId, vendorId);
    showToast(`Cotação de ${vendorName} aprovada! Pedido de compra gerado no fluxo de materiais.`);
  };

  if (!activeProject) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs">
        Selecione uma obra para acessar o Mapa de Cotações.
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
              Mapa de Cotações & Comparativo de Fornecedores
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-50 text-orange-700 font-semibold border border-orange-200">
              Tomadas de Preço
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare propostas concorrentes por preço unitário, frete CIF/FOB e prazo de entrega antes de emitir a ordem de compra.
          </p>
        </div>

        <button
          onClick={() => setIsNewRFQModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova Tomada de Preço</span>
        </button>
      </div>

      {/* Main Grid: RFQ Selector & Comparative Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* RFQ List (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 bg-slate-50/60">
            <span>Cotações da Obra ({projectRFQs.length})</span>
            <span className="text-[11px] text-slate-400 font-normal">Selecione para comparar</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {projectRFQs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Nenhuma tomada de preço registrada nesta obra.
              </div>
            ) : (
              projectRFQs.map((rfq) => {
                const isSelected = activeRFQ?.id === rfq.id;
                const isApproved = rfq.status === 'aprovado';

                return (
                  <button
                    key={rfq.id}
                    onClick={() => setSelectedRFQId(rfq.id)}
                    className={`w-full text-left p-3.5 transition-colors flex flex-col gap-1 ${
                      isSelected ? 'bg-orange-50/60 border-l-2 border-orange-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {rfq.title}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold shrink-0 ${
                        isApproved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {isApproved ? 'Aprovado' : 'Em Cotação'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                      <span>{rfq.quantity} {rfq.unit}</span>
                      <span aria-hidden="true">·</span>
                      <span>{rfq.quotes.length} fornecedores concorrentes</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Comparative Matrix (8 cols) */}
        {activeRFQ ? (
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-xs">
            {/* Header info */}
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{activeRFQ.title}</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Item: <strong>{activeRFQ.materialName}</strong> · Volume solicitado: <strong>{activeRFQ.quantity} {activeRFQ.unit}</strong>
                </p>
              </div>

              <span className={`text-xs font-semibold px-2.5 py-1 rounded-md self-start sm:self-auto ${
                activeRFQ.status === 'aprovado' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                {activeRFQ.status === 'aprovado' ? '✓ Pedido de Compra Emitido' : 'Aguardando Aprovação da Engenharia'}
              </span>
            </div>

            {/* Vendor Cards Comparison Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeRFQ.quotes.map((quote) => {
                const isSelectedQuote = activeRFQ.selectedVendorId === quote.vendorId;

                return (
                  <div
                    key={quote.vendorId}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                      quote.isBestPrice
                        ? 'border-orange-500 bg-orange-50/20 shadow-xs'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-xs text-slate-900 block">
                          {quote.vendorName}
                        </span>
                        {quote.isBestPrice && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-600 text-white font-semibold shrink-0">
                            Menor Preço
                          </span>
                        )}
                      </div>

                      {/* Pricing block */}
                      <div className="space-y-1">
                        <div className="text-[11px] text-slate-500">
                          Preço Unitário:
                        </div>
                        <div className="font-mono text-base font-bold text-slate-900 tabular-nums">
                          R$ {quote.unitPrice.toFixed(2)} / {activeRFQ.unit}
                        </div>
                        <div className="text-xs font-mono font-semibold text-slate-700 tabular-nums">
                          Total: R$ {quote.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>

                      {/* Terms */}
                      <div className="space-y-1 text-[11px] text-slate-600 border-t border-slate-100 pt-2 font-mono">
                        <div>Prazo de Entrega: <strong>{quote.deliveryDays} dias úteis</strong></div>
                        <div>Pagamento: <strong>{quote.paymentTerms}</strong></div>
                        <div>Frete: <strong>{quote.freightType}</strong></div>
                        {quote.notes && (
                          <p className="text-[10px] text-slate-500 italic mt-1 font-sans">{quote.notes}</p>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 mt-2 border-t border-slate-100">
                      {activeRFQ.status === 'aprovado' ? (
                        isSelectedQuote ? (
                          <span className="w-full py-1.5 bg-emerald-100 text-emerald-800 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            Fornecedor Vencedor
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 block text-center italic">
                            Não selecionado
                          </span>
                        )
                      ) : (
                        <button
                          onClick={() => handleApprove(activeRFQ.id, quote.vendorId, quote.vendorName)}
                          className={`w-full py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs ${
                            quote.isBestPrice
                              ? 'bg-orange-600 hover:bg-orange-700 text-white'
                              : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                        >
                          <span>Aprovar & Comprar</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
            Selecione uma tomada de preço para comparar as propostas.
          </div>
        )}
      </div>

      {/* Modal: New RFQ */}
      {isNewRFQModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                Abrir Nova Tomada de Preço (Cotação)
              </h3>
              <button onClick={() => setIsNewRFQModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRFQ} className="space-y-4 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Título da Cotação *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Cotação 300 sacos Cimento CP II para laje"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="font-medium text-slate-700 block mb-1">Material / Insumo *</label>
                  <input
                    type="text"
                    required
                    value={materialName}
                    onChange={(e) => setMaterialName(e.target.value)}
                    placeholder="Ex: Cimento Portland CP II-Z-32"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Quantidade e Unidade *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Vendor 1 */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">Proposta Fornecedor A:</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Nome Fornecedor A"
                    value={vendor1Name}
                    onChange={(e) => setVendor1Name(e.target.value)}
                    className="p-1.5 bg-white border border-slate-200 rounded text-slate-900"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Preço Unitário (R$)"
                    value={vendor1Price}
                    onChange={(e) => setVendor1Price(Number(e.target.value))}
                    className="p-1.5 bg-white border border-slate-200 rounded text-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* Vendor 2 */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">Proposta Fornecedor B:</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Nome Fornecedor B"
                    value={vendor2Name}
                    onChange={(e) => setVendor2Name(e.target.value)}
                    className="p-1.5 bg-white border border-slate-200 rounded text-slate-900"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Preço Unitário (R$)"
                    value={vendor2Price}
                    onChange={(e) => setVendor2Price(Number(e.target.value))}
                    className="p-1.5 bg-white border border-slate-200 rounded text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewRFQModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Cadastrar Tomada de Preço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
