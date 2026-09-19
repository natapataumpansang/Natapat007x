import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, User, LogOut, FileSpreadsheet } from 'lucide-react';
import { formatMonthDisplay } from '../utils/formatters';
import { UserProfile } from '../types';

interface HeaderProps {
  currentMonthKey: string;
  onMonthChange: (newMonthKey: string) => void;
  user: UserProfile | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  isLoggingIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonthKey,
  onMonthChange,
  user,
  onLoginClick,
  onLogoutClick,
  isLoggingIn,
}) => {
  const handlePrevMonth = () => {
    const [y, m] = currentMonthKey.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    const newKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    onMonthChange(newKey);
  };

  const handleNextMonth = () => {
    const [y, m] = currentMonthKey.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    const newKey = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
    onMonthChange(newKey);
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    const curKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    onMonthChange(curKey);
  };

  const nowKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const isThisMonth = currentMonthKey === nowKey;

  return (
    <header className="bg-slate-900 text-white pt-4 pb-4 px-4 sticky top-0 z-30 shadow-md">
      <div className="max-w-xl mx-auto">
        {/* Top bar with logo and profile */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight leading-none">
                สมุดรายรับรายจ่าย
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Mobile Finance & Sheets</p>
            </div>
          </div>

          {/* User Profile / Google Sign-in */}
          <div>
            {user ? (
              <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-full pl-1.5 pr-2.5 py-1">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Google User'}
                    className="w-6 h-6 rounded-full object-cover border border-emerald-400"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-medium">
                    {user.displayName?.charAt(0) || <User className="w-3.5 h-3.5" />}
                  </div>
                )}
                <span className="text-xs text-slate-200 font-medium max-w-[90px] truncate">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <button
                  id="btn-logout"
                  onClick={onLogoutClick}
                  title="ออกจากระบบ Google"
                  className="text-slate-400 hover:text-rose-400 transition-colors ml-0.5 p-0.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="btn-header-login"
                onClick={onLoginClick}
                disabled={isLoggingIn}
                className="flex items-center gap-1.5 bg-white text-slate-800 hover:bg-slate-100 text-xs font-semibold px-2.5 py-1.5 rounded-full transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27A7.2 7.2 0 014.9 12c0-.79.14-1.57.38-2.27V6.58H1.25A11.96 11.96 0 000 12c0 1.92.45 3.74 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>{isLoggingIn ? 'กำลังเชื่อมต่อ...' : 'Google Sheets'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Month Selector Carousel */}
        <div className="flex items-center justify-between bg-slate-800/90 rounded-2xl p-1 border border-slate-700/70">
          <button
            id="btn-prev-month"
            onClick={handlePrevMonth}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/70 active:scale-95 transition-all"
            aria-label="เดือนก่อนหน้า"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-white tracking-wide">
              {formatMonthDisplay(currentMonthKey)}
            </span>
            {!isThisMonth && (
              <button
                id="btn-current-month-badge"
                onClick={handleCurrentMonth}
                className="text-[11px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full hover:bg-emerald-500/30 transition-all font-medium"
              >
                เดือนปัจจุบัน
              </button>
            )}
          </div>

          <button
            id="btn-next-month"
            onClick={handleNextMonth}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/70 active:scale-95 transition-all"
            aria-label="เดือนถัดไป"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
