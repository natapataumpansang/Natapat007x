import React from 'react';
import { ListOrdered, BarChart3, Download, Plus } from 'lucide-react';

export type ActiveTab = 'transactions' | 'analytics' | 'export';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onQuickAdd: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onQuickAdd,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-lg px-4 py-2">
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        {/* Tab 1: Transactions */}
        <button
          id="nav-tab-transactions"
          type="button"
          onClick={() => onTabChange('transactions')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
            activeTab === 'transactions'
              ? 'text-slate-900 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              activeTab === 'transactions' ? 'bg-slate-100 text-slate-900' : ''
            }`}
          >
            <ListOrdered className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5">รายการ</span>
        </button>

        {/* Center Quick Add Floating Button */}
        <button
          id="btn-bottom-quick-add"
          type="button"
          onClick={onQuickAdd}
          className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/30 -mt-6 active:scale-95 transition-all hover:brightness-110 border-2 border-white"
          aria-label="เพิ่มรายการใหม่"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Tab 2: Analytics */}
        <button
          id="nav-tab-analytics"
          type="button"
          onClick={() => onTabChange('analytics')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
            activeTab === 'analytics'
              ? 'text-slate-900 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              activeTab === 'analytics' ? 'bg-slate-100 text-slate-900' : ''
            }`}
          >
            <BarChart3 className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5">วิเคราะห์กราฟ</span>
        </button>

        {/* Tab 3: Export */}
        <button
          id="nav-tab-export"
          type="button"
          onClick={() => onTabChange('export')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
            activeTab === 'export'
              ? 'text-slate-900 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              activeTab === 'export' ? 'bg-slate-100 text-slate-900' : ''
            }`}
          >
            <Download className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5">ส่งออก Excel</span>
        </button>
      </div>
    </nav>
  );
};
