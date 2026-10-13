import React, { useState } from 'react';
import { CategoryBreakdownItem } from '../../types/finance';
import { formatRupiah } from '../../utils/formatters';
import { PieChart, ShoppingBag } from 'lucide-react';

interface Props {
  breakdown: CategoryBreakdownItem[];
  totalExpense: number;
  monthLabel: string;
}

export const CategoryDonutChart: React.FC<Props> = ({
  breakdown,
  totalExpense,
  monthLabel,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  if (!breakdown || breakdown.length === 0 || totalExpense === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col items-center justify-center min-h-[340px] text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <PieChart className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-700">Belum Ada Pengeluaran</h4>
        <p className="text-xs text-slate-400 max-w-xs mt-1">
          Tidak ada transaksi pengeluaran tercatat untuk {monthLabel}. Catat pengeluaran pertama Anda.
        </p>
      </div>
    );
  }

  // Pre-calculate SVG donut arcs using stroke-dasharray and stroke-dashoffset
  const size = 200;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const slices = breakdown.map((item) => {
    const itemPercent = item.amount / totalExpense;
    const strokeDasharray = `${itemPercent * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += itemPercent;
    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const activeItem = hoveredCategory
    ? breakdown.find((b) => b.category === hoveredCategory)
    : breakdown[0];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-slate-900 tracking-tight">
            Kategori Pengeluaran
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Distribusi alokasi dana bulan {monthLabel}
          </p>
        </div>
        <span className="text-xs text-slate-500 font-medium font-mono tabular-nums">
          {breakdown.length} Kategori
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mt-4">
        {/* Donut SVG with interactive hover */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="transform -rotate-90 select-none overflow-visible"
          >
            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
            />

            {/* Slices */}
            {slices.map((slice) => {
              const isHovered = hoveredCategory === slice.category;
              return (
                <circle
                  key={slice.category}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredCategory(slice.category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                />
              );
            })}
          </svg>

          {/* Center text in donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
            <span className="text-[11px] font-medium text-slate-400">
              {hoveredCategory ? 'Kategori Dipilih' : 'Total Pengeluaran'}
            </span>
            <span className="text-sm font-bold text-slate-900 font-mono tabular-nums leading-tight mt-0.5">
              {hoveredCategory && activeItem
                ? formatRupiah(activeItem.amount)
                : formatRupiah(totalExpense)}
            </span>
            {hoveredCategory && activeItem && (
              <span className="text-[10px] font-semibold text-rose-600 mt-0.5 font-mono">
                {activeItem.percentage}% dari total
              </span>
            )}
          </div>
        </div>

        {/* Category List & Progress breakdown */}
        <div className="md:col-span-7 space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
          {breakdown.map((item) => {
            const isHovered = hoveredCategory === item.category;
            return (
              <div
                key={item.category}
                onMouseEnter={() => setHoveredCategory(item.category)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={`p-2 rounded-lg transition-colors cursor-pointer border ${
                  isHovered
                    ? 'bg-slate-50 border-slate-300'
                    : 'hover:bg-slate-50/60 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-slate-800 truncate">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <span className="text-slate-500 font-mono tabular-nums">
                      {item.percentage}%
                    </span>
                    <span className="font-semibold text-slate-900 font-mono tabular-nums">
                      {formatRupiah(item.amount)}
                    </span>
                  </div>
                </div>

                {/* Micro Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
