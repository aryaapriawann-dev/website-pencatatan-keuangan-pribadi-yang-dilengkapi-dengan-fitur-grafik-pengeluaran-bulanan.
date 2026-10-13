import { CategoryInfo } from '../types/finance';

export const EXPENSE_CATEGORIES: CategoryInfo[] = [
  { id: 'makanan', name: 'Makanan & Minuman', type: 'expense', color: '#f97316', iconName: 'Utensils' },
  { id: 'transportasi', name: 'Transportasi & Bensin', type: 'expense', color: '#3b82f6', iconName: 'Car' },
  { id: 'tempat_tinggal', name: 'Kost & Tempat Tinggal', type: 'expense', color: '#8b5cf6', iconName: 'Home' },
  { id: 'tagihan', name: 'Tagihan & Utilitas', type: 'expense', color: '#eab308', iconName: 'Zap' },
  { id: 'belanja', name: 'Belanja Kebutuhan', type: 'expense', color: '#ec4899', iconName: 'ShoppingBag' },
  { id: 'hiburan', name: 'Hiburan & Hobi', type: 'expense', color: '#06b6d4', iconName: 'Tv' },
  { id: 'kesehatan', name: 'Kesehatan & Medis', type: 'expense', color: '#ef4444', iconName: 'HeartPulse' },
  { id: 'pendidikan', name: 'Pendidikan & Kursus', type: 'expense', color: '#10b981', iconName: 'GraduationCap' },
  { id: 'keluarga', name: 'Keluarga & Donasi', type: 'expense', color: '#14b8a6', iconName: 'Users' },
  { id: 'investasi_keluar', name: 'Investasi & Tabungan', type: 'expense', color: '#6366f1', iconName: 'TrendingUp' },
  { id: 'lainnya_keluar', name: 'Lain-lain', type: 'expense', color: '#64748b', iconName: 'MoreHorizontal' },
];

export const INCOME_CATEGORIES: CategoryInfo[] = [
  { id: 'gaji', name: 'Gaji Utama', type: 'income', color: '#10b981', iconName: 'Briefcase' },
  { id: 'freelance', name: 'Freelance & Bisnis', type: 'income', color: '#059669', iconName: 'Laptop' },
  { id: 'investasi_masuk', name: 'Dividen & Investasi', type: 'income', color: '#047857', iconName: 'DollarSign' },
  { id: 'hadiah', name: 'Hadiah & Bonus', type: 'income', color: '#0d9488', iconName: 'Gift' },
  { id: 'penjualan', name: 'Penjualan Barang', type: 'income', color: '#14b8a6', iconName: 'Tag' },
  { id: 'lainnya_masuk', name: 'Pemasukan Lainnya', type: 'income', color: '#64748b', iconName: 'PlusCircle' },
];

export const ALL_CATEGORIES: CategoryInfo[] = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export const DEFAULT_ACCOUNTS = [
  'Tunai / Cash',
  'BCA',
  'Mandiri',
  'BRI',
  'GoPay',
  'OVO',
  'ShopeePay',
  'Dana',
  'Kartu Kredit',
];

export function getCategoryColor(categoryName: string): string {
  const found = ALL_CATEGORIES.find((c) => c.name.toLowerCase() === categoryName.toLowerCase());
  return found ? found.color : '#64748b';
}

export function getCategoryIconName(categoryName: string): string {
  const found = ALL_CATEGORIES.find((c) => c.name.toLowerCase() === categoryName.toLowerCase());
  return found ? found.iconName : 'CircleDollarSign';
}
