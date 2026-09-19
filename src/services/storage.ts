import { Transaction } from '../types';

const STORAGE_KEY = 'thai_expense_tracker_transactions_v1';

// Helpers for dates
const getRecentDateString = (dayOffset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - dayOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getSpecificMonthDate = (year: number, monthIndex: number, day: number): string => {
  const y = String(year);
  const m = String(monthIndex + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const generateDefaultTransactions = (): Transaction[] => {
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth();

  return [
    {
      id: 'tx-seed-1',
      type: 'income',
      amount: 45000,
      category: 'เงินเดือนประจำ',
      note: 'เงินเดือนประจำเดือน',
      date: getSpecificMonthDate(curYear, curMonth, 1),
      time: '09:00',
      paymentMethod: 'โอนเงิน/พร้อมเพย์',
      createdAt: Date.now() - 86400000 * 20,
    },
    {
      id: 'tx-seed-2',
      type: 'income',
      amount: 7500,
      category: 'ฟรีแลนซ์ / งานเสริม',
      note: 'รับจ้างทำกราฟิก & เว็บไซต์',
      date: getSpecificMonthDate(curYear, curMonth, 10),
      time: '14:30',
      paymentMethod: 'โอนเงิน/พร้อมเพย์',
      createdAt: Date.now() - 86400000 * 10,
    },
    {
      id: 'tx-seed-3',
      type: 'expense',
      amount: 8500,
      category: 'ที่พัก / ค่าน้ำ ค่าไฟ',
      note: 'ค่าเช่าห้องพักประจำเดือน',
      date: getSpecificMonthDate(curYear, curMonth, 2),
      time: '10:00',
      paymentMethod: 'โอนเงิน/พร้อมเพย์',
      createdAt: Date.now() - 86400000 * 18,
    },
    {
      id: 'tx-seed-4',
      type: 'expense',
      amount: 1450,
      category: 'ที่พัก / ค่าน้ำ ค่าไฟ',
      note: 'ค่าน้ำ-ค่าไฟ-อินเทอร์เน็ตบ้าน',
      date: getSpecificMonthDate(curYear, curMonth, 3),
      time: '11:15',
      paymentMethod: 'โอนเงิน/พร้อมเพย์',
      createdAt: Date.now() - 86400000 * 17,
    },
    {
      id: 'tx-seed-5',
      type: 'expense',
      amount: 65,
      category: 'อาหาร & เครื่องดื่ม',
      note: 'ข้าวกะเพราไข่ดาว',
      date: getRecentDateString(0),
      time: '12:15',
      paymentMethod: 'โอนเงิน/พร้อมเพย์',
      createdAt: Date.now() - 10000,
    },
    {
      id: 'tx-seed-6',
      type: 'expense',
      amount: 60,
      category: 'อาหาร & เครื่องดื่ม',
      note: 'กาแฟอเมซอนเย็น',
      date: getRecentDateString(0),
      time: '13:00',
      paymentMethod: 'โอนเงิน/พร้อมเพย์',
      createdAt: Date.now() - 5000,
    },
    {
      id: 'tx-seed-7',
      type: 'expense',
      amount: 550,
      category: 'การเดินทาง / คมนาคม',
      note: 'เติมเงินบัตร BTS รถไฟฟ้า',
      date: getRecentDateString(1),
      time: '08:45',
      paymentMethod: 'บัตรเครดิต/เดบิต',
      createdAt: Date.now() - 86400000 * 1,
    },
    {
      id: 'tx-seed-8',
      type: 'expense',
      amount: 520,
      category: 'อาหาร & เครื่องดื่ม',
      note: 'สุกี้ตี๋น้อย มื้อเย็นกับเพื่อน',
      date: getRecentDateString(1),
      time: '19:30',
      paymentMethod: 'โอนเงิน/พร้อมเพย์',
      createdAt: Date.now() - 86400000 * 1 - 3600000,
    },
    {
      id: 'tx-seed-9',
      type: 'expense',
      amount: 1290,
      category: 'ช้อปปิ้ง / เสื้อผ้า',
      note: 'ซื้อเสื้อเชิ้ตใส่ทำงาน',
      date: getRecentDateString(3),
      time: '15:20',
      paymentMethod: 'บัตรเครดิต/เดบิต',
      createdAt: Date.now() - 86400000 * 3,
    },
    {
      id: 'tx-seed-10',
      type: 'expense',
      amount: 350,
      category: 'บันเทิง / ท่องเที่ยว',
      note: 'ตั๋วชมภาพยนตร์ Major Cineplex',
      date: getRecentDateString(4),
      time: '18:00',
      paymentMethod: 'โอนเงิน/พร้อมเพย์',
      createdAt: Date.now() - 86400000 * 4,
    },
    {
      id: 'tx-seed-11',
      type: 'expense',
      amount: 1100,
      category: 'การเดินทาง / คมนาคม',
      note: 'เติมน้ำมันรถยนต์ ปตท.',
      date: getRecentDateString(6),
      time: '09:20',
      paymentMethod: 'บัตรเครดิต/เดบิต',
      createdAt: Date.now() - 86400000 * 6,
    },
    {
      id: 'tx-seed-12',
      type: 'expense',
      amount: 650,
      category: 'สุขภาพ & ยา',
      note: 'วิตามินรวมและยาสามัญประจำบ้าน',
      date: getRecentDateString(8),
      time: '16:40',
      paymentMethod: 'เงินสด',
      createdAt: Date.now() - 86400000 * 8,
    },
  ];
};

export const loadStoredTransactions = (): Transaction[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaults = generateDefaultTransactions();
      saveTransactions(defaults);
      return defaults;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    const defaults = generateDefaultTransactions();
    saveTransactions(defaults);
    return defaults;
  } catch (err) {
    console.error('Error loading stored transactions:', err);
    return generateDefaultTransactions();
  }
};

export const saveTransactions = (transactions: Transaction[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (err) {
    console.error('Error saving transactions to localStorage:', err);
  }
};
