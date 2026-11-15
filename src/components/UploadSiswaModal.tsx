import React, { useState, useRef } from 'react';
import { Student } from '../types';
import { parseStudentsFromText, downloadStudentImportTemplate } from '../utils/storage';
import { Upload, FileSpreadsheet, Download, Check, AlertCircle, X } from 'lucide-react';

interface UploadSiswaModalProps {
  className: string;
  isOpen: boolean;
  onClose: () => void;
  onImport: (students: Omit<Student, 'id' | 's'>[], mode: 'append' | 'replace') => void;
}

export const UploadSiswaModal: React.FC<UploadSiswaModalProps> = ({
  className,
  isOpen,
  onClose,
  onImport
}) => {
  const [pasteText, setPasteText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<Omit<Student, 'id' | 's'>[]>([]);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [parseError, setParseError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleTextChange = (text: string) => {
    setPasteText(text);
    if (!text.trim()) {
      setParsedPreview([]);
      setParseError(null);
      return;
    }

    try {
      const results = parseStudentsFromText(text);
      if (!results.length) {
        setParseError('Tidak ditemukan baris siswa yang valid. Pastikan ada nama siswa.');
        setParsedPreview([]);
      } else {
        setParseError(null);
        setParsedPreview(results);
      }
    } catch {
      setParseError('Gagal membaca data teks.');
      setParsedPreview([]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleTextChange(content);
    };
    reader.readAsText(file);
  };

  const handleCommit = () => {
    if (!parsedPreview.length) return;
    onImport(parsedPreview, importMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-stone-900 dark:text-stone-100">
                Upload / Import Siswa Kelas {className}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Impor daftar siswa dari file CSV atau salin-tempel langsung dari Microsoft Excel.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Download Template or Upload File */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-stone-50 dark:bg-stone-800/70 rounded-xl border border-stone-200 dark:border-stone-700">
          <div className="text-xs text-stone-600 dark:text-stone-300">
            <span className="font-semibold block text-stone-800 dark:text-stone-100">Format Kolom:</span>
            Nama Siswa · NISN · Jenis Kelamin (L/P) · Orang Tua · Jilid · Hafalan
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={downloadStudentImportTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-white dark:bg-stone-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 rounded-lg shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Template CSV</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-700 rounded-lg shadow-2xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Pilih File CSV</span>
            </button>
          </div>
        </div>

        {/* Step 2: Paste Area */}
        <div>
          <label htmlFor="paste-area" className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
            Atau Tempel (Paste) Teks Tabel dari Excel di Sini:
          </label>
          <textarea
            id="paste-area"
            rows={4}
            value={pasteText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Contoh salinan dari Excel:&#10;AHMAD HUSAIN	3170123001	L	FAUZI	Jilid I	Al-Ikhlas&#10;FATIMAH AZ-ZAHRA	3170123002	P	ALI	Jilid I	An-Nas"
            className="w-full p-3 font-mono text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 rounded-xl focus:outline-emerald-700"
          />
          {parseError && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{parseError}</span>
            </div>
          )}
        </div>

        {/* Step 3: Preview */}
        {parsedPreview.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-900 dark:text-emerald-300 flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                Terdeteksi {parsedPreview.length} Siswa Siap Diimpor
              </span>

              {/* Mode switch */}
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                    className="accent-emerald-700"
                  />
                  <span>Tambahkan ke Siswa yang Ada</span>
                </label>
                <label className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="accent-emerald-700"
                  />
                  <span>Gantikan Seluruh Siswa Kelas {className}</span>
                </label>
              </div>
            </div>

            {/* Table Preview */}
            <div className="max-h-48 overflow-y-auto border border-stone-200 dark:border-stone-700 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 sticky top-0 border-b border-stone-200 dark:border-stone-700 text-[10px] uppercase">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Nama Siswa</th>
                    <th className="py-2 px-3">NISN</th>
                    <th className="py-2 px-3">JK</th>
                    <th className="py-2 px-3">Orang Tua</th>
                    <th className="py-2 px-3">Jilid</th>
                    <th className="py-2 px-3">Hafalan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {parsedPreview.slice(0, 15).map((p, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/50">
                      <td className="py-1.5 px-3 font-mono text-stone-400 dark:text-stone-500">{idx + 1}</td>
                      <td className="py-1.5 px-3 font-semibold text-stone-800 dark:text-stone-100">{p.nama}</td>
                      <td className="py-1.5 px-3 font-mono text-stone-500 dark:text-stone-400">{p.nisn}</td>
                      <td className="py-1.5 px-3 font-bold text-stone-700 dark:text-stone-300">{p.jk}</td>
                      <td className="py-1.5 px-3 text-stone-600 dark:text-stone-300">{p.ortu}</td>
                      <td className="py-1.5 px-3 text-stone-600 dark:text-stone-300">{p.jilid || '–'}</td>
                      <td className="py-1.5 px-3 text-stone-600 dark:text-stone-300">{p.hafalan || '–'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsedPreview.length > 15 && (
              <p className="text-[11px] text-stone-400 dark:text-stone-500 text-center">
                ...dan {parsedPreview.length - 15} siswa lainnya
              </p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={parsedPreview.length === 0}
            onClick={handleCommit}
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-40"
          >
            Impor {parsedPreview.length} Siswa ke Kelas {className}
          </button>
        </div>
      </div>
    </div>
  );
};
