import React, { useState } from 'react';
import { Student, SchoolInfo, JournalEntry, JournalType, JournalStatus } from '../types';
import { JILID_OPTIONS } from '../data/seedData';
import {
  PlusCircle,
  Printer,
  Download,
  Search,
  BookOpen,
  Trash2,
  Calendar,
  Filter,
  CalendarDays,
  CalendarRange,
  X,
  FileSpreadsheet
} from 'lucide-react';
import {
  formatIndoDate,
  formatIndoMonth,
  getWeekDates,
  getWeekRangeLabel
} from '../utils/dateUtils';

export interface JurnalPrintConfig {
  entries: JournalEntry[];
  periodType: 'harian' | 'mingguan' | 'bulanan';
  periodLabel: string;
  filterDate?: string;
  selectedStudentName?: string;
}

interface JurnalViewProps {
  students: Student[];
  school: SchoolInfo;
  activeClass: string;
  journalEntries: JournalEntry[];
  surahList: string[];
  onAddJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  onDeleteJournalEntry: (id: string) => void;
  onPrintJurnal: (config: JurnalPrintConfig) => void;
}

export const JurnalView: React.FC<JurnalViewProps> = ({
  students,
  school,
  activeClass,
  journalEntries,
  surahList,
  onAddJournalEntry,
  onDeleteJournalEntry,
  onPrintJurnal
}) => {
  const [formOpen, setFormOpen] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStudentId, setFilterStudentId] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');

  // Form states
  const todayStr = new Date().toISOString().slice(0, 10);
  const [formStudentId, setFormStudentId] = useState(students[0]?.id || '');
  const [formTanggal, setFormTanggal] = useState(todayStr);
  const [formTipe, setFormTipe] = useState<JournalType>('ziyadah');
  const [formMateri, setFormMateri] = useState("Al-A'la");
  const [formAyatOrHalaman, setFormAyatOrHalaman] = useState('Ayat 1-10');
  const [formNilai, setFormNilai] = useState<number | ''>(85);
  const [formStatus, setFormStatus] = useState<JournalStatus>('Lancar');
  const [formCatatan, setFormCatatan] = useState('');

  // Print modal states
  const [printPeriodType, setPrintPeriodType] = useState<'harian' | 'mingguan' | 'bulanan'>('harian');
  const [printDate, setPrintDate] = useState<string>(todayStr);
  const [printStudentId, setPrintStudentId] = useState<string>('all');

  // Class-specific journal entries
  const classEntries = journalEntries.filter((j) => j.className === activeClass);

  // Filtered entries for table view
  const filteredEntries = classEntries.filter((item) => {
    const matchSearch =
      item.studentNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.surahOrJilid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.catatan.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = filterType === 'all' || item.tipe === filterType;
    const matchStudent = filterStudentId === 'all' || item.studentId === filterStudentId;
    const matchDate = !filterDate || item.tanggal === filterDate;
    return matchSearch && matchType && matchStudent && matchDate;
  });

  // Calculate entries for print modal
  const getPrintFilteredEntries = (period: 'harian' | 'mingguan' | 'bulanan', targetDate: string, studentId: string) => {
    let result = classEntries;
    if (studentId !== 'all') {
      result = result.filter((e) => e.studentId === studentId);
    }

    if (period === 'harian') {
      return result.filter((e) => e.tanggal === targetDate);
    } else if (period === 'mingguan') {
      const weekDates = getWeekDates(targetDate).map((w) => w.date);
      return result.filter((e) => weekDates.includes(e.tanggal));
    } else {
      const monthPrefix = targetDate.slice(0, 7);
      return result.filter((e) => e.tanggal.startsWith(monthPrefix));
    }
  };

  const executePrint = (period: 'harian' | 'mingguan' | 'bulanan', targetDate: string, studentId: string) => {
    const entriesToPrint = getPrintFilteredEntries(period, targetDate, studentId);
    let label = '';
    if (period === 'harian') {
      label = formatIndoDate(targetDate);
    } else if (period === 'mingguan') {
      label = `Minggu: ${getWeekRangeLabel(targetDate)}`;
    } else {
      label = `Bulan: ${formatIndoMonth(targetDate.slice(0, 7))}`;
    }

    const stObj = students.find((s) => s.id === studentId);

    onPrintJurnal({
      entries: entriesToPrint,
      periodType: period,
      periodLabel: label,
      filterDate: targetDate,
      selectedStudentName: stObj ? stObj.nama : undefined
    });
    setShowPrintModal(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === formStudentId) || students[0];
    if (!st) return;

    onAddJournalEntry({
      studentId: st.id,
      studentNama: st.nama,
      className: activeClass,
      tanggal: formTanggal,
      tipe: formTipe,
      surahOrJilid: formMateri.trim(),
      ayatOrHalaman: formAyatOrHalaman.trim(),
      nilai: formNilai === '' ? null : Number(formNilai),
      status: formStatus,
      catatan: formCatatan.trim(),
      guru: school.guru
    });

    setFormCatatan('');
    setFormOpen(false);
  };

  const exportJurnalCsv = () => {
    const headers = ['No', 'Tanggal', 'Nama Siswa', 'Kelas', 'Jenis Setoran', 'Materi', 'Ayat/Halaman', 'Nilai', 'Status', 'Catatan Evaluasi', 'Guru'];
    const rows = filteredEntries.map((item, idx) => [
      idx + 1,
      item.tanggal,
      `"${item.studentNama.replace(/"/g, '""')}"`,
      item.className,
      item.tipe,
      `"${item.surahOrJilid.replace(/"/g, '""')}"`,
      `"${item.ayatOrHalaman.replace(/"/g, '""')}"`,
      item.nilai !== null ? item.nilai : '',
      item.status,
      `"${(item.catatan || '').replace(/"/g, '""')}"`,
      `"${item.guru.replace(/"/g, '""')}"`
    ].join(','));

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Jurnal_Hafalan_Kelas_${activeClass}_${filterDate || 'Semua'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-800 dark:text-emerald-400" />
            Jurnal Mutaba'ah Harian Hafalan & Fashohati · Kelas {activeClass}
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Catatan harian setoran ziyadah (hafalan baru), muroja'ah, dan setoran jilid Fashohati.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFormOpen(!formOpen)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{formOpen ? 'Tutup Formulir' : 'Catat Setoran Baru'}</span>
          </button>

          {/* Quick Print Group: Harian, Mingguan, Bulanan */}
          <div className="inline-flex items-center rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setPrintPeriodType('harian');
                setPrintDate(filterDate || todayStr);
                setShowPrintModal(true);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:text-emerald-800 dark:hover:text-emerald-400 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
              title="Cetak Jurnal Mutaba'ah Harian"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" />
              <span>Harian</span>
            </button>
            <span className="text-stone-300 dark:text-stone-700">|</span>
            <button
              type="button"
              onClick={() => {
                setPrintPeriodType('mingguan');
                setPrintDate(filterDate || todayStr);
                setShowPrintModal(true);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:text-emerald-800 dark:hover:text-emerald-400 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
              title="Cetak Rekap Mutaba'ah Mingguan (Senin-Sabtu)"
            >
              <CalendarDays className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" />
              <span>Mingguan</span>
            </button>
            <span className="text-stone-300 dark:text-stone-700">|</span>
            <button
              type="button"
              onClick={() => {
                setPrintPeriodType('bulanan');
                setPrintDate(filterDate || todayStr);
                setShowPrintModal(true);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:text-emerald-800 dark:hover:text-emerald-400 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
              title="Cetak Rekap Mutaba'ah Bulanan"
            >
              <CalendarRange className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" />
              <span>Bulanan</span>
            </button>
          </div>

          <button
            type="button"
            onClick={exportJurnalCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Modal Dialog for Printing Jurnal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 dark:border-stone-800 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-400 rounded-xl">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-stone-900 dark:text-stone-100">
                    Cetak Jurnal Mutaba'ah (A4)
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Kelas {activeClass} · Format resmi madrasah lengkap kop & tanda tangan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Period Selector Tabs */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">Pilih Periode Cetak:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPrintPeriodType('harian')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    printPeriodType === 'harian'
                      ? 'bg-emerald-800 dark:bg-emerald-700 text-white border-emerald-800 dark:border-emerald-700 shadow-2xs'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Harian</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintPeriodType('mingguan')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    printPeriodType === 'mingguan'
                      ? 'bg-emerald-800 dark:bg-emerald-700 text-white border-emerald-800 dark:border-emerald-700 shadow-2xs'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
                  }`}
                >
                  <CalendarDays className="w-4 h-4" />
                  <span>Mingguan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintPeriodType('bulanan')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    printPeriodType === 'bulanan'
                      ? 'bg-emerald-800 dark:bg-emerald-700 text-white border-emerald-800 dark:border-emerald-700 shadow-2xs'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
                  }`}
                >
                  <CalendarRange className="w-4 h-4" />
                  <span>Bulanan</span>
                </button>
              </div>
            </div>

            {/* Date input dependent on period */}
            <div className="bg-stone-50 dark:bg-stone-800/70 rounded-xl p-3.5 border border-stone-200 dark:border-stone-700 space-y-2 text-xs">
              <label className="block font-semibold text-stone-700 dark:text-stone-300">
                {printPeriodType === 'harian'
                  ? 'Tanggal Setoran (Harian):'
                  : printPeriodType === 'mingguan'
                  ? 'Pilih Tanggal Acuan Minggu (Senin-Sabtu):'
                  : 'Pilih Bulan & Tahun:'}
              </label>

              {printPeriodType === 'bulanan' ? (
                <input
                  type="month"
                  value={printDate.slice(0, 7)}
                  onChange={(e) => setPrintDate(`${e.target.value}-01`)}
                  className="w-full py-2 px-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl font-semibold text-stone-900 dark:text-stone-100 focus:outline-emerald-700 dark:focus:outline-emerald-500"
                />
              ) : (
                <input
                  type="date"
                  value={printDate}
                  onChange={(e) => setPrintDate(e.target.value)}
                  className="w-full py-2 px-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl font-semibold text-stone-900 dark:text-stone-100 focus:outline-emerald-700 dark:focus:outline-emerald-500"
                />
              )}

              <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                {printPeriodType === 'harian' && (
                  <span>Dicetak untuk tanggal: <b className="text-stone-800 dark:text-stone-200">{formatIndoDate(printDate)}</b></span>
                )}
                {printPeriodType === 'mingguan' && (
                  <span>Rentang sepekan: <b className="text-stone-800 dark:text-stone-200">{getWeekRangeLabel(printDate)}</b></span>
                )}
                {printPeriodType === 'bulanan' && (
                  <span>Bulan rekapan: <b className="text-stone-800 dark:text-stone-200">{formatIndoMonth(printDate.slice(0, 7))}</b></span>
                )}
              </div>
            </div>

            {/* Student Filter */}
            <div className="space-y-1.5 text-xs">
              <label className="block font-semibold text-stone-700 dark:text-stone-300">Filter Siswa (Opsional):</label>
              <select
                value={printStudentId}
                onChange={(e) => setPrintStudentId(e.target.value)}
                className="w-full py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl font-medium text-stone-800 dark:text-stone-200 focus:outline-emerald-700 dark:focus:outline-emerald-500"
              >
                <option value="all">Semua Siswa Kelas {activeClass}</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama} ({s.jilid || '-'})
                  </option>
                ))}
              </select>
            </div>

            {/* Live Data Count Preview */}
            {(() => {
              const matched = getPrintFilteredEntries(printPeriodType, printDate, printStudentId);
              return (
                <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                  matched.length > 0
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                }`}>
                  <span className="font-medium">
                    {matched.length > 0
                      ? `Siap mencetak ${matched.length} catatan setoran mutaba'ah.`
                      : 'Tidak ada catatan setoran pada periode ini (tetap dapat mencetak lembar kosong/terstruktur).'}
                  </span>
                  <span className="font-mono font-bold px-2 py-0.5 bg-white dark:bg-stone-800 rounded-md border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200">
                    {matched.length} data
                  </span>
                </div>
              );
            })()}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => executePrint(printPeriodType, printDate, printStudentId)}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 rounded-xl cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Dokumen Sekarang (A4)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Journal Entry Form */}
      {formOpen && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-emerald-300 dark:border-emerald-800 shadow-sm">
          <div className="mb-4">
            <h3 className="font-display font-bold text-sm text-stone-900 dark:text-stone-100">
              Formulir Setoran Hafalan & Fashohati
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Catatan evaluasi setoran harian santri/siswa MI Syuriyah.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Student */}
            <div>
              <label htmlFor="jurnal-student" className="block font-semibold text-stone-600 dark:text-stone-400 mb-1">
                Pilih Siswa *
              </label>
              <select
                id="jurnal-student"
                value={formStudentId}
                onChange={(e) => setFormStudentId(e.target.value)}
                className="w-full py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:outline-emerald-700 dark:focus:outline-emerald-500 font-medium"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama} ({s.jilid || '-'})
                  </option>
                ))}
              </select>
            </div>

            {/* Tanggal */}
            <div>
              <label htmlFor="jurnal-tanggal" className="block font-semibold text-stone-600 dark:text-stone-400 mb-1">
                Tanggal Setoran *
              </label>
              <input
                id="jurnal-tanggal"
                type="date"
                required
                value={formTanggal}
                onChange={(e) => setFormTanggal(e.target.value)}
                className="w-full py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:outline-emerald-700 dark:focus:outline-emerald-500"
              />
            </div>

            {/* Tipe Setoran */}
            <div>
              <label htmlFor="jurnal-tipe" className="block font-semibold text-stone-600 dark:text-stone-400 mb-1">
                Jenis Setoran
              </label>
              <select
                id="jurnal-tipe"
                value={formTipe}
                onChange={(e) => setFormTipe(e.target.value as JournalType)}
                className="w-full py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-emerald-700 dark:focus:outline-emerald-500 font-semibold text-emerald-900 dark:text-emerald-300"
              >
                <option value="ziyadah">Ziyadah (Hafalan Baru)</option>
                <option value="murojaah">Muroja'ah (Mengulang)</option>
                <option value="fashohati">Fashohati (Setoran Jilid)</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="jurnal-status" className="block font-semibold text-stone-600 dark:text-stone-400 mb-1">
                Kualitas Capaian
              </label>
              <select
                id="jurnal-status"
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as JournalStatus)}
                className="w-full py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:outline-emerald-700 dark:focus:outline-emerald-500 font-semibold"
              >
                <option value="Lancar">Lancar (Mutqin)</option>
                <option value="Kurang Lancar">Kurang Lancar</option>
                <option value="Belum Lancar">Belum Lancar</option>
                <option value="Mengulang">Perlu Mengulang</option>
              </select>
            </div>

            {/* Materi (Surah/Jilid) */}
            <div>
              <label htmlFor="jurnal-materi" className="block font-semibold text-stone-600 dark:text-stone-400 mb-1">
                Materi (Surat / Jilid) *
              </label>
              <input
                id="jurnal-materi"
                type="text"
                required
                list="jurnal-materi-list"
                value={formMateri}
                onChange={(e) => setFormMateri(e.target.value)}
                placeholder="mis. Al-Lail atau Jilid III"
                className="w-full py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 rounded-xl focus:outline-emerald-700 dark:focus:outline-emerald-500"
              />
              <datalist id="jurnal-materi-list">
                {surahList.map((s) => (
                  <option key={s} value={s} />
                ))}
                {JILID_OPTIONS.filter(Boolean).map((j) => (
                  <option key={j} value={j} />
                ))}
              </datalist>
            </div>

            {/* Rincian Ayat / Halaman */}
            <div>
              <label htmlFor="jurnal-ayat" className="block font-semibold text-stone-600 dark:text-stone-400 mb-1">
                Rincian Ayat / Halaman
              </label>
              <input
                id="jurnal-ayat"
                type="text"
                value={formAyatOrHalaman}
                onChange={(e) => setFormAyatOrHalaman(e.target.value)}
                placeholder="mis. Ayat 1-15 atau Hal. 12"
                className="w-full py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 rounded-xl focus:outline-emerald-700 dark:focus:outline-emerald-500"
              />
            </div>

            {/* Nilai (0-100) */}
            <div>
              <label htmlFor="jurnal-nilai" className="block font-semibold text-stone-600 dark:text-stone-400 mb-1">
                Nilai Angka (0–100)
              </label>
              <input
                id="jurnal-nilai"
                type="number"
                min="0"
                max="100"
                value={formNilai}
                onChange={(e) => setFormNilai(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="85"
                className="w-full py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 rounded-xl focus:outline-emerald-700 dark:focus:outline-emerald-500 font-mono text-center font-bold"
              />
            </div>

            {/* Guru Pengampu */}
            <div>
              <label htmlFor="jurnal-guru" className="block font-semibold text-stone-600 dark:text-stone-400 mb-1">
                Guru Pengampu
              </label>
              <input
                id="jurnal-guru"
                type="text"
                readOnly
                value={school.guru}
                className="w-full py-2 px-3 bg-stone-100 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-600 dark:text-stone-400 cursor-not-allowed"
              />
            </div>

            {/* Catatan Evaluasi */}
            <div className="sm:col-span-2 lg:col-span-4">
              <label htmlFor="jurnal-catatan" className="block font-semibold text-stone-600 dark:text-stone-400 mb-1">
                Catatan Guru / Evaluasi Tajwid & Makhroj
              </label>
              <input
                id="jurnal-catatan"
                type="text"
                value={formCatatan}
                onChange={(e) => setFormCatatan(e.target.value)}
                placeholder="mis. Panjang mad thobi'i sudah tepat, latih ghunnah pada nun bertasydid."
                className="w-full py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 rounded-xl focus:outline-emerald-700 dark:focus:outline-emerald-500"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 rounded-xl cursor-pointer shadow-xs"
              >
                Simpan Catatan Setoran
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari siswa/materi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 rounded-xl focus:outline-emerald-700 dark:focus:outline-emerald-500 w-44 sm:w-52"
            />
          </div>

          {/* Student filter */}
          <select
            value={filterStudentId}
            onChange={(e) => setFilterStudentId(e.target.value)}
            className="py-1.5 px-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-700 dark:text-stone-200 focus:outline-emerald-700 dark:focus:outline-emerald-500 max-w-[170px]"
          >
            <option value="all">Semua Siswa</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nama}
              </option>
            ))}
          </select>

          {/* Type filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="py-1.5 px-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-700 dark:text-stone-200 focus:outline-emerald-700 dark:focus:outline-emerald-500"
          >
            <option value="all">Semua Jenis</option>
            <option value="ziyadah">Ziyadah</option>
            <option value="murojaah">Muroja'ah</option>
            <option value="fashohati">Fashohati</option>
          </select>

          {/* Date filter */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="py-1 px-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-700 dark:text-stone-200 text-xs focus:outline-emerald-700 dark:focus:outline-emerald-500"
            />
            {filterDate && (
              <button
                type="button"
                onClick={() => setFilterDate('')}
                className="text-[11px] text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 font-medium underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="text-stone-500 dark:text-stone-400 font-medium">
          Ditemukan <b className="text-stone-900 dark:text-stone-100">{filteredEntries.length}</b> catatan setoran
        </div>
      </div>

      {/* Journal Table */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 dark:bg-stone-800/80 text-stone-600 dark:text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-200 dark:border-stone-800 font-semibold">
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3 w-24">Tanggal</th>
                <th className="py-2.5 px-3 min-w-[170px]">Nama Siswa</th>
                <th className="py-2.5 px-3 w-28">Jenis</th>
                <th className="py-2.5 px-3 min-w-[140px]">Materi & Rincian</th>
                <th className="py-2.5 px-3 w-16 text-center">Nilai</th>
                <th className="py-2.5 px-3 w-28 text-center">Status</th>
                <th className="py-2.5 px-3 min-w-[180px]">Catatan Evaluasi</th>
                <th className="py-2.5 px-3 w-12 text-center">Hapus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredEntries.length > 0 ? (
                filteredEntries.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/50 transition-colors">
                    <td className="py-2 px-3 text-center text-stone-400 dark:text-stone-500 font-mono">{idx + 1}</td>
                    <td className="py-2 px-3 tabular-nums text-stone-600 dark:text-stone-400">{item.tanggal}</td>
                    <td className="py-2 px-3 font-semibold text-stone-900 dark:text-stone-100">{item.studentNama}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          item.tipe === 'ziyadah'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : item.tipe === 'murojaah'
                            ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {item.tipe === 'ziyadah'
                          ? 'Ziyadah'
                          : item.tipe === 'murojaah'
                          ? "Muroja'ah"
                          : 'Fashohati'}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-semibold text-stone-800 dark:text-stone-200">{item.surahOrJilid}</div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400">{item.ayatOrHalaman}</div>
                    </td>
                    <td className="py-2 px-3 text-center tabular-nums font-bold text-stone-900 dark:text-stone-100">
                      {item.nilai !== null ? item.nilai : '–'}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          item.status === 'Lancar'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : item.status === 'Kurang Lancar'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            : item.status === 'Mengulang'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-stone-600 dark:text-stone-400 italic text-[11px]">
                      {item.catatan || <span className="text-stone-300 dark:text-stone-600">–</span>}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => onDeleteJournalEntry(item.id)}
                        className="p-1 text-stone-400 dark:text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 rounded cursor-pointer"
                        title="Hapus Catatan Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-stone-400 dark:text-stone-500 italic">
                    Belum ada catatan jurnal setoran untuk filter ini. Klik "Catat Setoran Baru" untuk menambahkan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
