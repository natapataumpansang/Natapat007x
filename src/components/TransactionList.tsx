import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  Utensils,
  Car,
  ShoppingBag,
  Home,
  Film,
  HeartPulse,
  Sparkles,
  BookOpen,
  Briefcase,
  Laptop,
  Gift,
  TrendingUp,
  PlusCircle,
  HelpCircle,
  Clock,
  Plus,
} from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { formatCurrency, formatShortDate } from '../utils/formatters';
import { ALL_CATEGORIES } from '../constants/categories';

interface TransactionListProps {
  transactions: Transaction[];
  currentMonthKey: string;
  onEdit: (transaction: Transaction) => void;
  onDeleteRequest: (transaction: Transaction) => void;
  onAddNew: () => void;
}

const CategoryIcon: React.FC<{ name: string; className?: string }> = ({
  name,
  className = 'w-4 h-4',
}) => {
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

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  currentMonthKey,
  onEdit,
  onDeleteRequest,
  onAddNew,
}) => {
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter transactions for this month and apply search/type filters
  const filteredList = useMemo(() => {
    return transactions
      .filter((t) => t.date.startsWith(currentMonthKey))
      .filter((t) => {
        if (filterType !== 'all' && t.type !== filterType) return false;
        if (searchTerm.trim() !== '') {
          const term = searchTerm.toLowerCase();
          const matchNote = t.note?.toLowerCase().includes(term);
          const matchCat = t.category.toLowerCase().includes(term);
          const matchPay = t.paymentMethod.toLowerCase().includes(term);
          return matchNote || matchCat || matchPay;
        }
        return true;
      })
      .sort((a, b) => {
        // Sort by date desc, then by createdAt desc
        if (a.date !== b.date) {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        return b.createdAt - a.createdAt;
      });
  }, [transactions, currentMonthKey, filterType, searchTerm]);

  // Group by date
  const groupedTransactions = useMemo(() => {
    const groups: { date: string; displayDate: string; items: Transaction[] }[] = [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    filteredList.forEach((t) => {
      let group = groups.find((g) => g.date === t.date);
      if (!group) {
        let displayDate = formatShortDate(t.date);
        if (t.date === todayStr) {
          displayDate = `วันนี้ (${displayDate})`;
        } else if (t.date === yesterdayStr) {
          displayDate = `เมื่อวาน (${displayDate})`;
        }
        group = { date: t.date, displayDate, items: [] };
        groups.push(group);
      }
      group.items.push(t);
    });

    return groups;
  }, [filteredList]);

  // Helper to find category metadata
  const getCatMeta = (categoryName: string) => {
    return (
      ALL_CATEGORIES.find((c) => c.name === categoryName) || {
        icon: 'HelpCircle',
        color: '#475569',
        bgColor: '#f1f5f9',
      }
    );
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/80 space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-transactions"
            type="text"
            placeholder="ค้นหารายการ, หมวดหมู่, ช่องทางชำระ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 border border-slate-200 focus:outline-none focus:border-slate-700 transition-colors"
          />
        </div>

        {/* Filter chips */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <button
              id="filter-all"
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ทั้งหมด ({transactions.filter((t) => t.date.startsWith(currentMonthKey)).length})
            </button>
            <button
              id="filter-expense"
              type="button"
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                filterType === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              รายจ่าย
            </button>
            <button
              id="filter-income"
              type="button"
              onClick={() => setFilterType('income')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                filterType === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              รายรับ
            </button>
          </div>

          <span className="text-xs text-slate-400 font-medium shrink-0">
            {filteredList.length} รายการ
          </span>
        </div>
      </div>

      {/* Transaction List by Day Group */}
      {groupedTransactions.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">ไม่พบรายการบันทึก</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            {searchTerm
              ? 'ไม่พบข้อมูลที่ตรงกับคำค้นหา ลองเปลี่ยนคำค้นหาดูครับ'
              : 'ยังไม่มีรายการในเดือนนี้ เริ่มต้นบันทึกรายรับหรือรายจ่ายได้เลย'}
          </p>
          <button
            id="btn-empty-add-first"
            type="button"
            onClick={onAddNew}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 active:scale-95 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            เพิ่มรายการแรก
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedTransactions.map((group) => {
            const dayExpense = group.items
              .filter((i) => i.type === 'expense')
              .reduce((s, i) => s + i.amount, 0);
            const dayIncome = group.items
              .filter((i) => i.type === 'income')
              .reduce((s, i) => s + i.amount, 0);

            return (
              <div key={group.date} className="space-y-2">
                {/* Date header with daily sum */}
                <div className="flex items-center justify-between px-2 pt-1">
                  <span className="text-xs font-bold text-slate-700">{group.displayDate}</span>
                  <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                    {dayIncome > 0 && (
                      <span className="text-emerald-600">+{formatCurrency(dayIncome)}</span>
                    )}
                    {dayExpense > 0 && (
                      <span className="text-rose-600">-{formatCurrency(dayExpense)}</span>
                    )}
                  </div>
                </div>

                {/* List items */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
                  {group.items.map((tx) => {
                    const catMeta = getCatMeta(tx.category);
                    const isExpense = tx.type === 'expense';

                    return (
                      <div
                        key={tx.id}
                        className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* Icon and details */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                            style={{ backgroundColor: catMeta.bgColor, color: catMeta.color }}
                          >
                            <CategoryIcon name={catMeta.icon} className="w-5 h-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                {tx.category}
                              </span>
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-medium">
                                {tx.paymentMethod}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                              {tx.note && <span className="truncate">{tx.note}</span>}
                              {tx.time && (
                                <span className="flex items-center gap-0.5 text-slate-400 text-[11px] shrink-0">
                                  <Clock className="w-3 h-3" />
                                  {tx.time}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Amount and Action Buttons */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span
                              className={`text-sm sm:text-base font-extrabold tracking-tight ${
                                isExpense ? 'text-rose-600' : 'text-emerald-600'
                              }`}
                            >
                              {isExpense ? '-' : '+'}
                              {formatCurrency(tx.amount)}
                            </span>
                          </div>

                          <div className="flex items-center gap-0.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              id={`btn-edit-${tx.id}`}
                              type="button"
                              onClick={() => onEdit(tx)}
                              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-all"
                              title="แก้ไข"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              id={`btn-delete-${tx.id}`}
                              type="button"
                              onClick={() => onDeleteRequest(tx)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                              title="ลบ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
