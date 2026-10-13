import React, { useState } from 'react';
import { Budget, CategoryBreakdownItem } from '../types/finance';
import { EXPENSE_CATEGORIES } from '../data/categories';
import { formatRupiah, formatCompactRupiah } from '../utils/formatters';
import { Target, AlertTriangle, CheckCircle2, ShieldAlert, Plus, Trash2 } from 'lucide-react';

interface Props {
  budgets: Budget[];
  categoryBreakdown: CategoryBreakdownItem[];
  monthLabel: string;
  onUpdateBudget: (category: string, limit: number) => void;
  onDeleteBudget: (category: string) => void;
}

export const BudgetManager: React.FC<Props> = ({
  budgets,
  categoryBreakdown,
  monthLabel,
  onUpdateBudget,
  onDeleteBudget,
}) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [inputLimit, setInputLimit] = useState<string>('');
  const [newCat, setNewCat] = useState<string>(EXPENSE_CATEGORIES[0].name);
  const [newLimit, setNewLimit] = useState<string>('1000000');
  const [showAddForm, setShowAddForm] = useState(false);

  // Map category spent
  const spentMap = new Map<string, number>();
  categoryBreakdown.forEach((c) => spentMap.set(c.category, c.amount));

  const totalBudget = budgets.reduce((acc, b) => acc + b.monthlyLimit, 0);
  const totalSpentInBudgeted = budgets.reduce(
    (acc, b) => acc + (spentMap.get(b.category) || 0),
    0
  );
  const overallPercent = totalBudget > 0 ? Math.round((totalSpentInBudgeted / totalBudget) * 100) : 0;

  const handleStartEdit = (b: Budget) => {
    setEditingCategory(b.category);
    setInputLimit(b.monthlyLimit.toString());
  };

  const handleSaveEdit = (category: string) => {
    const val = parseFloat(inputLimit.replace(/[^0-9]/g, ''));
    if (val && val > 0) {
      onUpdateBudget(category, val);
    }
    setEditingCategory(null);
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newLimit.replace(/[^0-9]/g, ''));
    if (val && val > 0) {
      onUpdateBudget(newCat, val);
      setShowAddForm(false);
      setNewLimit('1000000');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" />
            Manajemen Anggaran Bulanan
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Kendalikan pengeluaran agar tidak melebihi batas yang direncanakan untuk {monthLabel}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          {showAddForm ? 'Tutup Form' : 'Atur Batas Anggaran'}
        </button>
      </div>

      {/* Overall Budget Progress */}
      <div className="bg-slate-50 rounded-lg p-4 my-4 border border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs mb-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Total Realisasi Anggaran:</span>
            <span className="font-mono tabular-nums text-slate-700">
              {formatRupiah(totalSpentInBudgeted)} dari {formatRupiah(totalBudget)}
            </span>
          </div>
          <div className="font-mono font-semibold">
            {overallPercent <= 80 ? (
              <span className="text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Terpakai {overallPercent}% (Aman)
              </span>
            ) : overallPercent <= 100 ? (
              <span className="text-amber-700 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Terpakai {overallPercent}% (Waspada)
              </span>
            ) : (
              <span className="text-rose-700 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Terpakai {overallPercent}% (Melebihi Target)
              </span>
            )}
          </div>
        </div>

        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-300 ${
              overallPercent > 100
                ? 'bg-rose-500'
                : overallPercent > 80
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(overallPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Add new budget mini form */}
      {showAddForm && (
        <form
          onSubmit={handleAddNew}
          className="p-3 mb-4 bg-indigo-50/50 rounded-lg border border-indigo-200 flex flex-wrap items-end gap-3 text-xs"
        >
          <div className="flex-1 min-w-[160px]">
            <label className="block text-slate-700 font-medium mb-1">Kategori</label>
            <select
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md"
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-slate-700 font-medium mb-1">Batas Maksimal (Rp)</label>
            <input
              type="number"
              min="10000"
              step="50000"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shrink-0"
          >
            Simpan Anggaran
          </button>
        </form>
      )}

      {/* Budgets List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {budgets.map((b) => {
          const spent = spentMap.get(b.category) || 0;
          const pct = Math.round((spent / b.monthlyLimit) * 100);
          const remaining = b.monthlyLimit - spent;
          const isOver = remaining < 0;
          const isEditing = editingCategory === b.category;

          return (
            <div
              key={b.category}
              className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-all"
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-900">{b.category}</span>
                <div className="flex items-center gap-1">
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={inputLimit}
                        onChange={(e) => setInputLimit(e.target.value)}
                        className="w-24 px-1.5 py-0.5 text-xs border rounded font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(b.category)}
                        className="text-[11px] px-2 py-0.5 bg-slate-900 text-white rounded"
                      >
                        OK
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStartEdit(b)}
                      className="text-slate-400 hover:text-slate-700 text-[11px]"
                    >
                      Ubah Limit
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onDeleteBudget(b.category)}
                    className="p-1 text-slate-300 hover:text-rose-500 rounded"
                    title="Hapus Anggaran"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-baseline justify-between text-xs my-1">
                <span className="text-slate-500 font-mono tabular-nums">
                  {formatRupiah(spent)}{' '}
                  <span className="text-slate-400">/ {formatCompactRupiah(b.monthlyLimit)}</span>
                </span>
                <span
                  className={`font-semibold font-mono tabular-nums ${
                    isOver
                      ? 'text-rose-600'
                      : pct > 80
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {pct}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isOver ? 'bg-rose-500' : pct > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>

              <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
                <span>
                  {isOver ? 'Kelebihan anggaran:' : 'Sisa kuota belanja:'}
                </span>
                <span
                  className={`font-mono font-medium tabular-nums ${
                    isOver ? 'text-rose-600' : 'text-slate-700'
                  }`}
                >
                  {formatRupiah(Math.abs(remaining))}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
