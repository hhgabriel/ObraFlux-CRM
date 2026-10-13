import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { ExpenseCategory, IncomeCategory } from '../types/crm';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({ isOpen, onClose }) => {
  const { activeProject, addFinancialRecord } = useCRM();

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState(25000);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('Materiais de Construção');

  if (!isOpen || !activeProject) return null;

  const expenseCategories: ExpenseCategory[] = [
    'Materiais de Construção',
    'Mão de Obra Direta',
    'Equipamentos & Locação',
    'Serviços Terceirizados',
    'Projetos, Taxas & Licenças',
    'Administração & Canteiro'
  ];

  const incomeCategories: IncomeCategory[] = [
    'Medição de Obra',
    'Entrada Contratual',
    'Aditivo de Projeto',
    'Financiamento Imobiliário'
  ];

  const handleTypeChange = (newType: 'expense' | 'income') => {
    setType(newType);
    setCategory(newType === 'expense' ? 'Materiais de Construção' : 'Medição de Obra');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || amount <= 0) return;

    addFinancialRecord({
      projectId: activeProject.id,
      type,
      category: category as any,
      amount: Number(amount),
      date,
      description,
      paymentStatus: 'paid',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-orange-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Novo Lançamento Financeiro
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Type selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 text-xs font-semibold rounded-md transition-all ${
                type === 'expense' ? 'bg-white text-red-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Despesa / Custo
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 text-xs font-semibold rounded-md transition-all ${
                type === 'income' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Receita / Medição
            </button>
          </div>

          <div>
            <label className="font-medium text-slate-700 block mb-1">Categoria Contábil</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500"
            >
              {type === 'expense'
                ? expenseCategories.map(c => <option key={c} value={c}>{c}</option>)
                : incomeCategories.map(c => <option key={c} value={c}>{c}</option>)
              }
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-slate-700 block mb-1">Valor (R$) *</label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="font-medium text-slate-700 block mb-1">Data de Realização</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="font-medium text-slate-700 block mb-1">Descrição do Pagamento / Medição *</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Medição 03 - Alvenaria e Elétrica aprovadas pelo fiscal"
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
              Salvar Lançamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
