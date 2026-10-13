import React, { useState } from 'react';
import { MonthSummary } from '../../types/finance';
import { formatRupiah, formatCompactRupiah } from '../../utils/formatters';
import { TrendingDown, TrendingUp, Calendar, Info } from 'lucide-react';

interface Props {
  monthlyData: MonthSummary[];
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
}

export const MonthlyExpenseBarChart: React.FC<Props> = ({
  monthlyData,
  selectedMonth,
  onSelectMonth,
}) => {
  const [viewMode, setViewMode] = useState<'expense-only' | 'comparison'>('expense-only');
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  // Take the most relevant range (up to last 6-8 months)
  const displayData = monthlyData.slice(-8);

  // Max value calculation for scaling
  const maxExpense = Math.max(...displayData.map((d) => d.totalExpense), 1000000);
  const maxIncome = Math.max(...displayData.map((d) => d.totalIncome), 1000000);
  const maxValue = viewMode === 'expense-only' ? maxExpense : Math.max(maxExpense, maxIncome);

  // Average expense across displayed months
  const totalExpensesSum = displayData.reduce((acc, d) => acc + d.totalExpense, 0);
  const avgExpense = displayData.length > 0 ? totalExpensesSum / displayData.length : 0;

  // Chart dimensions
  const chartHeight = 220;
  const paddingBottom = 40;
  const paddingTop = 25;
  const usableHeight = chartHeight - paddingBottom - paddingTop;

  // Find max and min spending months
  const highestExpMonth = [...displayData].sort((a, b) => b.totalExpense - a.totalExpense)[0];
  const lowestExpMonth = [...displayData]
    .filter((d) => d.totalExpense > 0)
    .sort((a, b) => a.totalExpense - b.totalExpense)[0];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      {/* Header and View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            Grafik Pengeluaran Bulanan
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Analisis tren pengeluaran bulan ke bulan · Klik batang untuk berpindah bulan
          </p>
        </div>

        {/* Toggle Mode: Segmented control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('expense-only')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'expense-only'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pengeluaran
          </button>
          <button
            type="button"
            onClick={() => setViewMode('comparison')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'comparison'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pemasukan vs Pengeluaran
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-3 border-b border-slate-100 text-xs">
        <div>
          <span className="text-slate-400 block">Rata-rata Pengeluaran</span>
          <span className="font-semibold text-slate-800 font-mono tabular-nums">
            {formatRupiah(avgExpense)}
          </span>
        </div>
        {highestExpMonth && (
          <div>
            <span className="text-slate-400 block">Pengeluaran Tertinggi</span>
            <span className="font-semibold text-rose-600 font-mono tabular-nums">
              {formatCompactRupiah(highestExpMonth.totalExpense)} ({highestExpMonth.shortLabel})
            </span>
          </div>
        )}
        {lowestExpMonth && (
          <div className="hidden sm:block">
            <span className="text-slate-400 block">Pengeluaran Terhemat</span>
            <span className="font-semibold text-emerald-600 font-mono tabular-nums">
              {formatCompactRupiah(lowestExpMonth.totalExpense)} ({lowestExpMonth.shortLabel})
            </span>
          </div>
        )}
      </div>

      {/* SVG Interactive Chart */}
      <div className="relative mt-4 pt-2">
        <svg
          viewBox={`0 0 1000 ${chartHeight}`}
          className="w-full h-56 select-none overflow-visible"
        >
          {/* Background horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const y = paddingTop + usableHeight * (1 - pct);
            const val = maxValue * pct;
            return (
              <g key={pct}>
                <line
                  x1="50"
                  y1={y}
                  x2="970"
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray={pct === 0 ? 'none' : '3 3'}
                  strokeWidth="1"
                />
                <text
                  x="42"
                  y={y + 4}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="11"
                  className="font-mono tabular-nums"
                >
                  {formatCompactRupiah(val)}
                </text>
              </g>
            );
          })}

          {/* Average expense guideline */}
          {viewMode === 'expense-only' && avgExpense > 0 && (
            <g>
              {(() => {
                const avgY = paddingTop + usableHeight * (1 - Math.min(avgExpense / maxValue, 1));
                return (
                  <>
                    <line
                      x1="50"
                      y1={avgY}
                      x2="970"
                      y2={avgY}
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      strokeWidth="1.5"
                    />
                    <text
                      x="960"
                      y={avgY - 6}
                      textAnchor="end"
                      fill="#d97706"
                      fontSize="10"
                      fontWeight="600"
                    >
                      Rata-rata ({formatCompactRupiah(avgExpense)})
                    </text>
                  </>
                );
              })()}
            </g>
          )}

          {/* Bars */}
          {displayData.map((d, index) => {
            const totalSlots = displayData.length;
            const slotWidth = 900 / totalSlots;
            const centerX = 65 + index * slotWidth + slotWidth / 2;
            const isSelected = d.yearMonth === selectedMonth;
            const isHovered = d.yearMonth === hoveredMonth;

            // Bar dimensions
            const expHeight = (d.totalExpense / maxValue) * usableHeight;
            const incHeight = (d.totalIncome / maxValue) * usableHeight;
            const expY = paddingTop + usableHeight - expHeight;
            const incY = paddingTop + usableHeight - incHeight;

            if (viewMode === 'expense-only') {
              const barWidth = Math.min(48, slotWidth * 0.55);
              return (
                <g
                  key={d.yearMonth}
                  className="cursor-pointer transition-opacity"
                  onClick={() => onSelectMonth(d.yearMonth)}
                  onMouseEnter={() => setHoveredMonth(d.yearMonth)}
                  onMouseLeave={() => setHoveredMonth(null)}
                >
                  {/* Subtle column background hit area */}
                  <rect
                    x={centerX - slotWidth / 2 + 4}
                    y={paddingTop}
                    width={slotWidth - 8}
                    height={usableHeight + paddingBottom}
                    fill={isSelected ? '#f1f5f9' : isHovered ? '#f8fafc' : 'transparent'}
                    rx="6"
                  />

                  {/* The Expense Bar */}
                  <rect
                    x={centerX - barWidth / 2}
                    y={expY}
                    width={barWidth}
                    height={Math.max(expHeight, 2)}
                    rx="4"
                    fill={isSelected ? '#e11d48' : '#fb7185'}
                    className="transition-all duration-200"
                  />

                  {/* Top value label */}
                  {d.totalExpense > 0 && (
                    <text
                      x={centerX}
                      y={expY - 8}
                      textAnchor="middle"
                      fill={isSelected ? '#be123c' : '#64748b'}
                      fontSize="11"
                      fontWeight={isSelected ? '700' : '500'}
                      className="font-mono tabular-nums"
                    >
                      {formatCompactRupiah(d.totalExpense)}
                    </text>
                  )}

                  {/* Bottom month label */}
                  <text
                    x={centerX}
                    y={chartHeight - 12}
                    textAnchor="middle"
                    fill={isSelected ? '#0f172a' : '#64748b'}
                    fontSize="12"
                    fontWeight={isSelected ? '700' : '500'}
                  >
                    {d.shortLabel}
                  </text>

                  {/* Active Month Indicator dot */}
                  {isSelected && (
                    <circle cx={centerX} cy={chartHeight - 2} r="3" fill="#e11d48" />
                  )}
                </g>
              );
            }

            // Comparison mode: Dual bars (Income green, Expense rose)
            const singleBarWidth = Math.min(22, slotWidth * 0.3);
            const gap = 4;
            const incX = centerX - singleBarWidth - gap / 2;
            const expX = centerX + gap / 2;

            return (
              <g
                key={d.yearMonth}
                className="cursor-pointer transition-opacity"
                onClick={() => onSelectMonth(d.yearMonth)}
                onMouseEnter={() => setHoveredMonth(d.yearMonth)}
                onMouseLeave={() => setHoveredMonth(null)}
              >
                {/* Column background hit area */}
                <rect
                  x={centerX - slotWidth / 2 + 4}
                  y={paddingTop}
                  width={slotWidth - 8}
                  height={usableHeight + paddingBottom}
                  fill={isSelected ? '#f1f5f9' : isHovered ? '#f8fafc' : 'transparent'}
                  rx="6"
                />

                {/* Income Bar */}
                <rect
                  x={incX}
                  y={incY}
                  width={singleBarWidth}
                  height={Math.max(incHeight, 2)}
                  rx="3"
                  fill={isSelected ? '#059669' : '#34d399'}
                  className="transition-all duration-200"
                />

                {/* Expense Bar */}
                <rect
                  x={expX}
                  y={expY}
                  width={singleBarWidth}
                  height={Math.max(expHeight, 2)}
                  rx="3"
                  fill={isSelected ? '#e11d48' : '#fb7185'}
                  className="transition-all duration-200"
                />

                {/* Bottom month label */}
                <text
                  x={centerX}
                  y={chartHeight - 12}
                  textAnchor="middle"
                  fill={isSelected ? '#0f172a' : '#64748b'}
                  fontSize="12"
                  fontWeight={isSelected ? '700' : '500'}
                >
                  {d.shortLabel}
                </text>

                {isSelected && (
                  <circle cx={centerX} cy={chartHeight - 2} r="3" fill="#0f172a" />
                )}
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-4">
            {viewMode === 'expense-only' ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-rose-500 inline-block" />
                  <span>Pengeluaran Bulanan</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-0.5 border-t-2 border-dashed border-amber-500 inline-block" />
                  <span>Garis Rata-rata</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" />
                  <span>Pemasukan</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-rose-500 inline-block" />
                  <span>Pengeluaran</span>
                </div>
              </>
            )}
          </div>

          <div className="text-slate-400 text-xs flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Bulan terpilih: <strong className="text-slate-700">{displayData.find((d) => d.yearMonth === selectedMonth)?.label}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
