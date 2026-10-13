/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFinance } from './hooks/useFinance';
import { Navbar, NavTab } from './components/Navbar';
import { KPISummary } from './components/KPISummary';
import { MonthlyExpenseBarChart } from './components/charts/MonthlyExpenseBarChart';
import { CategoryDonutChart } from './components/charts/CategoryDonutChart';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { BudgetManager } from './components/BudgetManager';
import { DataModal } from './components/DataModal';
import { AnalyticsView } from './components/AnalyticsView';
import { Transaction } from './types/finance';
import { Plus, ArrowRight, TrendingDown, Target, History } from 'lucide-react';

export default function App() {
  const {
    transactions,
    budgets,
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    totalCumulativeBalance,
    monthlySummaries,
    selectedMonthTransactions,
    currentMonthSummary,
    previousMonthSummary,
    categoryBreakdown,
    dailyExpenses,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateBudget,
    deleteBudget,
    resetToSampleData,
    clearAllData,
    exportCSV,
    exportJSON,
    importJSON,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  // Handle Edit Transaction
  const handleStartEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setIsTxModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingTx(null);
    setIsTxModalOpen(true);
  };

  const handleSaveTransaction = (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (editingTx) {
      updateTransaction(editingTx.id, data);
    } else {
      addTransaction(data);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Navigation Top Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenNewTransaction={handleOpenAdd}
        onOpenDataModal={() => setIsDataModalOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* TAB 1: DASHBOARD (Ringkasan Cepat) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards & Month Selector */}
            <KPISummary
              currentSummary={currentMonthSummary}
              previousSummary={previousMonthSummary}
              totalBalance={totalCumulativeBalance}
              selectedMonth={selectedMonth}
              availableMonths={availableMonths}
              onSelectMonth={setSelectedMonth}
            />

            {/* Core Feature: Monthly Expense Chart */}
            <MonthlyExpenseBarChart
              monthlyData={monthlySummaries}
              selectedMonth={selectedMonth}
              onSelectMonth={setSelectedMonth}
            />

            {/* 2-Column Split: Category Donut & Budget Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-6">
                <CategoryDonutChart
                  breakdown={categoryBreakdown}
                  totalExpense={currentMonthSummary.totalExpense}
                  monthLabel={currentMonthSummary.label}
                />
              </div>

              <div className="lg:col-span-6 space-y-6">
                {/* Budget Quick Widget */}
                <BudgetManager
                  budgets={budgets}
                  categoryBreakdown={categoryBreakdown}
                  monthLabel={currentMonthSummary.label}
                  onUpdateBudget={updateBudget}
                  onDeleteBudget={deleteBudget}
                />
              </div>
            </div>

            {/* Recent Transactions in Active Month */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                    Transaksi Terbaru ({currentMonthSummary.label})
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedMonthTransactions.length} transaksi tercatat pada bulan ini
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('transactions')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                >
                  Lihat Semua Transaksi
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <TransactionList
                transactions={selectedMonthTransactions}
                onEdit={handleStartEdit}
                onDelete={deleteTransaction}
                onAddNew={handleOpenAdd}
              />
            </div>
          </div>
        )}

        {/* TAB 2: CHARTS & TREN (Grafik & Analisis Mendalam) */}
        {activeTab === 'charts' && (
          <AnalyticsView
            monthlySummaries={monthlySummaries}
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
            currentSummary={currentMonthSummary}
            categoryBreakdown={categoryBreakdown}
            dailyExpenses={dailyExpenses}
          />
        )}

        {/* TAB 3: BUKU TRANSAKSI (Semua Transaksi dengan Pencarian & Filter) */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Buku Catatan Transaksi
                </h2>
                <p className="text-xs text-slate-500">
                  Total {transactions.length} riwayat transaksi tersimpan di perangkat Anda
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={exportCSV}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 transition-colors"
                >
                  Unduh CSV
                </button>
              </div>
            </div>

            <TransactionList
              transactions={transactions}
              onEdit={handleStartEdit}
              onDelete={deleteTransaction}
              onAddNew={handleOpenAdd}
            />
          </div>
        )}

        {/* TAB 4: ANGGARAN (Budgeting Planner) */}
        {activeTab === 'budgets' && (
          <div className="space-y-4">
            <div className="pb-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Perencanaan & Batas Anggaran
              </h2>
              <p className="text-xs text-slate-500">
                Atur target pengeluaran bulanan agar keuangan tetap terkendali dan target tabungan tercapai
              </p>
            </div>

            <BudgetManager
              budgets={budgets}
              categoryBreakdown={categoryBreakdown}
              monthLabel={currentMonthSummary.label}
              onUpdateBudget={updateBudget}
              onDeleteBudget={deleteBudget}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© BukuKasKu · Pencatatan Keuangan Pribadi & Visualisasi Grafik Bulanan</p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Penyimpanan Aman di Browser (LocalStorage)</span>
            <span>·</span>
            <button
              type="button"
              onClick={() => setIsDataModalOpen(true)}
              className="hover:text-slate-600 transition-colors"
            >
              Cadangkan / Impor Data
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={handleSaveTransaction}
        initialTransaction={editingTx}
      />

      <DataModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        onExportCSV={exportCSV}
        onExportJSON={exportJSON}
        onImportJSON={importJSON}
        onResetDemo={resetToSampleData}
        onClearAll={clearAllData}
        transactionCount={transactions.length}
      />
    </div>
  );
}
