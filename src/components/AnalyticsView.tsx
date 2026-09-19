import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Coffee,
  ShoppingBag,
  Zap,
} from 'lucide-react';
import { Transaction, MonthlySummary } from '../types';
import {
  calculateCategoryStats,
  calculateDailyBreakdown,
  formatCurrency,
  formatMonthDisplay,
} from '../utils/formatters';

interface AnalyticsViewProps {
  transactions: Transaction[];
  currentMonthKey: string;
  summary: MonthlySummary;
}

type ChartTab = 'comparison' | 'category' | 'trend';

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  transactions,
  currentMonthKey,
  summary,
}) => {
  const [activeTab, setActiveTab] = useState<ChartTab>('comparison');

  // Category statistics
  const categoryStats = useMemo(() => {
    return calculateCategoryStats(transactions, currentMonthKey, 'expense');
  }, [transactions, currentMonthKey]);

  // Daily comparison breakdown (Income vs Expense)
  const dailyData = useMemo(() => {
    const raw = calculateDailyBreakdown(transactions, currentMonthKey);
    // Only return up to today if viewing current month, or days that have data
    return raw.map((d) => ({
      ...d,
      dayLabel: `${d.day}`,
    }));
  }, [transactions, currentMonthKey]);

  // Cumulative trend
  const cumulativeData = useMemo(() => {
    let sumExpense = 0;
    let sumIncome = 0;
    return dailyData.map((d) => {
      sumExpense += d.expense;
      sumIncome += d.income;
      return {
        day: d.day,
        รายจ่ายสะสม: sumExpense,
        รายรับสะสม: sumIncome,
        ยอดคงเหลือ: sumIncome - sumExpense,
      };
    });
  }, [dailyData]);

  // Spending behavior insights calculations
  const behaviorInsights = useMemo(() => {
    const totalExp = summary.totalExpense;
    const totalInc = summary.totalIncome;

    // Essential categories: Food, Transport, Housing, Health
    const essentialNames = ['อาหาร & เครื่องดื่ม', 'การเดินทาง / คมนาคม', 'ที่พัก / ค่าน้ำ ค่าไฟ', 'สุขภาพ & ยา'];
    let essentialSum = 0;
    let discretionarySum = 0;

    categoryStats.forEach((c) => {
      if (essentialNames.includes(c.category)) {
        essentialSum += c.amount;
      } else {
        discretionarySum += c.amount;
      }
    });

    const essentialPct = totalExp > 0 ? (essentialSum / totalExp) * 100 : 0;
    const discretionaryPct = totalExp > 0 ? (discretionarySum / totalExp) * 100 : 0;

    // Savings evaluation
    let savingsGrade = 'ดีเยี่ยม';
    let savingsBadgeColor = 'bg-emerald-100 text-emerald-800';
    if (totalInc === 0 && totalExp > 0) {
      savingsGrade = 'ไม่มีรายรับในเดือนนี้';
      savingsBadgeColor = 'bg-slate-100 text-slate-700';
    } else if (summary.savingsRate >= 30) {
      savingsGrade = 'ยอดเยี่ยม (ออม > 30%)';
      savingsBadgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    } else if (summary.savingsRate >= 15) {
      savingsGrade = 'ดีตามเกณฑ์ (ออม 15-30%)';
      savingsBadgeColor = 'bg-blue-100 text-blue-800 border-blue-300';
    } else if (summary.savingsRate > 0) {
      savingsGrade = 'ปานกลาง (ออม < 15%)';
      savingsBadgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
    } else {
      savingsGrade = 'เฝ้าระวัง (รายจ่ายเกินรายรับ)';
      savingsBadgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
    }

    return {
      essentialSum,
      essentialPct,
      discretionarySum,
      discretionaryPct,
      savingsGrade,
      savingsBadgeColor,
    };
  }, [summary, categoryStats]);

  return (
    <div className="space-y-5 pb-8">
      {/* Tab Controls for Charts */}
      <div className="bg-white rounded-2xl p-1.5 shadow-xs border border-slate-200/80 flex items-center justify-between gap-1">
        <button
          id="btn-chart-comparison"
          type="button"
          onClick={() => setActiveTab('comparison')}
          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'comparison'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>เปรียบเทียบ รับ vs จ่าย</span>
        </button>

        <button
          id="btn-chart-category"
          type="button"
          onClick={() => setActiveTab('category')}
          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'category'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <PieIcon className="w-3.5 h-3.5" />
          <span>สัดส่วนหมวดหมู่</span>
        </button>

        <button
          id="btn-chart-trend"
          type="button"
          onClick={() => setActiveTab('trend')}
          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'trend'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>แนวโน้มสะสม</span>
        </button>
      </div>

      {/* Main Chart Card */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80">
        {/* Comparison Chart */}
        {activeTab === 'comparison' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  กราฟเปรียบเทียบ รายรับ vs รายจ่าย รายวัน
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  แสดงยอดการเงินในแต่ละวันของ {formatMonthDisplay(currentMonthKey)}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium">
                <span className="flex items-center gap-1 text-emerald-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  รายรับ
                </span>
                <span className="flex items-center gap-1 text-rose-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  รายจ่าย
                </span>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dailyData}
                  margin={{ top: 10, right: 5, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="dayLabel"
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickFormatter={(val) => (val >= 1000 ? `${val / 1000}k` : val)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(value: any, name?: any) => [
                      formatCurrency(Number(value)),
                      name === 'income' ? 'รายรับ' : 'รายจ่าย',
                    ]}
                    labelFormatter={(label) => `วันที่ ${label} ${currentMonthKey}`}
                  />
                  <Bar
                    dataKey="income"
                    name="income"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={16}
                  />
                  <Bar
                    dataKey="expense"
                    name="expense"
                    fill="#f43f5e"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={16}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Category Breakdown Donut */}
        {activeTab === 'category' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  สัดส่วนค่าใช้จ่ายตามหมวดหมู่
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  รวมรายจ่าย {formatCurrency(summary.totalExpense)} บาท
                </p>
              </div>
            </div>

            {categoryStats.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-xs text-slate-400">
                ยังไม่มีรายการรายจ่ายในเดือนนี้
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Donut Chart */}
                <div className="w-48 h-48 sm:w-56 sm:h-56 shrink-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryStats}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={75}
                        paddingAngle={3}
                      >
                        {categoryStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          borderRadius: '12px',
                          color: '#ffffff',
                          border: 'none',
                          fontSize: '12px',
                        }}
                        formatter={(val: any) => [formatCurrency(Number(val)), 'จำนวนเงิน']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-[10px] text-slate-400 font-medium">รวมรายจ่าย</span>
                    <span className="text-xs font-extrabold text-slate-800">
                      {formatCurrency(summary.totalExpense)}
                    </span>
                  </div>
                </div>

                {/* Ranked Category List */}
                <div className="flex-1 w-full space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {categoryStats.map((cat) => (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="font-semibold text-slate-800">{cat.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">
                            {formatCurrency(cat.amount)}
                          </span>
                          <span className="text-[11px] text-slate-400 w-10 text-right">
                            {cat.percentage}%
                          </span>
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${cat.percentage}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cumulative Trend Chart */}
        {activeTab === 'trend' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  กราฟแนวโน้มการสะสม (Cumulative Trend)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ความเร็วในการใช้จ่ายเทียบกับยอดเงินคงเหลือสะสม
                </p>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={cumulativeData}
                  margin={{ top: 10, right: 5, left: -20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickFormatter={(val) => (val >= 1000 ? `${val / 1000}k` : val)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                    formatter={(val: any, name?: any) => [
                      formatCurrency(Number(val)),
                      String(name || ''),
                    ]}
                    labelFormatter={(label) => `สะสมถึงวันที่ ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="รายจ่ายสะสม"
                    stroke="#f43f5e"
                    fillOpacity={1}
                    fill="url(#colorExpense)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="ยอดคงเหลือ"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorBalance)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Behavioral Analysis & Financial Health Card */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              วิเคราะห์พฤติกรรมการใช้เงิน (Spending Insights)
            </h3>
            <p className="text-xs text-slate-500">
              ประเมินวินัยทางการเงินและข้อสังเกตประจำเดือน
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Card 1: Savings Discipline */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                วินัยการออมเงิน
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${behaviorInsights.savingsBadgeColor}`}
              >
                {behaviorInsights.savingsGrade}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">
                {summary.savingsRate.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-500">ของรายรับทั้งหมด</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              {summary.savingsRate >= 20
                ? 'ยอดเยี่ยมมาก! อัตราการออมเกินเกณฑ์ 20% ของนักวางแผนการเงิน'
                : 'คำแนะนำ: ลองตั้งเป้าหมายลดค่าใช้จ่ายไม่จำเป็นเพื่อเพิ่มเงินออมให้ถึง 20%'}
            </p>
          </div>

          {/* Card 2: Highest Expense Category */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                หมวดหมู่ที่จ่ายมากที่สุด
              </span>
            </div>
            {summary.highestExpenseCategory ? (
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-base font-bold text-slate-900 truncate">
                    {summary.highestExpenseCategory.name}
                  </span>
                  <span className="text-xs font-extrabold text-rose-600">
                    {formatCurrency(summary.highestExpenseCategory.amount)}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  คิดเป็น {summary.highestExpenseCategory.percentage.toFixed(1)}% ของรายจ่ายทั้งหมด
                </div>
              </div>
            ) : (
              <span className="text-xs text-slate-400">ยังไม่มีข้อมูลรายจ่าย</span>
            )}
          </div>
        </div>

        {/* Needs vs Wants Breakdown Bar */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-700 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              ปัจจัยจำเป็น vs ไลฟ์สไตล์ (Needs vs Wants)
            </span>
            <span className="text-slate-500">
              {behaviorInsights.essentialPct.toFixed(0)}% / {behaviorInsights.discretionaryPct.toFixed(0)}%
            </span>
          </div>

          {/* Dual bar */}
          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
            <div
              className="bg-blue-600 h-full transition-all duration-500"
              style={{ width: `${behaviorInsights.essentialPct}%` }}
              title={`จำเป็น: ${formatCurrency(behaviorInsights.essentialSum)}`}
            />
            <div
              className="bg-rose-400 h-full transition-all duration-500"
              style={{ width: `${behaviorInsights.discretionaryPct}%` }}
              title={`ไลฟ์สไตล์: ${formatCurrency(behaviorInsights.discretionarySum)}`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              จำเป็น (อาหาร, พักอาศัย, เดินทาง, ยา): {formatCurrency(behaviorInsights.essentialSum)}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              ช้อปปิ้ง/บันเทิง/อื่นๆ: {formatCurrency(behaviorInsights.discretionarySum)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
