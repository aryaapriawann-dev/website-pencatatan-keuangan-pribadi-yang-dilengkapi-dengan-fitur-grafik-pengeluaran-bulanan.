import React, { useState } from 'react';
import { formatRupiah, formatCompactRupiah } from '../../utils/formatters';

interface DailyExpense {
  day: number;
  dateStr: string;
  amount: number;
  count: number;
}

interface Props {
  dailyData: DailyExpense[];
  monthLabel: string;
}

export const DailyExpenseTrendChart: React.FC<Props> = ({ dailyData, monthLabel }) => {
  const [hoveredDay, setHoveredDay] = useState<DailyExpense | null>(null);

  const maxAmount = Math.max(...dailyData.map((d) => d.amount), 100000);
  const totalMonthly = dailyData.reduce((acc, d) => acc + d.amount, 0);
  const activeDaysCount = dailyData.filter((d) => d.amount > 0).length;
  const avgActiveDay = activeDaysCount > 0 ? totalMonthly / activeDaysCount : 0;

  const chartHeight = 160;
  const paddingTop = 20;
  const paddingBottom = 30;
  const usableHeight = chartHeight - paddingTop - paddingBottom;
  const width = 800;
  const paddingX = 40;
  const chartWidth = width - paddingX * 2;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-slate-900 tracking-tight">
            Tren Pengeluaran Harian
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Ritme transaksi dari tanggal 1 hingga akhir bulan {monthLabel}
          </p>
        </div>
        <div className="text-xs text-slate-600 flex items-center gap-3">
          <span>
            Rata-rata saat belanja:{' '}
            <strong className="text-slate-900 font-mono tabular-nums">
              {formatRupiah(avgActiveDay)}
            </strong>
          </span>
        </div>
      </div>

      <div className="relative mt-4">
        {/* Tooltip info if hovered */}
        <div className="h-6 mb-1 text-xs flex items-center justify-between text-slate-500">
          {hoveredDay ? (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">
                Tanggal {hoveredDay.day} {monthLabel}:
              </span>
              <span className="text-rose-600 font-bold font-mono tabular-nums">
                {formatRupiah(hoveredDay.amount)}
              </span>
              <span className="text-slate-400">({hoveredDay.count} transaksi)</span>
            </div>
          ) : (
            <span className="text-slate-400">
              Arahkan kursor ke grafik untuk melihat detail pengeluaran per tanggal
            </span>
          )}
        </div>

        <svg viewBox={`0 0 ${width} ${chartHeight}`} className="w-full h-44 select-none overflow-visible">
          {/* Grid lines */}
          {[0, 0.5, 1].map((pct) => {
            const y = paddingTop + usableHeight * (1 - pct);
            return (
              <g key={pct}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeDasharray={pct === 0 ? 'none' : '2 2'}
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="10"
                  className="font-mono tabular-nums"
                >
                  {formatCompactRupiah(maxAmount * pct)}
                </text>
              </g>
            );
          })}

          {/* Daily Vertical Bars / Points */}
          {dailyData.map((d) => {
            const step = chartWidth / (dailyData.length - 1 || 1);
            const cx = paddingX + (d.day - 1) * step;
            const barHeight = (d.amount / maxAmount) * usableHeight;
            const cy = paddingTop + usableHeight - barHeight;
            const isHovered = hoveredDay?.day === d.day;
            const hasSpending = d.amount > 0;

            return (
              <g
                key={d.day}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredDay(d)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                {/* Invisible hover hitbox */}
                <rect
                  x={cx - step / 2}
                  y={paddingTop}
                  width={step}
                  height={usableHeight + paddingBottom}
                  fill="transparent"
                />

                {/* Vertical stem */}
                {hasSpending && (
                  <line
                    x1={cx}
                    y1={paddingTop + usableHeight}
                    x2={cx}
                    y2={cy}
                    stroke={isHovered ? '#e11d48' : '#fda4af'}
                    strokeWidth={isHovered ? 3 : 2}
                  />
                )}

                {/* Dot */}
                <circle
                  cx={cx}
                  cy={hasSpending ? cy : paddingTop + usableHeight}
                  r={isHovered ? 5 : hasSpending ? 3.5 : 1.5}
                  fill={isHovered ? '#be123c' : hasSpending ? '#e11d48' : '#cbd5e1'}
                  stroke={isHovered ? '#ffffff' : 'none'}
                  strokeWidth="1.5"
                />

                {/* Date label every 5 days or 1st & last */}
                {(d.day === 1 || d.day % 5 === 0 || d.day === dailyData.length) && (
                  <text
                    x={cx}
                    y={chartHeight - 8}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="10"
                    fontWeight="500"
                    className="font-mono"
                  >
                    Tgl {d.day}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
