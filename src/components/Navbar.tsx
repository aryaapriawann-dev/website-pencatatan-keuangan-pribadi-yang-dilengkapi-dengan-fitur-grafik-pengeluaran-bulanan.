import React from 'react';
import { Plus, Database, Wallet } from 'lucide-react';

export type NavTab = 'dashboard' | 'charts' | 'transactions' | 'budgets';

interface Props {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenNewTransaction: () => void;
  onOpenDataModal: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  onOpenNewTransaction,
  onOpenDataModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single Brand Wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Wallet className="w-5 h-5 text-emerald-400" />
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onSelectTab('dashboard');
              }}
              className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <span>BukuKasKu</span>
            </a>
          </div>

          {/* Zone 2: Concise Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <button
              type="button"
              onClick={() => onSelectTab('dashboard')}
              className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                activeTab === 'dashboard'
                  ? 'text-slate-900 border-b-2 border-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ringkasan
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('charts')}
              className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                activeTab === 'charts'
                  ? 'text-slate-900 border-b-2 border-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Grafik & Tren
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('transactions')}
              className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                activeTab === 'transactions'
                  ? 'text-slate-900 border-b-2 border-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Buku Transaksi
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('budgets')}
              className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                activeTab === 'budgets'
                  ? 'text-slate-900 border-b-2 border-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Anggaran
            </button>
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenDataModal}
              title="Cadangkan atau Kelola Data"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Database className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenNewTransaction}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Catat Transaksi</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-100 py-2 text-xs font-medium">
          <button
            type="button"
            onClick={() => onSelectTab('dashboard')}
            className={`py-1 px-2 rounded-md ${
              activeTab === 'dashboard'
                ? 'text-slate-900 font-bold bg-slate-100'
                : 'text-slate-600'
            }`}
          >
            Ringkasan
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('charts')}
            className={`py-1 px-2 rounded-md ${
              activeTab === 'charts'
                ? 'text-slate-900 font-bold bg-slate-100'
                : 'text-slate-600'
            }`}
          >
            Grafik
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('transactions')}
            className={`py-1 px-2 rounded-md ${
              activeTab === 'transactions'
                ? 'text-slate-900 font-bold bg-slate-100'
                : 'text-slate-600'
            }`}
          >
            Transaksi
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('budgets')}
            className={`py-1 px-2 rounded-md ${
              activeTab === 'budgets'
                ? 'text-slate-900 font-bold bg-slate-100'
                : 'text-slate-600'
            }`}
          >
            Anggaran
          </button>
        </div>
      </div>
    </header>
  );
};
