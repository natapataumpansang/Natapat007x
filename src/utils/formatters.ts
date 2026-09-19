import { Transaction, MonthlySummary, CategoryStat, DailyComparison } from '../types';
import { CATEGORY_COLOR_MAP } from '../constants/categories';

export const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

export const THAI_SHORT_MONTHS = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

/**
 * Format number into Thai Baht string
 */
export const formatCurrency = (amount: number, showSign = false): string => {
  const formatted = Math.abs(amount).toLocaleString('th-TH', {
    minimumFractionDigits: amount % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  });

  if (showSign) {
    if (amount > 0) return `+฿${formatted}`;
    if (amount < 0) return `-฿${formatted}`;
  }
  return `฿${formatted}`;
};

/**
 * Format YYYY-MM into Thai month + Christian Year / Buddhist Era
 */
export const formatMonthDisplay = (monthKey: string): string => {
  const [yearStr, monthStr] = monthKey.split('-');
  const monthIdx = parseInt(monthStr, 10) - 1;
  const yearNum = parseInt(yearStr, 10);
  const thaiMonth = THAI_MONTHS[monthIdx] || monthStr;
  return `${thaiMonth} ${yearNum + 543} (${yearNum})`;
};

export const formatShortDate = (dateStr: string): string => {
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const day = parseInt(parts[2], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  return `${day} ${THAI_SHORT_MONTHS[monthIdx] || ''}`;
};

/**
 * Calculate full monthly summary statistics
 */
export const calculateMonthlySummary = (
  transactions: Transaction[],
  monthKey: string // YYYY-MM
): MonthlySummary => {
  const filtered = transactions.filter((t) => t.date.startsWith(monthKey));

  let totalIncome = 0;
  let totalExpense = 0;
  const expenseCategoryMap: Record<string, number> = {};

  filtered.forEach((t) => {
    if (t.type === 'income') {
      totalIncome += t.amount;
    } else {
      totalExpense += t.amount;
      expenseCategoryMap[t.category] = (expenseCategoryMap[t.category] || 0) + t.amount;
    }
  });

  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, (netBalance / totalIncome) * 100) : 0;

  // Days in month
  const [y, m] = monthKey.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();

  // If viewing current month, only divide by elapsed days so far
  const now = new Date();
  const isCurrentMonth = now.getFullYear() === y && now.getMonth() + 1 === m;
  const elapsedDays = isCurrentMonth ? Math.max(1, now.getDate()) : daysInMonth;
  const dailyAverageExpense = totalExpense / elapsedDays;

  // Highest expense category
  let highestExpenseCategory: MonthlySummary['highestExpenseCategory'] = null;
  let maxCatAmount = 0;
  let maxCatName = '';

  Object.entries(expenseCategoryMap).forEach(([cat, amt]) => {
    if (amt > maxCatAmount) {
      maxCatAmount = amt;
      maxCatName = cat;
    }
  });

  if (maxCatAmount > 0 && totalExpense > 0) {
    highestExpenseCategory = {
      name: maxCatName,
      amount: maxCatAmount,
      percentage: (maxCatAmount / totalExpense) * 100,
    };
  }

  return {
    monthKey,
    totalIncome,
    totalExpense,
    netBalance,
    savingsRate,
    dailyAverageExpense,
    daysInMonth,
    highestExpenseCategory,
    transactionCount: filtered.length,
  };
};

/**
 * Group expense categories for donut/pie chart
 */
export const calculateCategoryStats = (
  transactions: Transaction[],
  monthKey: string,
  type: 'expense' | 'income' = 'expense'
): CategoryStat[] => {
  const filtered = transactions.filter(
    (t) => t.date.startsWith(monthKey) && t.type === type
  );

  const map: Record<string, { amount: number; count: number }> = {};
  let total = 0;

  filtered.forEach((t) => {
    total += t.amount;
    if (!map[t.category]) {
      map[t.category] = { amount: 0, count: 0 };
    }
    map[t.category].amount += t.amount;
    map[t.category].count += 1;
  });

  if (total === 0) return [];

  const defaultColors = ['#ea580c', '#0284c7', '#db2777', '#7c3aed', '#059669', '#ca8a04', '#e11d48', '#475569'];

  return Object.entries(map)
    .map(([category, info], idx) => ({
      category,
      amount: info.amount,
      count: info.count,
      percentage: Number(((info.amount / total) * 100).toFixed(1)),
      color: CATEGORY_COLOR_MAP[category] || defaultColors[idx % defaultColors.length],
    }))
    .sort((a, b) => b.amount - a.amount);
};

/**
 * Generate daily breakdown for bar/area comparison charts
 */
export const calculateDailyBreakdown = (
  transactions: Transaction[],
  monthKey: string
): DailyComparison[] => {
  const [y, m] = monthKey.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();

  const dayMap: Record<number, { income: number; expense: number }> = {};
  for (let i = 1; i <= daysInMonth; i++) {
    dayMap[i] = { income: 0, expense: 0 };
  }

  transactions
    .filter((t) => t.date.startsWith(monthKey))
    .forEach((t) => {
      const dayNum = parseInt(t.date.split('-')[2], 10);
      if (dayMap[dayNum]) {
        if (t.type === 'income') {
          dayMap[dayNum].income += t.amount;
        } else {
          dayMap[dayNum].expense += t.amount;
        }
      }
    });

  return Object.entries(dayMap).map(([dayStr, data]) => {
    const day = parseInt(dayStr, 10);
    const fullDate = `${monthKey}-${String(day).padStart(2, '0')}`;
    return {
      day: `${day}`,
      fullDate,
      income: data.income,
      expense: data.expense,
      balance: data.income - data.expense,
    };
  });
};
