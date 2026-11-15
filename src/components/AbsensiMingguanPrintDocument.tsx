import React from 'react';
import { Student, SchoolInfo, AttendanceDay, AttendanceStatus } from '../types';
import { ROMAN_CLASS } from '../data/seedData';
import { getWeekDates, formatIndoDate } from '../utils/dateUtils';

interface AbsensiMingguanPrintDocumentProps {
  students: Student[];
  school: SchoolInfo;
  className: string;
  baseDate: string; // Any date within the desired week
  attendanceDays: AttendanceDay[];
}

export const AbsensiMingguanPrintDocument: React.FC<AbsensiMingguanPrintDocumentProps> = ({
  students,
  school,
  className,
  baseDate,
  attendanceDays
}) => {
  const addressLine = `${school.alamat}${school.desa ? ' ' + school.desa : ''}`;
  const weekDays = getWeekDates(baseDate);

  // Map of date string -> AttendanceDay for this class
  const classAttendanceMap: Record<string, AttendanceDay> = {};
  attendanceDays
    .filter((a) => a.className === className)
    .forEach((a) => {
      classAttendanceMap[a.tanggal] = a;
    });

  // Calculate per-student weekly totals
  const studentStats = students.map((s) => {
    let h = 0;
    let i = 0;
    let sakit = 0;
    let a = 0;
    let activeDaysCount = 0;

    const dayStatuses = weekDays.map((wd) => {
      const dayRecord = classAttendanceMap[wd.date];
      if (!dayRecord) {
        return null;
      }
      activeDaysCount++;
      const recs = dayRecord.records || {};
      const st: AttendanceStatus = recs[s.id] || 'H';
      if (st === 'H') h++;
      else if (st === 'I') i++;
      else if (st === 'S') sakit++;
      else if (st === 'A') a++;
      return st;
    });

    const totalRecorded = activeDaysCount || 1;
    const pct = Math.round((h / totalRecorded) * 100);

    return {
      student: s,
      dayStatuses,
      h,
      i,
      sakit,
      a,
      activeDaysCount,
      pct
    };
  });

  // Calculate daily totals for bottom row
  const dailyTotals = weekDays.map((wd) => {
    const dayRecord = classAttendanceMap[wd.date];
    if (!dayRecord) return null;
    let hadir = 0;
    const recs = dayRecord.records || {};
    students.forEach((s) => {
      const st = recs[s.id] || 'H';
      if (st === 'H') hadir++;
    });
    const pct = students.length ? Math.round((hadir / students.length) * 100) : 0;
    return { hadir, pct };
  });

  const totalHAll = studentStats.reduce((acc, cur) => acc + cur.h, 0);
  const totalPossible = students.length * (weekDays.filter((wd) => classAttendanceMap[wd.date]).length || 1);
  const avgWeekPct = Math.round((totalHAll / (totalPossible || 1)) * 100);

  const startWeekLabel = formatIndoDate(weekDays[0].date);
  const endWeekLabel = formatIndoDate(weekDays[weekDays.length - 1].date);

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

      {/* JUDUL DOKUMEN */}
      <div className="text-center font-bold text-sm tracking-wider uppercase my-2 underline underline-offset-4">
        REKAPITULASI PRESENSI MINGGUAN TAHASSUS
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
          <span>Rentang Minggu: <b>{startWeekLabel} s.d. {endWeekLabel}</b></span>
        </div>
      </div>

      {/* TABEL PRESENSI MINGGUAN */}
      <table className="w-full border border-stone-900 border-collapse text-[10px] mb-4">
        <thead>
          <tr className="bg-stone-100 border-b border-stone-900 font-bold">
            <th rowSpan={2} className="py-1 px-1 text-center border-r border-stone-900 w-7">No</th>
            <th rowSpan={2} className="py-1 px-2 text-center border-r border-stone-900 w-20">NISN</th>
            <th rowSpan={2} className="py-1 px-2 text-left border-r border-stone-900 min-w-[140px]">Nama Siswa</th>
            <th rowSpan={2} className="py-1 px-1 text-center border-r border-stone-900 w-7">L/P</th>
            <th colSpan={6} className="py-1 px-1 text-center border-r border-stone-900 bg-stone-200/70">
              Hari & Tanggal Sesi
            </th>
            <th colSpan={4} className="py-1 px-1 text-center border-r border-stone-900 bg-emerald-50">
              Total
            </th>
            <th rowSpan={2} className="py-1 px-1 text-center border-r border-stone-900 w-12">% Hadir</th>
            <th rowSpan={2} className="py-1 px-1 text-center w-12">Paraf</th>
          </tr>
          <tr className="bg-stone-100 border-b border-stone-900 font-semibold text-[9.5px]">
            {weekDays.map((wd) => (
              <th key={wd.date} className="py-1 px-1 text-center border-r border-stone-900 w-11 leading-tight">
                <span className="block font-bold">{wd.dayName.slice(0, 3)}</span>
                <span className="text-[8.5px] text-stone-500 font-normal font-mono">{wd.date.slice(5)}</span>
              </th>
            ))}
            <th className="py-1 px-1 text-center border-r border-stone-900 w-6 bg-emerald-50 text-emerald-950 font-bold">H</th>
            <th className="py-1 px-1 text-center border-r border-stone-900 w-6 bg-emerald-50 text-sky-950 font-bold">I</th>
            <th className="py-1 px-1 text-center border-r border-stone-900 w-6 bg-emerald-50 text-amber-950 font-bold">S</th>
            <th className="py-1 px-1 text-center border-r border-stone-900 w-6 bg-emerald-50 text-rose-950 font-bold">A</th>
          </tr>
        </thead>
        <tbody>
          {studentStats.map((item, idx) => (
            <tr key={item.student.id} className="border-b border-stone-800">
              <td className="py-1 px-1 text-center border-r border-stone-800 font-mono">{idx + 1}</td>
              <td className="py-1 px-2 text-center border-r border-stone-800 font-mono text-[9px]">{item.student.nisn || '-'}</td>
              <td className="py-1 px-2 text-left border-r border-stone-800 font-semibold">{item.student.nama}</td>
              <td className="py-1 px-1 text-center border-r border-stone-800">{item.student.jk}</td>
              {item.dayStatuses.map((st, dIdx) => (
                <td
                  key={dIdx}
                  className={`py-1 px-1 text-center border-r border-stone-800 font-bold text-[9.5px] ${
                    st === 'H'
                      ? 'text-emerald-900'
                      : st === 'I'
                      ? 'text-sky-700 bg-sky-50'
                      : st === 'S'
                      ? 'text-amber-700 bg-amber-50'
                      : st === 'A'
                      ? 'text-rose-700 bg-rose-50'
                      : 'text-stone-300'
                  }`}
                >
                  {st || '–'}
                </td>
              ))}
              <td className="py-1 px-1 text-center border-r border-stone-800 font-bold tabular-nums">{item.h}</td>
              <td className="py-1 px-1 text-center border-r border-stone-800 tabular-nums">{item.i || '-'}</td>
              <td className="py-1 px-1 text-center border-r border-stone-800 tabular-nums">{item.sakit || '-'}</td>
              <td className="py-1 px-1 text-center border-r border-stone-800 tabular-nums">{item.a || '-'}</td>
              <td className="py-1 px-1 text-center border-r border-stone-800 font-bold tabular-nums">
                {item.activeDaysCount ? `${item.pct}%` : '–'}
              </td>
              <td className="py-1 px-1 text-center text-stone-400 font-mono text-[9px]">
                {item.pct >= 80 ? '✓' : '-'}
              </td>
            </tr>
          ))}

          {/* Bottom Summary Row */}
          <tr className="bg-stone-100 font-bold border-t-2 border-stone-900 text-[9.5px]">
            <td colSpan={4} className="py-1.5 px-2 text-right border-r border-stone-900 uppercase">
              Total Siswa Hadir:
            </td>
            {dailyTotals.map((dt, dIdx) => (
              <td key={dIdx} className="py-1.5 px-1 text-center border-r border-stone-900 tabular-nums">
                {dt ? `${dt.hadir}` : '–'}
              </td>
            ))}
            <td colSpan={4} className="py-1.5 px-1 text-center border-r border-stone-900">
              Rata-Rata:
            </td>
            <td className="py-1.5 px-1 text-center border-r border-stone-900 font-bold text-emerald-950">
              {avgWeekPct}%
            </td>
            <td className="py-1.5 px-1 text-center" />
          </tr>
        </tbody>
      </table>

      {/* STATISTICAL RECAP BOX */}
      <div className="border border-stone-900 p-2.5 mb-4 text-[11px] grid grid-cols-4 text-center gap-2 bg-stone-50/60">
        <div>
          <span className="block text-stone-600">Total Siswa Kelas</span>
          <b className="text-xs text-stone-900">{students.length} Siswa</b>
        </div>
        <div>
          <span className="block text-stone-600">Total Hadir Akumulasi</span>
          <b className="text-xs text-emerald-900">{totalHAll} Sesi Hadir</b>
        </div>
        <div>
          <span className="block text-stone-600">Sesi Terlaksana Minggu Ini</span>
          <b className="text-xs text-stone-900">
            {weekDays.filter((wd) => classAttendanceMap[wd.date]).length} Hari
          </b>
        </div>
        <div>
          <span className="block text-stone-600">Kehadiran Kelas Minggu Ini</span>
          <b className="text-xs text-emerald-900">{avgWeekPct}%</b>
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
