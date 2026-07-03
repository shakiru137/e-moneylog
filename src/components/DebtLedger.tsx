import React, { useState } from 'react';
import { DebtEntry, LedgerType, UserProfile } from '../types';
import { formatNaira, createWhatsAppReminderLink } from '../utils/formatters';
import { Plus, MessageSquare, CheckCircle, Clock, Send, UserCheck, X, Search, PhoneCall, ArrowUpRight, ArrowDownLeft, ShieldAlert } from 'lucide-react';

interface DebtLedgerProps {
  debts: DebtEntry[];
  activeLedger: LedgerType;
  user: UserProfile;
  onAddDebt: (debt: Omit<DebtEntry, 'id' | 'userId' | 'createdAt' | 'whatsappReminderCount'>) => void;
  onUpdatePayment: (id: string, additionalAmount: number) => void;
  onDeleteDebt: (id: string) => void;
}

export const DebtLedger: React.FC<DebtLedgerProps> = ({
  debts,
  activeLedger,
  user,
  onAddDebt,
  onUpdatePayment,
  onDeleteDebt,
}) => {
  const [activeTab, setActiveTab] = useState<'debtor' | 'creditor'>('debtor'); // debtor = owes me; creditor = I owe
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Partial payment payment modal state
  const [payModalDebt, setPayModalDebt] = useState<DebtEntry | null>(null);
  const [paymentAmountInput, setPaymentAmountInput] = useState('');

  // Add Debt Form State
  const [personName, setPersonName] = useState('');
  const [personPhone, setPersonPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [debtType, setDebtType] = useState<'debtor' | 'creditor'>('debtor');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  const filteredDebts = debts
    .filter((d) => d.ledgerType === activeLedger && d.type === activeTab)
    .filter(
      (d) =>
        d.personName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const totalOwedToMe = debts
    .filter((d) => d.ledgerType === activeLedger && d.type === 'debtor' && d.status !== 'paid')
    .reduce((acc, curr) => acc + (curr.amount - curr.paidAmount), 0);

  const totalIOwe = debts
    .filter((d) => d.ledgerType === activeLedger && d.type === 'creditor' && d.status !== 'paid')
    .reduce((acc, curr) => acc + (curr.amount - curr.paidAmount), 0);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName || !amount) return;

    onAddDebt({
      personName,
      personPhone: personPhone || '+234 800 000 0000',
      amount: parseFloat(amount),
      paidAmount: 0,
      type: debtType,
      description: description || 'General Transaction',
      dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'pending',
      ledgerType: activeLedger,
    });

    // Reset
    setPersonName('');
    setPersonPhone('');
    setAmount('');
    setDescription('');
    setDueDate('');
    setIsAddModalOpen(false);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModalDebt || !paymentAmountInput) return;

    onUpdatePayment(payModalDebt.id, parseFloat(paymentAmountInput));
    setPayModalDebt(null);
    setPaymentAmountInput('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Cards Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Money Owed To You (Debtors) */}
        <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
              <ArrowDownLeft className="w-4 h-4" />
              <span>Owo Debts (Money Owed to You)</span>
            </div>
            <h4 className="text-2xl font-black text-gray-900">
              {formatNaira(totalOwedToMe)}
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              {debts.filter((d) => d.ledgerType === activeLedger && d.type === 'debtor' && d.status !== 'paid').length} active debtor(s)
            </p>
          </div>
          <button
            onClick={() => {
              setDebtType('debtor');
              setIsAddModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs flex items-center space-x-1 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Record Debtor</span>
          </button>
        </div>

        {/* Money You Owe (Creditors) */}
        <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-rose-600 text-xs font-bold uppercase tracking-wider mb-1">
              <ArrowUpRight className="w-4 h-4" />
              <span>Money You Owe (Creditors)</span>
            </div>
            <h4 className="text-2xl font-black text-gray-900">
              {formatNaira(totalIOwe)}
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              {debts.filter((d) => d.ledgerType === activeLedger && d.type === 'creditor' && d.status !== 'paid').length} active supplier(s)
            </p>
          </div>
          <button
            onClick={() => {
              setDebtType('creditor');
              setIsAddModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-rose-700 border border-gray-200 text-xs font-semibold shadow-xs flex items-center space-x-1 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Record Creditor</span>
          </button>
        </div>

      </div>

      {/* Navigation Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
        
        {/* Tabs */}
        <div className="flex items-center p-1 bg-gray-100 rounded-lg border border-gray-200 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('debtor')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'debtor'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            People Owing Me (Debtors)
          </button>
          <button
            onClick={() => setActiveTab('creditor')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'creditor'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            People I Owe (Creditors)
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search person or item..."
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
          />
        </div>

      </div>

      {/* Debt Cards List */}
      {filteredDebts.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-dashed border-gray-300 text-gray-500 text-xs space-y-2">
          <UserCheck className="w-8 h-8 mx-auto text-gray-400" />
          <p className="font-semibold text-gray-700">
            No {activeTab === 'debtor' ? 'debtors' : 'creditors'} logged in this book.
          </p>
          <p className="text-gray-400 text-[11px]">
            All clear! Tap "Record {activeTab === 'debtor' ? 'Debtor' : 'Creditor'}" to add an entry.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDebts.map((item) => {
            const remaining = item.amount - item.paidAmount;
            const progress = Math.min(100, Math.round((item.paidAmount / item.amount) * 100));

            return (
              <div
                key={item.id}
                className="p-4 bg-white border border-gray-200 hover:border-emerald-500/50 rounded-xl shadow-xs space-y-3 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{item.personName}</h4>
                    <p className="text-[11px] text-gray-500 font-mono flex items-center space-x-1 mt-0.5">
                      <PhoneCall className="w-3 h-3 text-gray-400" />
                      <span>{item.personPhone}</span>
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                      item.status === 'paid'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : item.status === 'partially_paid'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1.5">
                  <p className="text-xs text-gray-700 line-clamp-1">{item.description}</p>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[11px] text-gray-500">Total Amount:</span>
                    <span className="font-bold text-gray-900">{formatNaira(item.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] text-gray-500">Paid:</span>
                    <span className="font-semibold text-emerald-600">{formatNaira(item.paidAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[11px] text-amber-700">Balance Due:</span>
                    <span className="text-amber-800">{formatNaira(remaining)}</span>
                  </div>

                  {/* Payment Progress Bar */}
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span>Due: {item.dueDate}</span>
                  </span>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-1.5">
                    {/* Record Partial Payment */}
                    {item.status !== 'paid' && (
                      <button
                        onClick={() => {
                          setPayModalDebt(item);
                          setPaymentAmountInput('');
                        }}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded border border-emerald-200 transition-colors text-[11px]"
                      >
                        Log Pay
                      </button>
                    )}

                    {/* WhatsApp Reminder Button */}
                    {item.type === 'debtor' && item.status !== 'paid' && (
                      <a
                        href={createWhatsAppReminderLink(item, user)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded shadow-xs flex items-center space-x-1 transition-colors text-[11px]"
                        title="Send WhatsApp Payment Reminder"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => onDeleteDebt(item.id)}
                      className="p-1 text-gray-400 hover:text-rose-600 transition-colors"
                      title="Delete entry"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add Debt / Creditor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden text-gray-800">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-bold text-sm text-gray-900">
                Record New {debtType === 'debtor' ? 'Debtor (Money Owed to You)' : 'Creditor (Money You Owe)'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Person / Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="e.g. Chief Emeka or Mama Blessing Stores"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  WhatsApp Phone Number
                </label>
                <input
                  type="text"
                  value={personPhone}
                  onChange={(e) => setPersonPhone(e.target.value)}
                  placeholder="e.g. +234 802 123 4567"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Amount (₦) *
                  </label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 35000"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Item / Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Lace material bought on credit"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-md shadow-xs transition-colors"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Partial/Full Modal */}
      {payModalDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-sm bg-white border border-gray-200 rounded-xl shadow-xl p-5 space-y-4 text-gray-800">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-gray-900">Record Payment Received</h4>
              <button onClick={() => setPayModalDebt(null)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              {payModalDebt.personName} owes balance of{' '}
              <span className="font-bold text-emerald-600">
                {formatNaira(payModalDebt.amount - payModalDebt.paidAmount)}
              </span>
            </p>

            <form onSubmit={handlePaymentSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Payment Amount (₦)
                </label>
                <input
                  type="number"
                  required
                  value={paymentAmountInput}
                  onChange={(e) => setPaymentAmountInput(e.target.value)}
                  placeholder={`Max ${payModalDebt.amount - payModalDebt.paidAmount}`}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPayModalDebt(null)}
                  className="py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-md transition-colors"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
