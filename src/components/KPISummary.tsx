import React from 'react';
import { MonthSummary } from '../types/finance';
import { formatRupiah, formatCompactRupiah, getCurrentYearMonth } from '../utils/formatters';
import { Wallet, ArrowDownRight, ArrowUpRight, PiggyBank, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface Props {
  currentSummary: MonthSummary;
  previousSummary: MonthSummary | null;
  totalBalance: number;
  selectedMonth: string;
  availableMonths: string[];
  onSelectMonth: (month: string) => void;
}

export const KPISummary: React.FC<Props> = ({
  currentSummary,
  previousSummary,
  totalBalance,
  selectedMonth,
  availableMonths,
  onSelectMonth,
}) => {
  // Navigation index
  const currentIndex = availableMonths.indexOf(selectedMonth);
  const hasNext = currentIndex > 0;
  const hasPrev = currentIndex < availableMonths.length - 1;

  const handleNextMonth = () => {
    if (hasNext) onSelectMonth(availableMonths[currentIndex - 1]);
  };

  const handlePrevMonth = () => {
    if (hasPrev) onSelectMonth(availableMonths[currentIndex + 1]);
  };

  // Delta expense calculation compared to previous month
  const prevExp = previousSummary ? previousSummary.totalExpense : 0;
  const diffExp = currentSummary.totalExpense - prevExp;
  const expPercentChange = prevExp > 0 ? Math.round((diffExp / prevExp) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Month Navigation Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-700">Periode Keuangan:</span>
          <select
            value={selectedMonth}
            onChange={(e) => onSelectMonth(e.target.value)}
            className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 border-none rounded-lg text-slate-900 focus:outline-none cursor-pointer"
          >
            {availableMonths.map((ym) => (
              <option key={ym} value={ym}>
                {ym === getCurrentYearMonth() ? `Bulan Ini (${ym})` : ym}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            disabled={!hasPrev}
            onClick={handlePrevMonth}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent rounded-md transition-colors"
            title="Bulan Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-slate-800 px-1 min-w-[100px] text-center">
            {currentSummary.label}
          </span>
          <button
            type="button"
            disabled={!hasNext}
            onClick={handleNextMonth}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent rounded-md transition-colors"
            title="Bulan Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Saldo */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total Saldo Kumulatif</span>
            <Wallet className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums tracking-tight">
              {formatRupiah(totalBalance)}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Seluruh saldo kas & rekening
            </span>
          </div>
        </div>

        {/* Pemasukan Bulan Ini */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Pemasukan ({currentSummary.shortLabel})</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-emerald-600 font-mono tabular-nums tracking-tight">
              {formatRupiah(currentSummary.totalIncome)}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1 font-mono">
              Dari gaji, usaha & sumber lainnya
            </span>
          </div>
        </div>

        {/* Pengeluaran Bulan Ini */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Pengeluaran ({currentSummary.shortLabel})</span>
            <ArrowDownRight className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-rose-600 font-mono tabular-nums tracking-tight">
              {formatRupiah(currentSummary.totalExpense)}
            </span>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
              {previousSummary ? (
                expPercentChange > 0 ? (
                  <span className="text-rose-600 font-medium">
                    +{expPercentChange}% vs bulan lalu
                  </span>
                ) : expPercentChange < 0 ? (
                  <span className="text-emerald-600 font-medium">
                    {expPercentChange}% vs bulan lalu
                  </span>
                ) : (
                  <span>Sama dengan bulan lalu</span>
                )
              ) : (
                <span>{currentSummary.transactionCount} transaksi</span>
              )}
            </div>
          </div>
        </div>

        {/* Arus Kas Bersih (Tabungan) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Sisa Kas / Tabungan</span>
            <PiggyBank className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2">
            <span
              className={`text-2xl font-bold font-mono tabular-nums tracking-tight ${
                currentSummary.netSavings >= 0 ? 'text-slate-900' : 'text-rose-600'
              }`}
            >
              {formatRupiah(currentSummary.netSavings, true)}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1 font-mono">
              Tingkat tabungan: <strong className="text-slate-800">{currentSummary.savingsRate}%</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
