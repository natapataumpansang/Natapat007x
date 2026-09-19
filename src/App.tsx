/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { BalanceCard } from './components/BalanceCard';
import { TransactionList } from './components/TransactionList';
import { AnalyticsView } from './components/AnalyticsView';
import { ExportView } from './components/ExportView';
import { BottomNav, ActiveTab } from './components/BottomNav';
import { TransactionFormModal } from './components/TransactionFormModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { Transaction, UserProfile } from './types';
import { loadStoredTransactions, saveTransactions, generateDefaultTransactions } from './services/storage';
import { calculateMonthlySummary } from './utils/formatters';
import { initAuth, googleSignIn, logout, getAccessToken } from './services/firebaseAuth';
import { RotateCcw } from 'lucide-react';

export default function App() {
  // 1. Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadStoredTransactions());

  // 2. Active Month Key (YYYY-MM)
  const [currentMonthKey, setCurrentMonthKey] = useState<string>(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  });

  // 3. Navigation Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('transactions');

  // 4. Modal States
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isDestructive: boolean;
    onConfirm: () => Promise<void> | void;
    isLoading?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    isDestructive: false,
    onConfirm: () => {},
    isLoading: false,
  });

  // 5. Auth State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Initialize Firebase Auth listener on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (profile, token) => {
        setUser(profile);
        setAccessToken(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Persist transactions whenever they change
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  // Calculate monthly summary
  const summary = useMemo(() => {
    return calculateMonthlySummary(transactions, currentMonthKey);
  }, [transactions, currentMonthKey]);

  // Handlers for Google Auth
  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
  };

  // Handlers for Transaction CRUD
  const handleSaveTransaction = (
    data: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      // Edit existing
      setTransactions((prev) =>
        prev.map((t) => (t.id === existingId ? { ...t, ...data } : t))
      );
    } else {
      // Create new
      const newTransaction: Transaction = {
        ...data,
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: Date.now(),
      };
      setTransactions((prev) => [newTransaction, ...prev]);

      // If added transaction is in a different month, switch to that month so the user sees it
      const txMonthKey = data.date.substring(0, 7);
      if (txMonthKey !== currentMonthKey) {
        setCurrentMonthKey(txMonthKey);
      }
    }
    setEditingTransaction(null);
  };

  const handleEditRequest = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsFormOpen(true);
  };

  const handleDeleteRequest = (tx: Transaction) => {
    setConfirmModal({
      isOpen: true,
      title: 'ยืนยันการลบรายการ',
      message: `คุณต้องการลบรายการ "${tx.category}" จำนวน ฿${tx.amount.toLocaleString()} วันที่ ${tx.date} ใช่หรือไม่?\nการดำเนินการนี้ไม่สามารถยกเลิกได้`,
      isDestructive: true,
      onConfirm: () => {
        setTransactions((prev) => prev.filter((t) => t.id !== tx.id));
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Request generic confirmation (used for sheets creation / destructive operations)
  const handleRequestConfirm = (
    title: string,
    message: string,
    onExecute: () => Promise<void>
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      isDestructive: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isLoading: true }));
        try {
          await onExecute();
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
        }
      },
    });
  };

  // Reset to default Thai seed data
  const handleResetSeedData = () => {
    setConfirmModal({
      isOpen: true,
      title: 'รีเซ็ตข้อมูลตัวอย่าง',
      message: 'ต้องการโหลดชุดข้อมูลตัวอย่างสำหรับทดสอบระบบใช่หรือไม่? ข้อมูลที่มีอยู่เดิมจะถูกแทนที่ด้วยข้อมูลทดสอบ',
      isDestructive: true,
      onConfirm: () => {
        const defaults = generateDefaultTransactions();
        setTransactions(defaults);
        const now = new Date();
        setCurrentMonthKey(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-start text-slate-800 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Mobile-Proportioned App Container */}
      <div className="w-full max-w-lg min-h-screen bg-slate-50 flex flex-col shadow-2xl relative border-x border-slate-200 pb-24">
        {/* Sticky Header with Month Selector & Profile */}
        <Header
          currentMonthKey={currentMonthKey}
          onMonthChange={setCurrentMonthKey}
          user={user}
          onLoginClick={handleGoogleSignIn}
          onLogoutClick={handleLogout}
          isLoggingIn={isLoggingIn}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-5">
          {/* Monthly Hero Balance Card */}
          <BalanceCard summary={summary} />

          {/* Tab 1: Transactions List & Filters */}
          {activeTab === 'transactions' && (
            <TransactionList
              transactions={transactions}
              currentMonthKey={currentMonthKey}
              onEdit={handleEditRequest}
              onDeleteRequest={handleDeleteRequest}
              onAddNew={() => {
                setEditingTransaction(null);
                setIsFormOpen(true);
              }}
            />
          )}

          {/* Tab 2: Visual Analytics & Comparative Graphs */}
          {activeTab === 'analytics' && (
            <AnalyticsView
              transactions={transactions}
              currentMonthKey={currentMonthKey}
              summary={summary}
            />
          )}

          {/* Tab 3: Excel (.xlsx) Export & Google Sheets Sync */}
          {activeTab === 'export' && (
            <ExportView
              transactions={transactions}
              currentMonthKey={currentMonthKey}
              summary={summary}
              user={user}
              accessToken={accessToken}
              onGoogleSignIn={handleGoogleSignIn}
              onRequestConfirm={handleRequestConfirm}
            />
          )}

          {/* Reset sample data helper button at bottom of view */}
          <div className="mt-8 pt-4 border-t border-slate-200/60 text-center">
            <button
              id="btn-reset-sample-data"
              type="button"
              onClick={handleResetSeedData}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-200/60 font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>โหลดข้อมูลตัวอย่างเริ่มต้น (Reset Sample Data)</span>
            </button>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onQuickAdd={() => {
            setEditingTransaction(null);
            setIsFormOpen(true);
          }}
        />

        {/* Modal: Add/Edit Transaction Form */}
        <TransactionFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingTransaction(null);
          }}
          onSave={handleSaveTransaction}
          editTransaction={editingTransaction}
          defaultMonthKey={currentMonthKey}
        />

        {/* Modal: User Confirmation for Destructive Operations */}
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          isDestructive={confirmModal.isDestructive}
          isLoading={confirmModal.isLoading}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        />
      </div>
    </div>
  );
}
