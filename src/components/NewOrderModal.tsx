import React, { useState } from 'react';
import { X, Truck, Package } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { MaterialUnit } from '../types/crm';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({ isOpen, onClose }) => {
  const { activeProject, materials, addOrder } = useCRM();

  const projectMaterials = materials.filter(m => m.projectId === activeProject?.id);

  const [selectedMaterialId, setSelectedMaterialId] = useState(projectMaterials[0]?.id || '');
  const [supplier, setSupplier] = useState('');
  const [quantity, setQuantity] = useState(100);
  const [unitPrice, setUnitPrice] = useState(projectMaterials[0]?.unitPrice || 45);
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');

  if (!isOpen || !activeProject) return null;

  const currentMaterial = projectMaterials.find(m => m.id === selectedMaterialId) || projectMaterials[0];

  const handleMaterialChange = (matId: string) => {
    setSelectedMaterialId(matId);
    const found = projectMaterials.find(m => m.id === matId);
    if (found) {
      setUnitPrice(found.unitPrice);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMaterial || !supplier || quantity <= 0) return;

    addOrder({
      projectId: activeProject.id,
      materialId: currentMaterial.id,
      materialName: currentMaterial.name,
      supplier,
      quantity: Number(quantity),
      unit: currentMaterial.unit,
      unitPrice: Number(unitPrice),
      orderDate,
      expectedDeliveryDate,
      status: 'in_transit',
      notes,
    });

    onClose();
  };

  const totalPrice = quantity * unitPrice;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-orange-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Emitir Pedido de Compra de Materiais
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-medium text-slate-700 block mb-1">Insumo / Material *</label>
            <select
              value={selectedMaterialId}
              onChange={(e) => handleMaterialChange(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500"
            >
              {projectMaterials.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} (Estoque no canteiro: {m.currentStock} {m.unit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-medium text-slate-700 block mb-1">Fornecedor / Distribuidor *</label>
            <input
              type="text"
              required
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="Ex: Votorantim Cimentos, Gerdau, Distribuidora Regional"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-slate-700 block mb-1">
                Quantidade ({currentMaterial?.unit || 'un'}) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="font-medium text-slate-700 block mb-1">Preço Unitário Negociado (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                required
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
            <span className="text-slate-600 font-medium">Valor Total do Pedido:</span>
            <span className="font-mono font-bold text-sm text-slate-900">
              R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-slate-700 block mb-1">Data do Pedido</label>
              <input
                type="date"
                required
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="font-medium text-slate-700 block mb-1">Previsão de Entrega no Canteiro</label>
              <input
                type="date"
                required
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="font-medium text-slate-700 block mb-1">Observações de Logística / Descarregamento</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Exige conferência de laudo pelo mestre de obras"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500"
            />
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
              Salvar Pedido de Compra
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
