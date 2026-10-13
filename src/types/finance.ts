export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  account: string;
  date: string; // YYYY-MM-DD
  note: string;
  createdAt: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  iconName: string;
}

export interface Budget {
  category: string;
  monthlyLimit: number;
}

export interface MonthSummary {
  yearMonth: string; // "2026-10"
  label: string; // "Oktober 2026"
  shortLabel: string; // "Okt"
  totalExpense: number;
  totalIncome: number;
  netSavings: number;
  savingsRate: number; // percentage (0 - 100)
  transactionCount: number;
}

export interface CategoryBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  count: number;
}
