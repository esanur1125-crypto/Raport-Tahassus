import React from 'react';
import { Student, SchoolInfo, AttendanceDay, AttendanceStatus } from '../types';
import { ROMAN_CLASS } from '../data/seedData';
import { formatIndoMonth } from '../utils/dateUtils';

interface AbsensiBulananPrintDocumentProps {
  students: Student[];
  school: SchoolInfo;
  className: string;
  monthStr: string; // YYYY-MM, e.g. "2026-06"
  attendanceDays: AttendanceDay[];
}

export const AbsensiBulananPrintDocument: React.FC<AbsensiBulananPrintDocumentProps> = ({
  students,
  school,
  className,
  monthStr,
  attendanceDays
}) => {
  const addressLine = `${school.alamat}${school.desa ? ' ' + school.desa : ''}`;

  // Filter attendance days belonging to this month and class
  const monthDays = attendanceDays.filter(
    (a) => a.className === className && a.tanggal.startsWith(monthStr)
  );

  const totalSessions = monthDays.length;

  // Calculate per-student monthly stats
  const studentStats = students.map((s) => {
    let h = 0;
    let i = 0;
    let sakit = 0;
    let a = 0;

    monthDays.forEach((dayRecord) => {
      const recs = dayRecord.records || {};
      const st: AttendanceStatus = recs[s.id] || 'H';
      if (st === 'H') h++;
      else if (st === 'I') i++;
      else if (st === 'S') sakit++;
      else if (st === 'A') a++;
    });

    const divisor = totalSessions || 1;
    const pct = totalSessions > 0 ? Math.round((h / divisor) * 100) : 100;

    let keterangan = 'Sangat Baik';
    if (pct < 75) keterangan = 'Perlu Pembinaan';
    else if (pct < 85) keterangan = 'Cukup';
    else if (pct < 95) keterangan = 'Baik';

    return {
      student: s,
      h,
      i,
      sakit,
      a,
      totalSessions,
      pct,
      keterangan
    };
  });

  const totalHAll = studentStats.reduce((acc, cur) => acc + cur.h, 0);
  const totalIAll = studentStats.reduce((acc, cur) => acc + cur.i, 0);
  const totalSAll = studentStats.reduce((acc, cur) => acc + cur.sakit, 0);
  const totalAAll = studentStats.reduce((acc, cur) => acc + cur.a, 0);

  const perfectAttendanceCount = studentStats.filter((st) => st.pct === 100).length;
  const lowAttendanceCount = studentStats.filter((st) => st.pct < 80).length;

  const totalPossible = students.length * (totalSessions || 1);
  const avgClassPct = totalSessions > 0 ? Math.round((totalHAll / totalPossible) * 100) : 100;

  return (
    <article className="print-page w-[210mm] min-h-[297mm] mx-auto bg-white text-stone-900 p-8 sm:p-12 border border-stone-300 shadow-md font-doc text-xs leading-normal box-border">
      {/* KOP SURAT */}
      <div className="grid grid-cols-[70px_1fr_70px] items-center gap-3 text-center border-b-[3px] border-double border-stone-900 pb-3 mb-4">
        <div className="flex items-center justify-center h-16 w-16">
          {school.logoL && (
            <img src={school.logoL} alt="Logo Madrasah" className="max-h-16 max-w-16 object-contain" />
          )}
        </div>
        <div>
          <div className="text-[11px] uppercase font-bold tracking-wider text-stone-800">
            {school.yayasan}
          </div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900 uppercase my-0.5">
            {school.nama}
          </h2>
          <div className="text-[10px] text-stone-700 leading-tight">
            NSM: {school.nsm} · NPSN: {school.npsn}
            <br />
            {addressLine}, Kec. {school.kec}, Kab. {school.kab} – {school.prov}
          </div>
        </div>
        <div className="flex items-center justify-center h-16 w-16">
          {school.logoR && (
            <img src={school.logoR} alt="Logo Kemenag" className="max-h-16 max-w-16 object-contain" />
          )}
        </div>
      </div>

      {/* JUDUL */}
      <div className="text-center font-bold text-sm tracking-wider uppercase my-2 underline underline-offset-4">
        REKAPITULASI PRESENSI BULANAN TAHASSUS
      </div>

      {/* SUB-HEADER INFO */}
      <div className="grid grid-cols-2 gap-x-6 text-[11px] mb-3 pb-2 border-b border-stone-200">
        <div>
          <span>Kelas: <b>{ROMAN_CLASS[className] || className}</b></span>
          <span className="mx-2">·</span>
          <span>Semester: <b>{school.semester}</b></span>
          <span className="mx-2">·</span>
          <span>Tahun: <b>{school.tahun}</b></span>
        </div>
        <div className="text-right">
          <span>Bulan: <b>{formatIndoMonth(monthStr)}</b></span>
          <span className="mx-2">·</span>
          <span>Total Sesi: <b>{totalSessions} Pertemuan</b></span>
        </div>
      </div>

      {/* TABEL REKAP BULANAN */}
      <table className="w-full border border-stone-900 border-collapse text-[10.5px] mb-4">
        <thead>
          <tr className="bg-stone-100 border-b border-stone-900 font-bold">
            <th className="py-1.5 px-1 text-center border-r border-stone-900 w-8">No</th>
            <th className="py-1.5 px-2 text-center border-r border-stone-900 w-24">NISN</th>
            <th className="py-1.5 px-3 text-left border-r border-stone-900 min-w-[150px]">Nama Lengkap Siswa</th>
            <th className="py-1.5 px-1 text-center border-r border-stone-900 w-8">L/P</th>
            <th className="py-1.5 px-2 text-center border-r border-stone-900 w-14 bg-emerald-50 text-emerald-950">Hadir</th>
            <th className="py-1.5 px-2 text-center border-r border-stone-900 w-12 bg-sky-50 text-sky-950">Izin</th>
            <th className="py-1.5 px-2 text-center border-r border-stone-900 w-12 bg-amber-50 text-amber-950">Sakit</th>
            <th className="py-1.5 px-2 text-center border-r border-stone-900 w-12 bg-rose-50 text-rose-950">Alpa</th>
            <th className="py-1.5 px-2 text-center border-r border-stone-900 w-14">Sesi</th>
            <th className="py-1.5 px-2 text-center border-r border-stone-900 w-16">% Hadir</th>
            <th className="py-1.5 px-3 text-left border-r border-stone-900">Keterangan Disiplin</th>
            <th className="py-1.5 px-2 text-center w-16">Paraf</th>
          </tr>
        </thead>
        <tbody>
          {studentStats.map((item, idx) => (
            <tr key={item.student.id} className="border-b border-stone-800">
              <td className="py-1.5 px-1 text-center border-r border-stone-800 font-mono">{idx + 1}</td>
              <td className="py-1.5 px-2 text-center border-r border-stone-800 font-mono text-[10px]">{item.student.nisn || '-'}</td>
              <td className="py-1.5 px-3 text-left border-r border-stone-800 font-semibold">{item.student.nama}</td>
              <td className="py-1.5 px-1 text-center border-r border-stone-800">{item.student.jk}</td>
              <td className="py-1.5 px-2 text-center border-r border-stone-800 font-bold tabular-nums text-emerald-900">
                {item.h}
              </td>
              <td className="py-1.5 px-2 text-center border-r border-stone-800 tabular-nums">
                {item.i || '–'}
              </td>
              <td className="py-1.5 px-2 text-center border-r border-stone-800 tabular-nums">
                {item.sakit || '–'}
              </td>
              <td className="py-1.5 px-2 text-center border-r border-stone-800 tabular-nums">
                {item.a || '–'}
              </td>
              <td className="py-1.5 px-2 text-center border-r border-stone-800 tabular-nums font-mono">
                {totalSessions}
              </td>
              <td className="py-1.5 px-2 text-center border-r border-stone-800 font-bold tabular-nums">
                {totalSessions > 0 ? `${item.pct}%` : '–'}
              </td>
              <td className="py-1.5 px-3 text-left border-r border-stone-800 font-medium text-[10px]">
                {item.keterangan}
              </td>
              <td className="py-1.5 px-2 text-center text-stone-400 font-mono text-[9px]">
                {item.pct >= 85 ? '✓' : '-'}
              </td>
            </tr>
          ))}

          {/* Bottom Total Row */}
          <tr className="bg-stone-100 font-bold border-t-2 border-stone-900 text-[10px]">
            <td colSpan={4} className="py-2 px-3 text-right border-r border-stone-900 uppercase">
              Total Akumulasi Kelas:
            </td>
            <td className="py-2 px-2 text-center border-r border-stone-900 tabular-nums text-emerald-950">
              {totalHAll}
            </td>
            <td className="py-2 px-2 text-center border-r border-stone-900 tabular-nums text-sky-950">
              {totalIAll}
            </td>
            <td className="py-2 px-2 text-center border-r border-stone-900 tabular-nums text-amber-950">
              {totalSAll}
            </td>
            <td className="py-2 px-2 text-center border-r border-stone-900 tabular-nums text-rose-950">
              {totalAAll}
            </td>
            <td className="py-2 px-2 text-center border-r border-stone-900 font-mono">
              {totalPossible}
            </td>
            <td className="py-2 px-2 text-center border-r border-stone-900 text-emerald-950">
              {avgClassPct}%
            </td>
            <td colSpan={2} className="py-2 px-3 text-left italic text-stone-600 font-normal">
              Rata-rata Kehadiran Kelas
            </td>
          </tr>
        </tbody>
      </table>

      {/* STATISTICAL RECAP CARDS */}
      <div className="border border-stone-900 p-3 mb-4 text-[11px] grid grid-cols-4 text-center gap-2 bg-stone-50/60">
        <div>
          <span className="block text-stone-600">Total Siswa</span>
          <b className="text-sm text-stone-900">{students.length} Siswa</b>
        </div>
        <div>
          <span className="block text-stone-600">Rata-Rata Kehadiran</span>
          <b className="text-sm text-emerald-900">{avgClassPct}%</b>
        </div>
        <div>
          <span className="block text-stone-600">Kehadiran 100% (Sempurna)</span>
          <b className="text-sm text-stone-900">{perfectAttendanceCount} Siswa</b>
        </div>
        <div>
          <span className="block text-stone-600">Perlu Perhatian (&lt; 80%)</span>
          <b className="text-sm text-rose-700">{lowAttendanceCount} Siswa</b>
        </div>
      </div>

      {/* PENGESAHAN TANDA TANGAN */}
      <div className="grid grid-cols-2 gap-4 mt-8 text-center text-xs">
        <div>
          <div>Mengetahui,</div>
          <div>Kepala Madrasah</div>
          <div className="h-16" />
          <div className="font-bold underline">{school.kepala}</div>
        </div>

        <div>
          <div>{school.tanggal}</div>
          <div>Guru Pengampu Tahassus</div>
          <div className="h-16" />
          <div className="font-bold underline">{school.guru}</div>
        </div>
      </div>
    </article>
  );
};
