import React, { useRef, useState } from 'react';
import { X, Download, Upload, RotateCcw, Trash2, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onImportJSON: (jsonStr: string) => boolean;
  onResetDemo: () => void;
  onClearAll: () => void;
  transactionCount: number;
}

export const DataModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onExportCSV,
  onExportJSON,
  onImportJSON,
  onResetDemo,
  onClearAll,
  transactionCount,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'success' | 'error' | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = onImportJSON(content);
      if (success) {
        setImportStatus('success');
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setImportStatus('error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">
            Kelola & Cadangkan Data
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {importStatus === 'success' && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Data cadangan berhasil diimpor!</span>
            </div>
          )}

          {importStatus === 'error' && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Format file JSON cadangan tidak valid.</span>
            </div>
          )}

          {/* Export Options */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-800">Ekspor Data</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onExportCSV}
                className="p-3 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-lg text-left transition-colors flex flex-col gap-1"
              >
                <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  Format CSV
                </div>
                <span className="text-slate-500 text-[11px]">
                  Buka di Excel atau Google Sheets
                </span>
              </button>

              <button
                type="button"
                onClick={onExportJSON}
                className="p-3 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-lg text-left transition-colors flex flex-col gap-1"
              >
                <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                  <Download className="w-4 h-4 text-indigo-600" />
                  Cadangan JSON
                </div>
                <span className="text-slate-500 text-[11px]">
                  Simpan riwayat transaksi & anggaran
                </span>
              </button>
            </div>
          </div>

          {/* Import Option */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="font-semibold text-slate-800">Pulihkan / Impor</h4>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-3 border border-dashed border-slate-300 hover:border-slate-400 rounded-lg text-slate-700 hover:bg-slate-50 font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Upload className="w-4 h-4 text-slate-500" />
              Pilih File Cadangan (.json)
            </button>
          </div>

          {/* Demo Data & Reset */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="font-semibold text-slate-800">Contoh Data & Pengaturan Ulang</h4>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  onResetDemo();
                  onClose();
                }}
                className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Muat Ulang Contoh Data Realistis (6 Bulan)
              </button>

              {confirmClear ? (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg space-y-2 text-rose-800">
                  <p className="font-medium">Hapus semua ({transactionCount}) data transaksi?</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClearAll();
                        setConfirmClear(false);
                        onClose();
                      }}
                      className="px-3 py-1 bg-rose-600 text-white rounded text-xs font-semibold"
                    >
                      Ya, Hapus Semua
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="px-3 py-1 bg-white text-slate-700 border rounded text-xs"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="w-full py-2 px-3 text-rose-600 hover:bg-rose-50 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Kosongkan Seluruh Data
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
