export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 'เงินสด' | 'โอนเงิน/พร้อมเพย์' | 'บัตรเครดิต/เดบิต' | 'e-Wallet' | 'อื่นๆ';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  bgColor: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  note?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  paymentMethod: PaymentMethod;
  createdAt: number;
}

export interface MonthlySummary {
  monthKey: string; // YYYY-MM
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingsRate: number; // percentage 0-100
  dailyAverageExpense: number;
  daysInMonth: number;
  highestExpenseCategory: { name: string; amount: number; percentage: number } | null;
  transactionCount: number;
}

export interface CategoryStat {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  count: number;
}

export interface DailyComparison {
  day: string; // DD or DD/MM
  fullDate: string;
  income: number;
  expense: number;
  balance: number;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}
