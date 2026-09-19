import * as XLSX from 'xlsx';
import { Transaction, MonthlySummary } from '../types';

/**
 * Exports transactions and monthly summary to an Excel (.xlsx) file and triggers download
 */
export const exportToExcel = (
  transactions: Transaction[],
  summaryTitle: string,
  summary?: MonthlySummary
): void => {
  const wb = XLSX.utils.book_new();

  // 1. Transactions Sheet
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const txData = sorted.map((t, idx) => ({
    ลำดับ: idx + 1,
    วันที่: t.date,
    เวลา: t.time || '-',
    ประเภท: t.type === 'income' ? 'รายรับ' : 'รายจ่าย',
    หมวดหมู่: t.category,
    'จำนวนเงิน (บาท)': t.amount,
    'ช่องทางชำระ': t.paymentMethod,
    หมายเหตุ: t.note || '',
  }));

  const wsTransactions = XLSX.utils.json_to_sheet(txData);

  // Set column widths for aesthetic presentation
  wsTransactions['!cols'] = [
    { wch: 8 },  // ลำดับ
    { wch: 14 }, // วันที่
    { wch: 10 }, // เวลา
    { wch: 12 }, // ประเภท
    { wch: 22 }, // หมวดหมู่
    { wch: 16 }, // จำนวนเงิน
    { wch: 18 }, // ช่องทางชำระ
    { wch: 30 }, // หมายเหตุ
  ];

  XLSX.utils.book_append_sheet(wb, wsTransactions, 'รายการรายรับรายจ่าย');

  // 2. Summary Sheet
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) : '0';

  // Category breakdown
  const categoryMap: Record<string, { income: number; expense: number }> = {};
  transactions.forEach((t) => {
    if (!categoryMap[t.category]) {
      categoryMap[t.category] = { income: 0, expense: 0 };
    }
    if (t.type === 'income') {
      categoryMap[t.category].income += t.amount;
    } else {
      categoryMap[t.category].expense += t.amount;
    }
  });

  const summaryData = [
    { รายการ: 'ช่วงเวลา', ค่า: summaryTitle },
    { รายการ: 'จำนวนรายการทั้งหมด', ค่า: `${transactions.length} รายการ` },
    { รายการ: 'รายรับรวม (บาท)', ค่า: totalIncome },
    { รายการ: 'รายจ่ายรวม (บาท)', ค่า: totalExpense },
    { รายการ: 'ยอดเงินคงเหลือสุทธิ (บาท)', ค่า: netBalance },
    { รายการ: 'อัตราการออมเงิน (%)', ค่า: `${savingsRate}%` },
    { รายการ: 'วันที่สร้างเอกสาร', ค่า: new Date().toLocaleDateString('th-TH') },
  ];

  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 26 }, { wch: 30 }];

  // Append Category Breakdown table below summary
  const breakdownRows = Object.entries(categoryMap).map(([cat, val]) => ({
    หมวดหมู่: cat,
    'รายรับ (บาท)': val.income || 0,
    'รายจ่าย (บาท)': val.expense || 0,
    'สัดส่วนรายจ่าย (%)':
      totalExpense > 0 && val.expense > 0
        ? `${((val.expense / totalExpense) * 100).toFixed(1)}%`
        : '-',
  }));

  // Add category breakdown table into same summary sheet or separate sheet
  const wsBreakdown = XLSX.utils.json_to_sheet(breakdownRows);
  wsBreakdown['!cols'] = [{ wch: 24 }, { wch: 16 }, { wch: 16 }, { wch: 18 }];

  XLSX.utils.book_append_sheet(wb, wsSummary, 'สรุปภาพรวม');
  XLSX.utils.book_append_sheet(wb, wsBreakdown, 'สรุปแยกตามหมวดหมู่');

  // Generate filename
  const cleanTitle = summaryTitle.replace(/[^a-zA-Z0-9_\u0E00-\u0E7F]/g, '_');
  const filename = `Expense_Report_${cleanTitle}.xlsx`;

  XLSX.writeFile(wb, filename);
};
