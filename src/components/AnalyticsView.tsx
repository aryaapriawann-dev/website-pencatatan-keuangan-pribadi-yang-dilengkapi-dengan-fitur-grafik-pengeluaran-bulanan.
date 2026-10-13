import React from 'react';
import { MonthSummary, CategoryBreakdownItem } from '../types/finance';
import { MonthlyExpenseBarChart } from './charts/MonthlyExpenseBarChart';
import { CategoryDonutChart } from './charts/CategoryDonutChart';
import { DailyExpenseTrendChart } from './charts/DailyExpenseTrendChart';
import { CashflowComparisonChart } from './charts/CashflowComparisonChart';
import { formatRupiah, formatCompactRupiah } from '../utils/formatters';
import { Sparkles, TrendingUp, TrendingDown, Calendar, AlertCircle } from 'lucide-react';

interface Props {
  monthlySummaries: MonthSummary[];
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  currentSummary: MonthSummary;
  categoryBreakdown: CategoryBreakdownItem[];
  dailyExpenses: Array<{ day: number; dateStr: string; amount: number; count: number }>;
}

export const AnalyticsView: React.FC<Props> = ({
  monthlySummaries,
  selectedMonth,
  onSelectMonth,
  currentSummary,
  categoryBreakdown,
  dailyExpenses,
}) => {
  // Compute analytics highlights
  const allExpenses = monthlySummaries.map((m) => m.totalExpense).filter((e) => e > 0);
  const avgMonthlyExpense = allExpenses.length > 0 ? allExpenses.reduce((a, b) => a + b, 0) / allExpenses.length : 0;

  const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;

  const highestMonth = [...monthlySummaries].sort((a, b) => b.totalExpense - a.totalExpense)[0];
  const lowestMonth = [...monthlySummaries].filter((m) => m.totalExpense > 0).sort((a, b) => a.totalExpense - b.totalExpense)[0];

  return (
    <div className="space-y-6">
      {/* Smart Financial Insights Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold mb-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Ringkasan Cerdas Finansial Bulanan ({currentSummary.label})</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mt-3">
          <div className="bg-white/10 backdrop-blur-xs rounded-lg p-3">
            <span className="text-slate-300 block">Pos Pengeluaran Terbesar:</span>
            {topCategory ? (
              <div className="mt-1">
                <span className="text-sm font-bold text-white block">
                  {topCategory.category}
                </span>
                <span className="text-indigo-200 font-mono">
                  {formatRupiah(topCategory.amount)} ({topCategory.percentage}% dari total)
                </span>
              </div>
            ) : (
              <span className="text-slate-400 mt-1 block">Belum ada transaksi</span>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-lg p-3">
            <span className="text-slate-300 block">Rata-rata Pengeluaran Bulanan:</span>
            <div className="mt-1">
              <span className="text-sm font-bold font-mono text-white block">
                {formatRupiah(avgMonthlyExpense)}
              </span>
              <span className="text-indigo-200">
                Bulan aktif: {currentSummary.totalExpense > avgMonthlyExpense ? 'Di atas rata-rata' : 'Terkendali / Di bawah rata-rata'}
              </span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-lg p-3">
            <span className="text-slate-300 block">Kesehatan Arus Kas:</span>
            <div className="mt-1">
              <span className="text-sm font-bold text-white block font-mono">
                {currentSummary.savingsRate}% Pemasukan Ditabung
              </span>
              <span className="text-indigo-200">
                {currentSummary.savingsRate >= 20 ? 'Sangat Sehat (Ideal >= 20%)' : 'Perlu evaluasi pengeluaran'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Bar Chart */}
      <MonthlyExpenseBarChart
        monthlyData={monthlySummaries}
        selectedMonth={selectedMonth}
        onSelectMonth={onSelectMonth}
      />

      {/* Grid: Category Donut & Daily Rhythm */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryDonutChart
          breakdown={categoryBreakdown}
          totalExpense={currentSummary.totalExpense}
          monthLabel={currentSummary.label}
        />
        <DailyExpenseTrendChart
          dailyData={dailyExpenses}
          monthLabel={currentSummary.label}
        />
      </div>

      {/* Cashflow Net & Month recap table */}
      <CashflowComparisonChart
        monthlyData={monthlySummaries}
        selectedMonth={selectedMonth}
      />

      {/* Historical Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 tracking-tight">
              Tabel Rekapitulasi Keuangan Antar Bulan
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Rincian komparasi pemasukan, pengeluaran, dan tabungan historis
            </p>
          </div>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/60">
                <th className="py-2.5 px-4">Bulan</th>
                <th className="py-2.5 px-4 text-right">Pemasukan</th>
                <th className="py-2.5 px-4 text-right">Pengeluaran</th>
                <th className="py-2.5 px-4 text-right">Sisa / Tabungan</th>
                <th className="py-2.5 px-4 text-right">Rasio Tabungan</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlySummaries.map((m) => {
                const isSelected = m.yearMonth === selectedMonth;
                const isSurplus = m.netSavings >= 0;

                return (
                  <tr
                    key={m.yearMonth}
                    onClick={() => onSelectMonth(m.yearMonth)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-50/50 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-4 flex items-center gap-2">
                      <span className="text-slate-900">{m.label}</span>
                      {isSelected && (
                        <span className="text-[10px] text-indigo-700 font-mono font-medium">
                          (Aktif)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-700 tabular-nums">
                      {formatRupiah(m.totalIncome)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-rose-600 tabular-nums">
                      {formatRupiah(m.totalExpense)}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono font-semibold tabular-nums ${
                        isSurplus ? 'text-slate-900' : 'text-rose-600'
                      }`}
                    >
                      {formatRupiah(m.netSavings, true)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                      {m.savingsRate}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[11px] font-mono ${
                          isSurplus ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {isSurplus ? 'Surplus' : 'Defisit'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
