import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType } from '../types/finance';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, DEFAULT_ACCOUNTS } from '../data/categories';
import { formatRupiah, getTodayDateString } from '../utils/formatters';
import { X, Plus, Check, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  initialTransaction?: Transaction | null;
}

export const TransactionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  initialTransaction,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('Makanan & Minuman');
  const [account, setAccount] = useState<string>('BCA');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialTransaction) {
      setType(initialTransaction.type);
      setAmount(initialTransaction.amount.toString());
      setCategory(initialTransaction.category);
      setAccount(initialTransaction.account);
      setDate(initialTransaction.date);
      setNote(initialTransaction.note || '');
    } else {
      setType('expense');
      setAmount('');
      setCategory('Makanan & Minuman');
      setAccount('BCA');
      setDate(getTodayDateString());
      setNote('');
    }
    setError(null);
  }, [initialTransaction, isOpen]);

  // Handle changing type - update category to default for that type
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'expense') {
      setCategory(EXPENSE_CATEGORIES[0].name);
    } else {
      setCategory(INCOME_CATEGORIES[0].name);
    }
  };

  const handleQuickAdd = (additional: number) => {
    const current = parseFloat(amount.replace(/[^0-9]/g, '')) || 0;
    setAmount((current + additional).toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseFloat(amount.replace(/[^0-9]/g, ''));
    if (!cleanAmount || isNaN(cleanAmount) || cleanAmount <= 0) {
      setError('Masukkan nominal transaksi yang valid (lebih dari 0).');
      return;
    }
    if (!category.trim()) {
      setError('Pilih kategori transaksi.');
      return;
    }
    if (!date) {
      setError('Pilih tanggal transaksi.');
      return;
    }

    onSave({
      type,
      amount: cleanAmount,
      category,
      account,
      date,
      note: note.trim(),
    });

    onClose();
  };

  if (!isOpen) return null;

  const currentCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const numericAmount = parseFloat(amount.replace(/[^0-9]/g, '')) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">
            {initialTransaction ? 'Edit Transaksi' : 'Catat Transaksi Baru'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Type Selector (Pengeluaran vs Pemasukan) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
                type === 'expense'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownCircle className="w-4 h-4" />
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
                type === 'income'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpCircle className="w-4 h-4" />
              Pemasukan
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nominal (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">
                Rp
              </span>
              <input
                type="number"
                placeholder="0"
                min="1"
                step="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono tabular-nums text-lg font-bold focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
                autoFocus
                required
              />
            </div>
            {numericAmount > 0 && (
              <p className="text-xs text-slate-500 mt-1 font-mono">
                Terbaca: <span className="font-semibold text-slate-700">{formatRupiah(numericAmount)}</span>
              </p>
            )}

            {/* Quick nominal buttons */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] text-slate-400 mr-1">Cepat:</span>
              {[20000, 50000, 100000, 500000, 1000000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAdd(val)}
                  className="px-2 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors font-mono"
                >
                  +{val >= 1000000 ? `${val / 1000000}jt` : `${val / 1000}rb`}
                </button>
              ))}
            </div>
          </div>

          {/* Category & Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {currentCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Akun / Dompet
              </label>
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {DEFAULT_ACCOUNTS.map((acc) => (
                  <option key={acc} value={acc}>
                    {acc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Tanggal
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Catatan / Deskripsi (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Makan siang bareng tim"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-xs font-semibold text-white rounded-lg transition-colors flex items-center gap-1.5 ${
                type === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <Check className="w-4 h-4" />
              {initialTransaction ? 'Perbarui Transaksi' : 'Simpan Transaksi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
