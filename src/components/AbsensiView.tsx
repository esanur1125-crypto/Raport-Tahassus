import React, { useState } from 'react';
import { Student, SchoolInfo, AttendanceDay, AttendanceStatus } from '../types';
import {
  Calendar,
  CheckCircle,
  Printer,
  Download,
  Users,
  FileCheck,
  CalendarDays,
  CalendarRange,
  X
} from 'lucide-react';
import {
  formatIndoDate,
  formatIndoMonth,
  getWeekDates,
  getWeekRangeLabel
} from '../utils/dateUtils';

export interface AbsensiPrintConfig {
  periodType: 'harian' | 'mingguan' | 'bulanan';
  day?: AttendanceDay;
  baseDate?: string;
  monthStr?: string;
}

interface AbsensiViewProps {
  students: Student[];
  school: SchoolInfo;
  activeClass: string;
  attendanceDays: AttendanceDay[];
  onSaveAttendanceDay: (day: AttendanceDay) => void;
  onPrintAbsensi: (config: AbsensiPrintConfig) => void;
}

export const AbsensiView: React.FC<AbsensiViewProps> = ({
  students,
  activeClass,
  attendanceDays,
  onSaveAttendanceDay,
  onPrintAbsensi
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printPeriodType, setPrintPeriodType] = useState<'harian' | 'mingguan' | 'bulanan'>('harian');
  const [printDate, setPrintDate] = useState<string>(todayStr);

  // Find or create attendance day for selectedDate and activeClass
  const currentAttendance = attendanceDays.find(
    (a) => a.className === activeClass && a.tanggal === selectedDate
  ) || {
    id: `att_${activeClass}_${selectedDate}`,
    className: activeClass,
    tanggal: selectedDate,
    records: {}
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    const updatedRecords = { ...currentAttendance.records, [studentId]: status };
    onSaveAttendanceDay({
      ...currentAttendance,
      records: updatedRecords
    });
  };

  const handleMarkAllHadir = () => {
    const updatedRecords: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      updatedRecords[s.id] = 'H';
    });
    onSaveAttendanceDay({
      ...currentAttendance,
      records: updatedRecords
    });
  };

  const handleCatatanChange = (val: string) => {
    onSaveAttendanceDay({
      ...currentAttendance,
      catatan: val
    });
  };

  // Calculations for current date
  let hadirCount = 0;
  let izinCount = 0;
  let sakitCount = 0;
  let alpaCount = 0;

  students.forEach((s) => {
    const status = (currentAttendance?.records || {})[s.id] || 'H';
    if (status === 'H') hadirCount++;
    else if (status === 'I') izinCount++;
    else if (status === 'S') sakitCount++;
    else if (status === 'A') alpaCount++;
  });

  const total = students.length || 1;
  const hadirPct = Math.round((hadirCount / total) * 100);

  const exportAttendanceCsv = () => {
    const headers = ['No', 'Tanggal', 'NISN', 'Nama Siswa', 'L/P', 'Kelas', 'Status Kehadiran', 'Keterangan Sesi'];
    const rows = students.map((s, idx) => {
      const st = (currentAttendance?.records || {})[s.id] || 'H';
      const label = st === 'H' ? 'Hadir' : st === 'I' ? 'Izin' : st === 'S' ? 'Sakit' : 'Alpa';
      return [
        idx + 1,
        selectedDate,
        `"${s.nisn || '-'}"`,
        `"${(s.nama || '').replace(/"/g, '""')}"`,
        s.jk || 'L',
        activeClass,
        label,
        `"${(currentAttendance?.catatan || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Presensi_Tahassus_Kelas_${activeClass}_${selectedDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!students.length) {
    return (
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-12 text-center text-stone-500 dark:text-stone-400">
        Kelas {activeClass} belum memiliki siswa. Tambahkan siswa di tab Data Siswa.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top action and date picker */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-800 dark:text-emerald-400" />
            Absensi & Presensi Tahassus · Kelas {activeClass}
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Pencatatan daftar hadir sesi halaqah / bimbingan tahfidz dan fashohati santri.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Picker */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-stone-900 px-3 py-1.5 border border-stone-200 dark:border-stone-700 rounded-xl shadow-2xs">
            <Calendar className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
            <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">Tanggal:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-semibold text-stone-900 dark:text-stone-100 bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={handleMarkAllHadir}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-900 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800 rounded-xl transition-colors cursor-pointer shadow-2xs"
            title="Tandai seluruh siswa hadir untuk tanggal ini"
          >
            <CheckCircle className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Semua Hadir (H)</span>
          </button>

          {/* Quick Print Group: Harian, Mingguan, Bulanan */}
          <div className="inline-flex items-center rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setPrintPeriodType('harian');
                setPrintDate(selectedDate);
                setShowPrintModal(true);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:text-emerald-800 dark:hover:text-emerald-400 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
              title="Cetak Presensi Harian (A4)"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" />
              <span>Harian</span>
            </button>
            <span className="text-stone-300 dark:text-stone-700">|</span>
            <button
              type="button"
              onClick={() => {
                setPrintPeriodType('mingguan');
                setPrintDate(selectedDate);
                setShowPrintModal(true);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:text-emerald-800 dark:hover:text-emerald-400 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
              title="Cetak Matriks Presensi Mingguan Senin-Sabtu (A4)"
            >
              <CalendarDays className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" />
              <span>Mingguan</span>
            </button>
            <span className="text-stone-300 dark:text-stone-700">|</span>
            <button
              type="button"
              onClick={() => {
                setPrintPeriodType('bulanan');
                setPrintDate(selectedDate);
                setShowPrintModal(true);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:text-emerald-800 dark:hover:text-emerald-400 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
              title="Cetak Rekapitulasi Presensi Bulanan (A4)"
            >
              <CalendarRange className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" />
              <span>Bulanan</span>
            </button>
          </div>

          <button
            type="button"
            onClick={exportAttendanceCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Modal Dialog for Printing Absensi */}
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
                    Cetak Presensi & Kehadiran (A4)
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Kelas {activeClass} · Format resmi madrasah lengkap kop surat & tanda tangan
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
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">Pilih Periode Presensi:</label>
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
                  ? 'Tanggal Presensi (Harian):'
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

            {/* Preview info box */}
            {(() => {
              if (printPeriodType === 'harian') {
                const targetAtt = attendanceDays.find(
                  (a) => a.className === activeClass && a.tanggal === printDate
                ) || (printDate === selectedDate ? currentAttendance : {
                  id: `att_${activeClass}_${printDate}`,
                  className: activeClass,
                  tanggal: printDate,
                  records: {}
                });
                const targetRecs = targetAtt.records || {};
                const hCount = students.filter((s) => (targetRecs[s.id] || 'H') === 'H').length;
                return (
                  <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs flex items-center justify-between text-emerald-900 dark:text-emerald-200">
                    <span>
                      Daftar hadir <b>{students.length}</b> siswa kelas {activeClass} ({hCount} Hadir).
                    </span>
                    <span className="font-mono font-bold px-2 py-0.5 bg-white dark:bg-stone-800 rounded-md border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200">
                      1 Hari
                    </span>
                  </div>
                );
              } else if (printPeriodType === 'mingguan') {
                const weekDates = getWeekDates(printDate);
                const recordedInWeek = attendanceDays.filter(
                  (a) => a.className === activeClass && weekDates.some((wd) => wd.date === a.tanggal)
                );
                return (
                  <div className="p-3 bg-sky-50/70 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 rounded-xl text-xs flex items-center justify-between text-sky-900 dark:text-sky-200">
                    <span>
                      Matriks 6 hari (Senin s.d. Sabtu) · <b>{recordedInWeek.length}</b> sesi tercatat.
                    </span>
                    <span className="font-mono font-bold px-2 py-0.5 bg-white dark:bg-stone-800 rounded-md border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200">
                      6 Hari (Sen-Sab)
                    </span>
                  </div>
                );
              } else {
                const mPrefix = printDate.slice(0, 7);
                const recordedInMonth = attendanceDays.filter(
                  (a) => a.className === activeClass && a.tanggal.startsWith(mPrefix)
                );
                return (
                  <div className="p-3 bg-amber-50/70 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl text-xs flex items-center justify-between text-amber-900 dark:text-amber-200">
                    <span>
                      Rekapitulasi bulanan · <b>{recordedInMonth.length}</b> sesi pertemuan tercatat.
                    </span>
                    <span className="font-mono font-bold px-2 py-0.5 bg-white dark:bg-stone-800 rounded-md border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200">
                      {recordedInMonth.length} Sesi
                    </span>
                  </div>
                );
              }
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
                onClick={() => {
                  if (printPeriodType === 'harian') {
                    const targetAtt = attendanceDays.find(
                      (a) => a.className === activeClass && a.tanggal === printDate
                    ) || (printDate === selectedDate ? currentAttendance : {
                      id: `att_${activeClass}_${printDate}`,
                      className: activeClass,
                      tanggal: printDate,
                      records: {}
                    });
                    onPrintAbsensi({
                      periodType: 'harian',
                      day: targetAtt
                    });
                  } else if (printPeriodType === 'mingguan') {
                    onPrintAbsensi({
                      periodType: 'mingguan',
                      baseDate: printDate
                    });
                  } else {
                    onPrintAbsensi({
                      periodType: 'bulanan',
                      monthStr: printDate.slice(0, 7)
                    });
                  }
                  setShowPrintModal(false);
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 rounded-xl cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Dokumen Sekarang (A4)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Daily Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-400 tracking-wider">Hadir (H)</span>
          <div className="text-2xl font-display font-bold text-emerald-900 dark:text-emerald-300 mt-1 tabular-nums">
            {hadirCount} <span className="text-xs font-normal text-stone-400 dark:text-stone-500">/ {students.length}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-sky-700 dark:text-sky-400 tracking-wider">Izin (I)</span>
          <div className="text-2xl font-display font-bold text-sky-900 dark:text-sky-300 mt-1 tabular-nums">{izinCount}</div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 tracking-wider">Sakit (S)</span>
          <div className="text-2xl font-display font-bold text-amber-900 dark:text-amber-300 mt-1 tabular-nums">{sakitCount}</div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-400 tracking-wider">Alpa (A)</span>
          <div className="text-2xl font-display font-bold text-rose-900 dark:text-rose-300 mt-1 tabular-nums">{alpaCount}</div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-bold text-stone-500 dark:text-stone-400 tracking-wider">% Kehadiran</span>
          <div className="text-2xl font-display font-bold text-stone-900 dark:text-stone-100 mt-1 tabular-nums">{hadirPct}%</div>
        </div>
      </div>

      {/* Attendance Checklist Table */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="font-display font-bold text-sm text-stone-900 dark:text-stone-100">
              Daftar Hadir Santri Tanggal {selectedDate}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Klik salah satu tombol status: <b>H</b> = Hadir, <b>I</b> = Izin, <b>S</b> = Sakit, <b>A</b> = Alpa.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 dark:text-stone-400 font-semibold">Catatan Sesi:</span>
            <input
              type="text"
              placeholder="mis. Bimbingan tahsin & setoran juz 30"
              value={currentAttendance.catatan || ''}
              onChange={(e) => handleCatatanChange(e.target.value)}
              className="py-1 px-3 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 rounded-xl focus:outline-emerald-700 dark:focus:outline-emerald-500 w-56 sm:w-72"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 dark:bg-stone-800/80 text-stone-600 dark:text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-200 dark:border-stone-800 font-semibold">
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3 w-28">NISN</th>
                <th className="py-2.5 px-4 min-w-[200px]">Nama Lengkap Siswa</th>
                <th className="py-2.5 px-2 text-center w-12">L/P</th>
                <th className="py-2.5 px-3 w-32">Jilid</th>
                <th className="py-2.5 px-4 text-center w-52">Status Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {students.map((st, idx) => {
                const status = currentAttendance.records[st.id] || 'H';
                return (
                  <tr key={st.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/50 transition-colors">
                    <td className="py-2.5 px-3 text-center text-stone-400 dark:text-stone-500 font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono text-stone-500 dark:text-stone-400 text-[11px]">{st.nisn}</td>
                    <td className="py-2.5 px-4 font-semibold text-stone-900 dark:text-stone-100">{st.nama}</td>
                    <td className="py-2.5 px-2 text-center font-medium text-stone-600 dark:text-stone-400">{st.jk}</td>
                    <td className="py-2.5 px-3 text-stone-600 dark:text-stone-400">{st.jilid || '–'}</td>
                    <td className="py-2.5 px-4 text-center">
                      <div className="inline-flex p-1 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200/80 dark:border-stone-700 gap-1">
                        {/* H */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(st.id, 'H')}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            status === 'H'
                              ? 'bg-emerald-700 text-white shadow-2xs'
                              : 'text-stone-500 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-400'
                          }`}
                        >
                          H
                        </button>

                        {/* I */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(st.id, 'I')}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            status === 'I'
                              ? 'bg-sky-600 text-white shadow-2xs'
                              : 'text-stone-500 dark:text-stone-400 hover:text-sky-800 dark:hover:text-sky-400'
                          }`}
                        >
                          I
                        </button>

                        {/* S */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(st.id, 'S')}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            status === 'S'
                              ? 'bg-amber-600 text-white shadow-2xs'
                              : 'text-stone-500 dark:text-stone-400 hover:text-amber-800 dark:hover:text-amber-400'
                          }`}
                        >
                          S
                        </button>

                        {/* A */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(st.id, 'A')}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            status === 'A'
                              ? 'bg-rose-600 text-white shadow-2xs'
                              : 'text-stone-500 dark:text-stone-400 hover:text-rose-800 dark:hover:text-rose-400'
                          }`}
                        >
                          A
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* History of Recorded Days for this class */}
      {attendanceDays.filter((a) => a.className === activeClass).length > 0 && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
              Riwayat Tanggal Presensi Kelas {activeClass}
            </h3>
            <span className="text-xs text-stone-400 dark:text-stone-500">Klik tanggal untuk membuka absensi</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {attendanceDays
              .filter((a) => a.className === activeClass)
              .map((att) => {
                const isSelected = att.tanggal === selectedDate;
                return (
                  <button
                    key={att.id}
                    type="button"
                    onClick={() => setSelectedDate(att.tanggal)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-800 dark:bg-emerald-700 text-white border-emerald-800 dark:border-emerald-700 shadow-2xs'
                        : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
                    }`}
                  >
                    {att.tanggal}
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
