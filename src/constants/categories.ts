import { Category } from '../types';

export const EXPENSE_CATEGORIES: Category[] = [
  {
    id: 'food',
    name: 'อาหาร & เครื่องดื่ม',
    type: 'expense',
    icon: 'Utensils',
    color: '#ea580c',
    bgColor: '#ffedd5',
  },
  {
    id: 'transport',
    name: 'การเดินทาง / คมนาคม',
    type: 'expense',
    icon: 'Car',
    color: '#0284c7',
    bgColor: '#e0f2fe',
  },
  {
    id: 'shopping',
    name: 'ช้อปปิ้ง / เสื้อผ้า',
    type: 'expense',
    icon: 'ShoppingBag',
    color: '#db2777',
    bgColor: '#fce7f3',
  },
  {
    id: 'housing',
    name: 'ที่พัก / ค่าน้ำ ค่าไฟ',
    type: 'expense',
    icon: 'Home',
    color: '#7c3aed',
    bgColor: '#ede9fe',
  },
  {
    id: 'entertainment',
    name: 'บันเทิง / ท่องเที่ยว',
    type: 'expense',
    icon: 'Film',
    color: '#e11d48',
    bgColor: '#ffe4e6',
  },
  {
    id: 'health',
    name: 'สุขภาพ & ยา',
    type: 'expense',
    icon: 'HeartPulse',
    color: '#059669',
    bgColor: '#d1fae5',
  },
  {
    id: 'personal',
    name: 'ของใช้ส่วนตัว',
    type: 'expense',
    icon: 'Sparkles',
    color: '#d97706',
    bgColor: '#fef3c7',
  },
  {
    id: 'education',
    name: 'การศึกษา / หนังสือ',
    type: 'expense',
    icon: 'BookOpen',
    color: '#2563eb',
    bgColor: '#dbeafe',
  },
  {
    id: 'other_expense',
    name: 'ค่าใช้จ่ายอื่นๆ',
    type: 'expense',
    icon: 'HelpCircle',
    color: '#475569',
    bgColor: '#f1f5f9',
  },
];

export const INCOME_CATEGORIES: Category[] = [
  {
    id: 'salary',
    name: 'เงินเดือนประจำ',
    type: 'income',
    icon: 'Briefcase',
    color: '#16a34a',
    bgColor: '#dcfce7',
  },
  {
    id: 'freelance',
    name: 'ฟรีแลนซ์ / งานเสริม',
    type: 'income',
    icon: 'Laptop',
    color: '#0d9488',
    bgColor: '#ccfbf1',
  },
  {
    id: 'bonus',
    name: 'โบนัส & รางวัล',
    type: 'income',
    icon: 'Gift',
    color: '#ca8a04',
    bgColor: '#fef08a',
  },
  {
    id: 'investment',
    name: 'ผลตอบแทนลงทุน/ปันผล',
    type: 'income',
    icon: 'TrendingUp',
    color: '#2563eb',
    bgColor: '#dbeafe',
  },
  {
    id: 'other_income',
    name: 'รายรับอื่นๆ',
    type: 'income',
    icon: 'PlusCircle',
    color: '#475569',
    bgColor: '#f1f5f9',
  },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export const PAYMENT_METHODS = [
  'โอนเงิน/พร้อมเพย์',
  'เงินสด',
  'บัตรเครดิต/เดบิต',
  'e-Wallet',
  'อื่นๆ',
] as const;

export const CATEGORY_COLOR_MAP: Record<string, string> = ALL_CATEGORIES.reduce(
  (acc, item) => ({ ...acc, [item.name]: item.color }),
  {}
);
