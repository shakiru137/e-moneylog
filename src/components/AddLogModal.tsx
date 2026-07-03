import React, { useState } from 'react';
import { LogEntry, LedgerType } from '../types';
import { CATEGORIES } from '../utils/formatters';
import { X, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface AddLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLedger: LedgerType;
  onAddLog: (log: Omit<LogEntry, 'id' | 'userId'>) => void;
}

export const AddLogModal: React.FC<AddLogModalProps> = ({
  isOpen,
  onClose,
  activeLedger,
  onAddLog,
}) => {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    onAddLog({
      amount: parseFloat(amount),
      type,
      category,
      description: description || `${type === 'income' ? 'Cash Received' : 'Cash Paid'} - ${category}`,
      source: 'manual',
      ledgerType: activeLedger,
      date,
    });

    setAmount('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden text-gray-800 p-5 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <h3 className="font-bold text-sm text-gray-900">Add Manual Cash Entry</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {/* Income vs Expense Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg border border-gray-200">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-1.5 rounded-md text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Cash Out (Expense)</span>
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-1.5 rounded-md text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Cash In (Income)</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Amount in Naira (₦) *
            </label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 5000"
              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm font-mono font-bold text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Description / Notes
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Spent on fuel for store generator"
              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-md shadow-xs transition-colors"
            >
              Save Entry
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
