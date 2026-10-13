import { useState, useEffect, useMemo } from 'react';
import { Transaction, Budget, MonthSummary, CategoryBreakdownItem } from '../types/finance';
import { INITIAL_TRANSACTIONS, INITIAL_BUDGETS } from '../data/initialData';
import { getCategoryColor } from '../data/categories';
import { formatBulanTahun, formatBulanPendek, getCurrentYearMonth } from '../utils/formatters';

const STORAGE_KEY_TX = 'bukukas_transactions_v1';
const STORAGE_KEY_BUDGET = 'bukukas_budgets_v1';

export function useFinance() {
  // Load transactions from localStorage or fallback
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TX);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse saved transactions', e);
    }
    return INITIAL_TRANSACTIONS;
  });

  // Load budgets from localStorage
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BUDGET);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse saved budgets', e);
    }
    return INITIAL_BUDGETS;
  });

  // Active selected Month-Year (YYYY-MM), default to October 2026 or current month
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');

  // Save to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions to localStorage', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BUDGET, JSON.stringify(budgets));
    } catch (e) {
      console.error('Failed to save budgets to localStorage', e);
    }
  }, [budgets]);

  // List of all distinct months present in transactions (sorted descending)
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    // Always include current month and selected month
    monthSet.add(getCurrentYearMonth());
    monthSet.add(selectedMonth);

    transactions.forEach((tx) => {
      if (tx.date && tx.date.length >= 7) {
        monthSet.add(tx.date.substring(0, 7));
      }
    });

    return Array.from(monthSet).sort().reverse();
  }, [transactions, selectedMonth]);

  // Ensure selectedMonth is valid
  useEffect(() => {
    if (!availableMonths.includes(selectedMonth) && availableMonths.length > 0) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [availableMonths, selectedMonth]);

  // All-time Cumulative Balance
  const totalCumulativeBalance = useMemo(() => {
    return transactions.reduce((acc, tx) => {
      return tx.type === 'income' ? acc + tx.amount : acc - tx.amount;
    }, 0);
  }, [transactions]);

  // Monthly summary stats grouped by YYYY-MM
  const monthlySummaries = useMemo<MonthSummary[]>(() => {
    // Generate chronological map
    const map = new Map<string, { income: number; expense: number; count: number }>();

    transactions.forEach((tx) => {
      const ym = tx.date ? tx.date.substring(0, 7) : '2026-10';
      const curr = map.get(ym) || { income: 0, expense: 0, count: 0 };
      if (tx.type === 'income') {
        curr.income += tx.amount;
      } else {
        curr.expense += tx.amount;
      }
      curr.count += 1;
      map.set(ym, curr);
    });

    // Ensure available months are mapped even if 0
    availableMonths.forEach((ym) => {
      if (!map.has(ym)) {
        map.set(ym, { income: 0, expense: 0, count: 0 });
      }
    });

    const sortedMonths = Array.from(map.keys()).sort(); // chronological

    return sortedMonths.map((ym) => {
      const data = map.get(ym)!;
      const netSavings = data.income - data.expense;
      const savingsRate = data.income > 0 ? Math.max(0, Math.round((netSavings / data.income) * 100)) : 0;
      return {
        yearMonth: ym,
        label: formatBulanTahun(ym),
        shortLabel: formatBulanPendek(ym),
        totalExpense: data.expense,
        totalIncome: data.income,
        netSavings,
        savingsRate,
        transactionCount: data.count,
      };
    });
  }, [transactions, availableMonths]);

  // Selected Month's Transactions
  const selectedMonthTransactions = useMemo(() => {
    return transactions
      .filter((tx) => tx.date.startsWith(selectedMonth))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt.localeCompare(a.createdAt));
  }, [transactions, selectedMonth]);

  // Selected Month Summary KPI
  const currentMonthSummary = useMemo<MonthSummary>(() => {
    const found = monthlySummaries.find((m) => m.yearMonth === selectedMonth);
    if (found) return found;

    return {
      yearMonth: selectedMonth,
      label: formatBulanTahun(selectedMonth),
      shortLabel: formatBulanPendek(selectedMonth),
      totalExpense: 0,
      totalIncome: 0,
      netSavings: 0,
      savingsRate: 0,
      transactionCount: 0,
    };
  }, [monthlySummaries, selectedMonth]);

  // Previous month summary for delta comparisons
  const previousMonthSummary = useMemo<MonthSummary | null>(() => {
    const idx = monthlySummaries.findIndex((m) => m.yearMonth === selectedMonth);
    if (idx > 0) {
      return monthlySummaries[idx - 1];
    }
    return null;
  }, [monthlySummaries, selectedMonth]);

  // Category breakdown for selected month (Expenses)
  const categoryBreakdown = useMemo<CategoryBreakdownItem[]>(() => {
    const catMap = new Map<string, { amount: number; count: number }>();

    selectedMonthTransactions
      .filter((tx) => tx.type === 'expense')
      .forEach((tx) => {
        const curr = catMap.get(tx.category) || { amount: 0, count: 0 };
        curr.amount += tx.amount;
        curr.count += 1;
        catMap.set(tx.category, curr);
      });

    const totalExp = currentMonthSummary.totalExpense || 1;
    const items: CategoryBreakdownItem[] = Array.from(catMap.entries()).map(([cat, val]) => ({
      category: cat,
      amount: val.amount,
      percentage: Math.round((val.amount / totalExp) * 100),
      color: getCategoryColor(cat),
      count: val.count,
    }));

    return items.sort((a, b) => b.amount - a.amount);
  }, [selectedMonthTransactions, currentMonthSummary.totalExpense]);

  // Daily expense breakdown for selected month
  const dailyExpenses = useMemo(() => {
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const daysInMonth = new Date(year, month, 0).getDate();

    const dailyMap: { [day: number]: { amount: number; count: number } } = {};
    for (let d = 1; d <= daysInMonth; d++) {
      dailyMap[d] = { amount: 0, count: 0 };
    }

    selectedMonthTransactions
      .filter((tx) => tx.type === 'expense')
      .forEach((tx) => {
        const day = parseInt(tx.date.substring(8, 10), 10);
        if (dailyMap[day]) {
          dailyMap[day].amount += tx.amount;
          dailyMap[day].count += 1;
        }
      });

    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      return {
        day,
        dateStr: `${selectedMonth}-${String(day).padStart(2, '0')}`,
        amount: dailyMap[day]?.amount || 0,
        count: dailyMap[day]?.count || 0,
      };
    });
  }, [selectedMonth, selectedMonthTransactions]);

  // Actions
  const addTransaction = (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...data,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Automatically switch selectedMonth to match transaction date if desirable
    if (newTx.date.substring(0, 7) !== selectedMonth) {
      setSelectedMonth(newTx.date.substring(0, 7));
    }
  };

  const updateTransaction = (id: string, updated: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...updated } : tx))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  const updateBudget = (category: string, monthlyLimit: number) => {
    setBudgets((prev) => {
      const existing = prev.find((b) => b.category === category);
      if (existing) {
        return prev.map((b) => (b.category === category ? { ...b, monthlyLimit } : b));
      }
      return [...prev, { category, monthlyLimit }];
    });
  };

  const deleteBudget = (category: string) => {
    setBudgets((prev) => prev.filter((b) => b.category !== category));
  };

  const resetToSampleData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(INITIAL_BUDGETS);
    setSelectedMonth('2026-10');
  };

  const clearAllData = () => {
    setTransactions([]);
    setBudgets([]);
  };

  const exportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['ID', 'Tanggal', 'Tipe', 'Kategori', 'Akun', 'Nominal', 'Catatan'];
    const rows = transactions.map((t) => [
      t.id,
      t.date,
      t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      `"${t.category.replace(/"/g, '""')}"`,
      `"${t.account.replace(/"/g, '""')}"`,
      t.amount,
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bukukasku-transaksi-${getCurrentYearMonth()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    const backupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      transactions,
      budgets,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bukukasku-backup-${getCurrentYearMonth()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && Array.isArray(parsed.transactions)) {
        setTransactions(parsed.transactions);
        if (Array.isArray(parsed.budgets)) {
          setBudgets(parsed.budgets);
        }
        return true;
      }
    } catch (e) {
      console.error('Failed to parse imported json', e);
    }
    return false;
  };

  return {
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
  };
}
