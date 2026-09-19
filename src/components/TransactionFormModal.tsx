import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Plus,
  Minus,
  Utensils,
  Car,
  ShoppingBag,
  Home,
  Film,
  HeartPulse,
  Sparkles,
  BookOpen,
  HelpCircle,
  Briefcase,
  Laptop,
  Gift,
  TrendingUp,
  PlusCircle,
  Calendar,
  Clock,
  CreditCard,
  FileText,
} from 'lucide-react';
import { Transaction, TransactionType, PaymentMethod } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '../constants/categories';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactionData: Omit<Transaction, 'id' | 'createdAt'>, existingId?: string) => void;
  editTransaction?: Transaction | null;
  defaultMonthKey: string;
}

// Icon mapper for categories
const CategoryIcon: React.FC<{ name: string; className?: string }> = ({ name, className = 'w-5 h-5' }) => {
  switch (name) {
    case 'Utensils':
      return <Utensils className={className} />;
    case 'Car':
      return <Car className={className} />;
    case 'ShoppingBag':
      return <ShoppingBag className={className} />;
    case 'Home':
      return <Home className={className} />;
    case 'Film':
      return <Film className={className} />;
    case 'HeartPulse':
      return <HeartPulse className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'BookOpen':
      return <BookOpen className={className} />;
    case 'Briefcase':
      return <Briefcase className={className} />;
    case 'Laptop':
      return <Laptop className={className} />;
    case 'Gift':
      return <Gift className={className} />;
    case 'TrendingUp':
      return <TrendingUp className={className} />;
    case 'PlusCircle':
      return <PlusCircle className={className} />;
    default:
      return <HelpCircle className={className} />;
  }
};

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editTransaction,
  defaultMonthKey,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('โอนเงิน/พร้อมเพย์');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Set default or edit values when modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (editTransaction) {
      setType(editTransaction.type);
      setAmount(String(editTransaction.amount));
      setCategory(editTransaction.category);
      setNote(editTransaction.note || '');
      setDate(editTransaction.date);
      setTime(editTransaction.time || '');
      setPaymentMethod(editTransaction.paymentMethod);
      setErrorMsg('');
    } else {
      const today = new Date();
      const todayMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      
      // If user is currently looking at another month, prefill with first day of that month
      let initialDate: string;
      if (defaultMonthKey === todayMonthKey) {
        initialDate = today.toISOString().split('T')[0];
      } else {
        initialDate = `${defaultMonthKey}-01`;
      }

      const hours = String(today.getHours()).padStart(2, '0');
      const minutes = String(today.getMinutes()).padStart(2, '0');

      setType('expense');
      setAmount('');
      setCategory(EXPENSE_CATEGORIES[0].name);
      setNote('');
      setDate(initialDate);
      setTime(`${hours}:${minutes}`);
      setPaymentMethod('โอนเงิน/พร้อมเพย์');
      setErrorMsg('');
    }
  }, [isOpen, editTransaction, defaultMonthKey]);

  // Update category when switching type
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'expense') {
      setCategory(EXPENSE_CATEGORIES[0].name);
    } else {
      setCategory(INCOME_CATEGORIES[0].name);
    }
  };

  const handleQuickAddAmount = (addValue: number) => {
    const current = parseFloat(amount) || 0;
    setAmount(String(current + addValue));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('กรุณากรอกจำนวนเงินที่มากกว่า 0');
      return;
    }
    if (!category) {
      setErrorMsg('กรุณาเลือกหมวดหมู่');
      return;
    }
    if (!date) {
      setErrorMsg('กรุณาเลือกวันที่');
      return;
    }

    onSave(
      {
        type,
        amount: Math.round(numAmount * 100) / 100,
        category,
        note: note.trim() || undefined,
        date,
        time: time || undefined,
        paymentMethod,
      },
      editTransaction ? editTransaction.id : undefined
    );
    onClose();
  };

  if (!isOpen) return null;

  const currentCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100"
        role="dialog"
      >
        {/* Header with Type Toggle */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex bg-slate-200/80 p-1 rounded-2xl w-52">
            <button
              id="tab-expense"
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Minus className="w-3.5 h-3.5" />
              รายจ่าย
            </button>
            <button
              id="tab-income"
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              รายรับ
            </button>
          </div>

          <button
            id="btn-close-form-modal"
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-all"
            aria-label="ปิด"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-5 flex-1">
          {/* Big Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              จำนวนเงิน (บาท) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                ฿
              </span>
              <input
                id="input-amount"
                type="number"
                step="any"
                inputMode="decimal"
                autoFocus
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                className={`w-full pl-11 pr-4 py-3 text-3xl font-extrabold rounded-2xl border outline-none transition-all ${
                  type === 'expense'
                    ? 'border-rose-200 text-rose-600 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                    : 'border-emerald-200 text-emerald-600 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
                }`}
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1">
              <span className="text-[11px] text-slate-400 shrink-0 font-medium">เพิ่มด่วน:</span>
              {[20, 50, 100, 500, 1000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAddAmount(val)}
                  className="shrink-0 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
                >
                  +{val}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmount('')}
                className="shrink-0 px-2 py-1 text-xs text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
              >
                ล้าง
              </button>
            </div>
          </div>

          {/* Category Selector Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2">
              หมวดหมู่ * ({currentCategories.length} รายการ)
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              {currentCategories.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'border-slate-800 bg-slate-900 text-white shadow-md scale-[1.02]'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center mb-1 transition-colors"
                      style={{
                        backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : cat.bgColor,
                        color: isSelected ? '#ffffff' : cat.color,
                      }}
                    >
                      <CategoryIcon name={cat.icon} className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-medium truncate w-full leading-tight">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                วันที่ *
              </label>
              <input
                id="input-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:border-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                เวลา
              </label>
              <input
                id="input-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:border-slate-800"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
              ช่องทางการชำระ
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PAYMENT_METHODS.map((pm) => {
                const isSelected = paymentMethod === pm;
                return (
                  <button
                    key={pm}
                    type="button"
                    onClick={() => setPaymentMethod(pm)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {pm}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note / Memo */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              บันทึกช่วยจำ (หมายเหตุ)
            </label>
            <input
              id="input-note"
              type="text"
              placeholder="เช่น ข้าวกลางวัน, บัตรรถไฟฟ้า, ค่ากาแฟ..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-slate-800 placeholder:text-slate-400"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              id="btn-save-transaction"
              type="submit"
              className={`w-full py-3.5 px-4 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
              }`}
            >
              <Check className="w-4 h-4" />
              {editTransaction ? 'บันทึกการแก้ไข' : `เพิ่ม${type === 'expense' ? 'รายจ่าย' : 'รายรับ'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
