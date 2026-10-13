import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types/finance';
import { formatRupiah, formatTanggalIndo } from '../utils/formatters';
import { getCategoryColor } from '../data/categories';
import { Search, Filter, Edit2, Trash2, ArrowDownLeft, ArrowUpRight, Plus, SlidersHorizontal } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

export const TransactionList: React.FC<Props> = ({
  transactions,
  onEdit,
  onDelete,
  onAddNew,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Extract distinct accounts
  const availableAccounts = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => set.add(t.account));
    return Array.from(set);
  }, [transactions]);

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Search
        if (searchTerm.trim()) {
          const matchNote = (t.note || '').toLowerCase().includes(searchTerm.toLowerCase());
          const matchCat = t.category.toLowerCase().includes(searchTerm.toLowerCase());
          const matchAcc = t.account.toLowerCase().includes(searchTerm.toLowerCase());
          if (!matchNote && !matchCat && !matchAcc) return false;
        }

        // Type
        if (typeFilter !== 'all' && t.type !== typeFilter) {
          return false;
        }

        // Account
        if (accountFilter !== 'all' && t.account !== accountFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt.localeCompare(a.createdAt);
        }
        if (sortBy === 'date-asc') {
          return new Date(a.date).getTime() - new Date(b.date).getTime() || a.createdAt.localeCompare(b.createdAt);
        }
        if (sortBy === 'amount-desc') {
          return b.amount - a.amount;
        }
        if (sortBy === 'amount-asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [transactions, searchTerm, typeFilter, accountFilter, sortBy]);

  const handleDeleteClick = (id: string) => {
    if (confirmDeleteId === id) {
      onDelete(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Controls Bar */}
      <div className="p-4 border-b border-slate-100 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari transaksi, kategori, atau catatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all text-slate-800"
            />
          </div>

          {/* Quick Add CTA */}
          <button
            type="button"
            onClick={onAddNew}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Transaksi
          </button>
        </div>

        {/* Filters and Sorts */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Type tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                  typeFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({transactions.length})
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('expense')}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                  typeFilter === 'expense'
                    ? 'bg-white text-rose-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('income')}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                  typeFilter === 'income'
                    ? 'bg-white text-emerald-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pemasukan
              </button>
            </div>

            {/* Account filter */}
            {availableAccounts.length > 1 && (
              <select
                value={accountFilter}
                onChange={(e) => setAccountFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs focus:outline-none"
              >
                <option value="all">Semua Akun / Dompet</option>
                {availableAccounts.map((acc) => (
                  <option key={acc} value={acc}>
                    {acc}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-1.5 text-slate-500">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs focus:outline-none"
            >
              <option value="date-desc">Tanggal: Terbaru</option>
              <option value="date-asc">Tanggal: Terlama</option>
              <option value="amount-desc">Nominal: Terbesar</option>
              <option value="amount-asc">Nominal: Terkecil</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {filteredTransactions.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-sm font-medium text-slate-600">Tidak ada transaksi ditemukan</p>
          <p className="text-xs text-slate-400 mt-1">
            {searchTerm || typeFilter !== 'all' || accountFilter !== 'all'
              ? 'Coba atur ulang kata kunci atau filter pencarian Anda.'
              : 'Mulai dengan menambahkan transaksi pertama Anda.'}
          </p>
          <button
            type="button"
            onClick={onAddNew}
            className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Catat Transaksi Pertama
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-4">Tanggal & Catatan</th>
                <th className="py-2.5 px-4">Kategori</th>
                <th className="py-2.5 px-4">Akun</th>
                <th className="py-2.5 px-4 text-right">Nominal</th>
                <th className="py-2.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredTransactions.map((tx) => {
                const isExpense = tx.type === 'expense';
                const catColor = getCategoryColor(tx.category);

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    {/* Date & Note */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isExpense
                              ? 'bg-rose-50 text-rose-600'
                              : 'bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          {isExpense ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 line-clamp-1">
                            {tx.note || tx.category}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {formatTanggalIndo(tx.date)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: catColor }}
                        />
                        <span className="font-medium text-slate-800">{tx.category}</span>
                      </div>
                    </td>

                    {/* Account */}
                    <td className="py-3 px-4">
                      <span className="text-slate-600">{tx.account}</span>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`font-semibold font-mono tabular-nums text-sm ${
                          isExpense ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {isExpense ? '-' : '+'}
                        {formatRupiah(tx.amount)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onEdit(tx)}
                          title="Edit"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(tx.id)}
                          title={confirmDeleteId === tx.id ? 'Klik sekali lagi untuk hapus' : 'Hapus'}
                          className={`p-1.5 rounded-md transition-colors ${
                            confirmDeleteId === tx.id
                              ? 'bg-rose-100 text-rose-700 ring-1 ring-rose-400'
                              : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
