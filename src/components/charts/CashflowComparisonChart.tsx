import React from 'react';
import { MonthSummary } from '../../types/finance';
import { formatRupiah, formatCompactRupiah } from '../../utils/formatters';
import { ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';

interface Props {
  monthlyData: MonthSummary[];
  selectedMonth: string;
}

export const CashflowComparisonChart: React.FC<Props> = ({ monthlyData, selectedMonth }) => {
  const displayData = monthlyData.slice(-6);

  const maxNet = Math.max(
    ...displayData.map((d) => Math.abs(d.netSavings)),
    1000000
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-900 tracking-tight">
            Arus Kas & Sisa Tabungan Bersih
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Perbandingan surplus/defisit bulanan (Pemasukan dikurangi Pengeluaran)
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
            Surplus (Nabung)
          </span>
          <span className="flex items-center gap-1.5 text-rose-700">
            <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" />
            Defisit
          </span>
        </div>
      </div>

      {/* Grid of months cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
        {displayData.map((m) => {
          const isSurplus = m.netSavings >= 0;
          const isCurrent = m.yearMonth === selectedMonth;

          return (
            <div
              key={m.yearMonth}
              className={`p-3 rounded-lg border transition-all ${
                isCurrent
                  ? 'border-indigo-400 bg-indigo-50/30 ring-1 ring-indigo-300'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-800">{m.shortLabel}</span>
                {isSurplus ? (
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
                )}
              </div>

              <div className="mt-2">
                <span
                  className={`text-sm font-bold font-mono tabular-nums block ${
                    isSurplus ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {isSurplus ? '+' : ''}
                  {formatCompactRupiah(m.netSavings)}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5 font-mono">
                  Hemat {m.savingsRate}%
                </span>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] space-y-0.5 text-slate-500">
                <div className="flex justify-between">
                  <span>Masuk:</span>
                  <span className="font-mono text-slate-700 tabular-nums">
                    {formatCompactRupiah(m.totalIncome)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Keluar:</span>
                  <span className="font-mono text-slate-700 tabular-nums">
                    {formatCompactRupiah(m.totalExpense)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
