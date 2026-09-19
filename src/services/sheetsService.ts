import { Transaction, MonthlySummary } from '../types';

export interface CreateSheetResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  rowsWritten: number;
}

/**
 * Creates a formatted Google Spreadsheet with income & expense records and a monthly summary tab
 */
export const exportTransactionsToGoogleSheets = async (
  accessToken: string,
  transactions: Transaction[],
  summaryTitle: string,
  monthlySummary?: MonthlySummary
): Promise<CreateSheetResult> => {
  const title = `บันทึกรายรับรายจ่าย - ${summaryTitle}`;

  // 1. Create Spreadsheet with 2 sheets: 'รายการธุรกรรม' and 'สรุปรายเดือน'
  const createPayload = {
    properties: {
      title,
    },
    sheets: [
      {
        properties: {
          title: 'รายการธุรกรรม',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
      },
      {
        properties: {
          title: 'สรุปการเงิน',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
      },
    ],
  };

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(createPayload),
  });

  if (!createRes.ok) {
    const errData = await createRes.json().catch(() => ({}));
    const message = errData?.error?.message || `สร้าง Google Sheet ไม่สำเร็จ (${createRes.status})`;
    throw new Error(message);
  }

  const createdData = await createRes.json();
  const spreadsheetId = createdData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

  // 2. Prepare transaction rows
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const transactionHeader = [
    'วันที่',
    'เวลา',
    'ประเภท',
    'หมวดหมู่',
    'จำนวนเงิน (บาท)',
    'ช่องทางชำระ',
    'หมายเหตุ',
  ];

  const transactionRows = sortedTransactions.map((t) => [
    t.date,
    t.time || '-',
    t.type === 'income' ? 'รายรับ (+)' : 'รายจ่าย (-)',
    t.category,
    t.type === 'income' ? t.amount : -t.amount,
    t.paymentMethod || 'เงินสด',
    t.note || '',
  ]);

  // 3. Prepare summary rows
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) : '0';

  const summaryHeader = ['หัวข้อสรุปการเงิน', 'มูลค่า (บาท / %)'];
  const summaryRows = [
    ['ช่วงข้อมูล', summaryTitle],
    ['จำนวนรายการทั้งหมด', `${transactions.length} รายการ`],
    ['รายรับรวมทั้งหมด (+)', totalIncome],
    ['รายจ่ายรวมทั้งหมด (-)', totalExpense],
    ['ยอดเงินคงเหลือสุทธิ', netBalance],
    ['อัตราการออมเงิน (%)', `${savingsRate}%`],
    ['วันที่ส่งออกข้อมูล', new Date().toLocaleString('th-TH')],
  ];

  // 4. Batch update values to Google Sheets
  const updateDataPayload = {
    valueInputOption: 'USER_ENTERED',
    data: [
      {
        range: "'รายการธุรกรรม'!A1:G",
        values: [transactionHeader, ...transactionRows],
      },
      {
        range: "'สรุปการเงิน'!A1:B",
        values: [summaryHeader, ...summaryRows],
      },
    ],
  };

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateDataPayload),
    }
  );

  if (!updateRes.ok) {
    console.warn('Could not populate initial data, but spreadsheet was created', updateRes.status);
  }

  return {
    spreadsheetId,
    spreadsheetUrl,
    title,
    rowsWritten: transactions.length,
  };
};
