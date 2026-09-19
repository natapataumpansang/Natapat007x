import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Cloud,
  Lock,
} from 'lucide-react';
import { Transaction, MonthlySummary, UserProfile } from '../types';
import { exportToExcel } from '../services/excelService';
import { exportTransactionsToGoogleSheets, CreateSheetResult } from '../services/sheetsService';
import { formatCurrency, formatMonthDisplay } from '../utils/formatters';

interface ExportViewProps {
  transactions: Transaction[];
  currentMonthKey: string;
  summary: MonthlySummary;
  user: UserProfile | null;
  accessToken: string | null;
  onGoogleSignIn: () => void;
  onRequestConfirm: (actionTitle: string, actionDesc: string, onExecute: () => Promise<void>) => void;
}

export const ExportView: React.FC<ExportViewProps> = ({
  transactions,
  currentMonthKey,
  summary,
  user,
  accessToken,
  onGoogleSignIn,
  onRequestConfirm,
}) => {
  const [exportScope, setExportScope] = useState<'month' | 'all'>('month');
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingSheets, setIsExportingSheets] = useState(false);
  const [lastSheetResult, setLastSheetResult] = useState<CreateSheetResult | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentMonthTransactions = transactions.filter((t) => t.date.startsWith(currentMonthKey));
  const activeTransactions = exportScope === 'month' ? currentMonthTransactions : transactions;
  const scopeTitle = exportScope === 'month' ? formatMonthDisplay(currentMonthKey) : 'ข้อมูลทั้งหมด (All Time)';

  // 1. Export to Excel (.xlsx)
  const handleExportExcel = () => {
    try {
      setIsExportingExcel(true);
      setStatusMessage(null);
      if (activeTransactions.length === 0) {
        setStatusMessage({ type: 'error', text: 'ไม่พบรายการสำหรับส่งออกในช่วงเวลานี้' });
        return;
      }
      exportToExcel(activeTransactions, scopeTitle, summary);
      setStatusMessage({
        type: 'success',
        text: `ส่งออกไฟล์ Excel (.xlsx) จำนวน ${activeTransactions.length} รายการ เรียบร้อยแล้ว!`,
      });
    } catch (err: any) {
      console.error('Export excel error:', err);
      setStatusMessage({ type: 'error', text: err.message || 'เกิดข้อผิดพลาดในการดาวน์โหลด Excel' });
    } finally {
      setIsExportingExcel(false);
    }
  };

  // 2. Export to Google Sheets
  const handleExportGoogleSheetsClick = () => {
    if (!accessToken) {
      onGoogleSignIn();
      return;
    }

    if (activeTransactions.length === 0) {
      setStatusMessage({ type: 'error', text: 'ไม่พบรายการสำหรับส่งออกในช่วงเวลานี้' });
      return;
    }

    // MANDATORY confirmation dialog per Workspace Integration Skill
    onRequestConfirm(
      'สร้างสเปรดชีต Google Sheets',
      `ระบบจะสร้าง Google Spreadsheet ใหม่ใน Google Drive ของคุณ: "${user?.email || 'บัญชีของคุณ'}"\nพร้อมบันทึกรายการทั้งหมด ${activeTransactions.length} รายการ และสรุปยอดรายรับรายจ่าย\n\nต้องการดำเนินการต่อหรือไม่?`,
      async () => {
        setIsExportingSheets(true);
        setStatusMessage(null);
        try {
          const result = await exportTransactionsToGoogleSheets(
            accessToken,
            activeTransactions,
            scopeTitle,
            summary
          );
          setLastSheetResult(result);
          setStatusMessage({
            type: 'success',
            text: `สร้างและส่งออกข้อมูลไปยัง Google Sheets สำเร็จเรียบร้อย (${result.rowsWritten} รายการ)`,
          });
        } catch (err: any) {
          console.error('Export Sheets error:', err);
          setStatusMessage({
            type: 'error',
            text: err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Google Sheets',
          });
        } finally {
          setIsExportingSheets(false);
        }
      }
    );
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Scope Selector */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80">
        <h3 className="text-sm font-bold text-slate-900 mb-1">เลือกขอบเขตข้อมูลที่ต้องการส่งออก</h3>
        <p className="text-xs text-slate-500 mb-3">
          กำหนดช่วงเวลาของรายการธุรกรรมที่ต้องการสร้างเป็นไฟล์
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            id="btn-scope-month"
            type="button"
            onClick={() => setExportScope('month')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              exportScope === 'month'
                ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 shadow-xs'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Calendar
                className={`w-4 h-4 ${
                  exportScope === 'month' ? 'text-emerald-600' : 'text-slate-500'
                }`}
              />
              <span className="text-xs font-bold">เฉพาะเดือนปัจจุบัน</span>
            </div>
            <p className="text-[11px] text-slate-500 truncate">
              {formatMonthDisplay(currentMonthKey)} ({currentMonthTransactions.length} รายการ)
            </p>
          </button>

          <button
            id="btn-scope-all"
            type="button"
            onClick={() => setExportScope('all')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              exportScope === 'all'
                ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 shadow-xs'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Layers
                className={`w-4 h-4 ${
                  exportScope === 'all' ? 'text-emerald-600' : 'text-slate-500'
                }`}
              />
              <span className="text-xs font-bold">ข้อมูลทั้งหมด</span>
            </div>
            <p className="text-[11px] text-slate-500 truncate">
              ทุกช่วงเวลา ({transactions.length} รายการ)
            </p>
          </button>
        </div>
      </div>

      {/* Export Options: Excel (.xlsx) & Google Sheets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Direct Excel (.xlsx) Export */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">ดาวน์โหลดเป็นไฟล์ Excel</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              ส่งออกเป็นไฟล์นามสกุล <strong>.xlsx</strong> พร้อมเปิดได้ทันทีบน Microsoft Excel,
              Apple Numbers หรือแอปมือถือ พร้อมชีตสรุปยอดและสถิติแยกตามหมวดหมู่
            </p>
          </div>

          <button
            id="btn-download-excel"
            type="button"
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            className="mt-5 w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-98 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isExportingExcel ? 'กำลังจัดทำไฟล์...' : `ส่งออก Excel (${activeTransactions.length} รายการ)`}
          </button>
        </div>

        {/* Card 2: Google Sheets Sync & Export */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
              <Cloud className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-slate-900">บันทึกบน Google Sheets</h4>
              <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                Workspace
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              สร้าง Spreadsheet ใหม่ลงในบัญชี Google Drive ของคุณโดยอัตโนมัติ
              เข้าถึงและแชร์ผ่านออนไลน์ได้ทุกอุปกรณ์
            </p>
          </div>

          <div className="mt-5">
            {accessToken ? (
              <button
                id="btn-export-google-sheets"
                type="button"
                onClick={handleExportGoogleSheetsClick}
                disabled={isExportingSheets}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all disabled:opacity-50"
              >
                <Cloud className="w-4 h-4 text-emerald-400" />
                {isExportingSheets ? 'กำลังสร้าง Google Sheets...' : 'สร้างและบันทึกลง Google Sheets'}
              </button>
            ) : (
              <button
                id="btn-login-sheets-export"
                type="button"
                onClick={onGoogleSignIn}
                className="w-full py-2.5 px-4 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                <span>เข้าสู่ระบบ Google เพื่อเชื่อมต่อ Sheets</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Status / Success Alert */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-medium border flex items-center gap-3 animate-in fade-in duration-200 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="flex-1">{statusMessage.text}</span>
        </div>
      )}

      {/* Last Created Google Sheet Link Card */}
      {lastSheetResult && (
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-5 shadow-lg border border-blue-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              สร้าง Google Sheet สำเร็จแล้ว
            </span>
            <h4 className="text-sm font-bold text-white">{lastSheetResult.title}</h4>
            <p className="text-xs text-blue-200">
              บันทึกเรียบร้อยจำนวน {lastSheetResult.rowsWritten} รายการพร้อมชีตสรุปการเงิน
            </p>
          </div>

          <a
            id="link-open-google-sheet"
            href={lastSheetResult.spreadsheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-blue-50 active:scale-95 transition-all shadow-md shrink-0"
          >
            <span>เปิด Google Sheets</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Summary Preview Box */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          พรีวิวสรุปข้อมูลที่จะถูกส่งออก ({scopeTitle})
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-[11px] text-slate-400">รายการทั้งหมด</span>
            <p className="text-sm font-bold text-slate-800 mt-0.5">
              {activeTransactions.length} รายการ
            </p>
          </div>
          <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
            <span className="text-[11px] text-emerald-600">รายรับรวม</span>
            <p className="text-sm font-bold text-emerald-700 mt-0.5">
              {formatCurrency(
                activeTransactions
                  .filter((t) => t.type === 'income')
                  .reduce((s, t) => s + t.amount, 0)
              )}
            </p>
          </div>
          <div className="bg-rose-50 p-3 rounded-2xl border border-rose-100">
            <span className="text-[11px] text-rose-600">รายจ่ายรวม</span>
            <p className="text-sm font-bold text-rose-700 mt-0.5">
              {formatCurrency(
                activeTransactions
                  .filter((t) => t.type === 'expense')
                  .reduce((s, t) => s + t.amount, 0)
              )}
            </p>
          </div>
          <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100">
            <span className="text-[11px] text-blue-600">ยอดคงเหลือ</span>
            <p className="text-sm font-bold text-blue-700 mt-0.5">
              {formatCurrency(
                activeTransactions.reduce(
                  (s, t) => (t.type === 'income' ? s + t.amount : s - t.amount),
                  0
                )
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
