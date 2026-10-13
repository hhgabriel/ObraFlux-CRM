import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Truck, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  Search, 
  ArrowDownToLine, 
  MinusCircle, 
  Clock, 
  Building2,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { MaterialItem, MaterialOrder } from '../types/crm';
import { RFQQuotesView } from './RFQQuotesView';

interface MaterialsViewProps {
  onOpenNewOrder: () => void;
  onOpenNewMaterial?: () => void;
}

export const MaterialsView: React.FC<MaterialsViewProps> = ({ onOpenNewOrder }) => {
  const { 
    activeProject, 
    materials, 
    orders, 
    receiveOrder, 
    consumeMaterial 
  } = useCRM();

  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'orders' | 'quotes'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [consumingItem, setConsumingItem] = useState<MaterialItem | null>(null);
  const [consumeAmount, setConsumeAmount] = useState<number>(10);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const projectMaterials = useMemo(() => {
    if (!activeProject) return [];
    return materials.filter(m => m.projectId === activeProject.id);
  }, [materials, activeProject]);

  const projectOrders = useMemo(() => {
    if (!activeProject) return [];
    return orders.filter(o => o.projectId === activeProject.id);
  }, [orders, activeProject]);

  const filteredMaterials = useMemo(() => {
    return projectMaterials.filter(m => {
      const matchSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === 'all' || m.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [projectMaterials, searchTerm, selectedCategory]);

  const filteredOrders = useMemo(() => {
    return projectOrders.filter(o => {
      return o.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             o.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [projectOrders, searchTerm]);

  // Stock alerts
  const lowStockItems = projectMaterials.filter(m => m.currentStock <= m.minStock);

  const handleConfirmSiteEntry = (orderId: string, materialName: string, quantity: number, unit: string) => {
    receiveOrder(orderId);
    showToast(`Entrada confirmada! +${quantity} ${unit} de ${materialName} adicionados ao estoque da obra.`);
  };

  const handleConsumeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consumingItem || consumeAmount <= 0) return;
    consumeMaterial(consumingItem.id, consumeAmount);
    showToast(`Consumo de ${consumeAmount} ${consumingItem.unit} registrado com sucesso.`);
    setConsumingItem(null);
  };

  if (!activeProject) {
    return (
      <div className="p-8 text-center text-slate-500">
        Selecione uma obra para gerenciar o fluxo de materiais e canteiro.
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 text-xs animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Critical Stock Alert Banner if items below threshold */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-amber-900">
                Atenção: {lowStockItems.length} insumo(s) abaixo do estoque mínimo de segurança no canteiro!
              </h3>
              <p className="text-[11px] text-amber-800 mt-0.5">
                {lowStockItems.map(i => `${i.name} (Atual: ${i.currentStock} ${i.unit} / Mín: ${i.minStock} ${i.unit})`).join(' · ')}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenNewOrder}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shrink-0 transition-colors"
          >
            Fazer Pedido de Reposição
          </button>
        </div>
      )}

      {/* Top Controls & Sub-tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        {/* Interactive Segmented Switcher (allowed button tabs) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveSubTab('inventory')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeSubTab === 'inventory'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Estoque no Canteiro ({projectMaterials.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('orders')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeSubTab === 'orders'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Pedidos & Entradas ({projectOrders.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('quotes')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeSubTab === 'quotes'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Mapa de Cotações</span>
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar insumo ou fornecedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-orange-500 w-52 sm:w-64"
            />
          </div>

          <button
            onClick={onOpenNewOrder}
            className="flex items-center gap-1.5 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Pedido</span>
          </button>
        </div>
      </div>

      {/* Subtab 1: Inventory Table */}
      {activeSubTab === 'inventory' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">Catálogo de Insumos da Obra</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-slate-500">{filteredMaterials.length} itens controlados</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">Filtrar Categoria:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs py-1 px-2 border border-slate-200 rounded-md bg-slate-50 text-slate-700"
              >
                <option value="all">Todas as categorias</option>
                <option value="Agregados">Agregados</option>
                <option value="Aço & Ferragens">Aço & Ferragens</option>
                <option value="Alvenaria">Alvenaria</option>
                <option value="Argamassas & Cimentos">Argamassas & Cimentos</option>
                <option value="Elétrica">Elétrica</option>
                <option value="Hidráulica">Hidráulica</option>
                <option value="Acabamento">Acabamento</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Material / Insumo</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4 text-right">Estoque no Canteiro</th>
                  <th className="py-3 px-4 text-right">Estoque Mínimo</th>
                  <th className="py-3 px-4 text-right">Custo Unitário</th>
                  <th className="py-3 px-4 text-right">Valor em Estoque</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Nenhum material encontrado com os filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredMaterials.map((mat) => {
                    const isLow = mat.currentStock <= mat.minStock;
                    const totalVal = mat.currentStock * mat.unitPrice;

                    return (
                      <tr key={mat.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {mat.name}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {mat.category}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                          {mat.currentStock.toLocaleString('pt-BR')} <span className="text-slate-500 font-normal">{mat.unit}</span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600">
                          {mat.minStock.toLocaleString('pt-BR')} {mat.unit}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                          R$ {mat.unitPrice.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-slate-900">
                          R$ {totalVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              Crítico
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              Adequado
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setConsumingItem(mat);
                              setConsumeAmount(Math.min(10, mat.currentStock));
                            }}
                            className="px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors inline-flex items-center gap-1"
                            title="Dar baixa no estoque para uso na obra"
                          >
                            <MinusCircle className="w-3 h-3 text-slate-500" />
                            <span>Baixa / Uso</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 2: Material Orders Flow & Site Delivery Reception */}
      {activeSubTab === 'orders' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs">
            <div>
              <h3 className="font-semibold text-slate-900">Fluxo de Pedidos e Entradas no Canteiro</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Ao clicar em &ldquo;Confirmar Entrada&rdquo;, o estoque é creditado automaticamente e o custo é lançado no financeiro da obra.
              </p>
            </div>
            <button
              onClick={onOpenNewOrder}
              className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Solicitar Compra</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Pedido / Insumo</th>
                  <th className="py-3 px-4">Fornecedor</th>
                  <th className="py-3 px-4 text-right">Quantidade</th>
                  <th className="py-3 px-4 text-right">Valor Total</th>
                  <th className="py-3 px-4">Datas (Pedido / Previsão)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ação no Canteiro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Nenhum pedido de material cadastrado para esta obra.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => {
                    const isReceived = ord.status === 'received_at_site';
                    const isInTransit = ord.status === 'in_transit';

                    return (
                      <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900 block">{ord.materialName}</span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {ord.invoiceNumber || ord.id}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {ord.supplier}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-medium tabular-nums text-slate-900">
                          {ord.quantity.toLocaleString('pt-BR')} {ord.unit}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-slate-900">
                          R$ {ord.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                          <div>Ped: {ord.orderDate}</div>
                          <div className="text-slate-400">
                            {isReceived ? `Entregue: ${ord.actualDeliveryDate}` : `Prev: ${ord.expectedDeliveryDate}`}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isReceived ? (
                            <span className="text-emerald-700 font-semibold text-[11px] inline-flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              No Canteiro
                            </span>
                          ) : isInTransit ? (
                            <span className="text-blue-700 font-semibold text-[11px] inline-flex items-center gap-1">
                              <Truck className="w-3.5 h-3.5 text-blue-600" />
                              Em Trânsito
                            </span>
                          ) : (
                            <span className="text-slate-600 font-medium text-[11px] inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              Solicitado
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {isReceived ? (
                            <span className="text-[11px] text-slate-400 italic">
                              Entrada conferida
                            </span>
                          ) : (
                            <button
                              onClick={() => handleConfirmSiteEntry(ord.id, ord.materialName, ord.quantity, ord.unit)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                              title="Registrar recebimento de caminhão no canteiro"
                            >
                              <ArrowDownToLine className="w-3.5 h-3.5" />
                              <span>Confirmar Entrada</span>
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
      )}

      {/* Subtab 3: Supplier Quotes & RFQ Matrix */}
      {activeSubTab === 'quotes' && (
        <RFQQuotesView />
      )}

      {/* Modal for Consuming Material in Site Task */}
      {consumingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                Registrar Consumo / Baixa de Material
              </h3>
              <button
                onClick={() => setConsumingItem(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1">
              <p className="font-semibold text-slate-800">{consumingItem.name}</p>
              <div className="flex items-center gap-2 text-slate-500 font-mono">
                <span>Estoque disponível: {consumingItem.currentStock} {consumingItem.unit}</span>
                <span aria-hidden="true">·</span>
                <span>Mínimo: {consumingItem.minStock} {consumingItem.unit}</span>
              </div>
            </div>

            <form onSubmit={handleConsumeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">
                  Quantidade a dar baixa ({consumingItem.unit}):
                </label>
                <input
                  type="number"
                  min="1"
                  max={consumingItem.currentStock}
                  value={consumeAmount}
                  onChange={(e) => setConsumeAmount(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-sm focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setConsumingItem(null)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Confirmar Baixa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
