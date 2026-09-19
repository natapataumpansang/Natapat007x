import React from 'react';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, CalendarDays } from 'lucide-react';
import { MonthlySummary } from '../types';
import { formatCurrency } from '../utils/formatters';

interface BalanceCardProps {
  summary: MonthlySummary;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ summary }) => {
  const isPositive = summary.netBalance >= 0;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-5 shadow-xl border border-slate-700/50 mb-5 relative overflow-hidden">
      {/* Subtle decorative background pattern */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Main Net Balance */}
      <div className="relative z-10 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-medium flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            ยอดเงินคงเหลือสุทธิรายเดือน
          </span>
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
              isPositive
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            {isPositive ? 'สถานะการเงินบวก' : 'ใช้จ่ายเกินรายรับ'}
          </span>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans">
            {formatCurrency(summary.netBalance)}
          </span>
          <span className="text-xs text-slate-400">บาท</span>
        </div>
      </div>

      {/* Two-Column Income vs Expense Grid */}
      <div className="grid grid-cols-2 gap-3 relative z-10 pt-3 border-t border-slate-700/60">
        {/* Income Card */}
        <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/50">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mb-1">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-3 h-3" />
            </div>
            <span>รายรับรวม (+)</span>
          </div>
          <p className="text-lg font-bold text-white tracking-tight">
            {formatCurrency(summary.totalIncome)}
          </p>
        </div>

        {/* Expense Card */}
        <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/50">
          <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium mb-1">
            <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center">
              <TrendingDown className="w-3 h-3" />
            </div>
            <span>รายจ่ายรวม (-)</span>
          </div>
          <p className="text-lg font-bold text-white tracking-tight">
            {formatCurrency(summary.totalExpense)}
          </p>
        </div>
      </div>

      {/* Quick Indicators: Savings Rate & Daily Average */}
      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
        <div className="flex items-center gap-1.5">
          <PiggyBank className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="text-slate-400">อัตราการออม: </span>
            <span className="font-semibold text-amber-300">
              {summary.savingsRate.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <CalendarDays className="w-4 h-4 text-cyan-400 shrink-0" />
          <div>
            <span className="text-slate-400">เฉลี่ยต่อวัน: </span>
            <span className="font-semibold text-cyan-300">
              {formatCurrency(Math.round(summary.dailyAverageExpense))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
