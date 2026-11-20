import React from 'react';
import { Student, SchoolInfo, ClassTarget } from '../types';
import { calculateClassStats, formatScore, checkTargetAchievement } from '../utils/calculations';
import { ROMAN_CLASS } from '../data/seedData';

interface RekapNilaiPrintDocumentProps {
  students: Student[];
  school: SchoolInfo;
  className: string;
  target?: ClassTarget;
  surahList: string[];
}

export const RekapNilaiPrintDocument: React.FC<RekapNilaiPrintDocumentProps> = ({
  students,
  school,
  className,
  target,
  surahList
}) => {
  const stats = calculateClassStats(students);
  const addressLine = `${school.alamat}${school.desa ? ' ' + school.desa : ''}`;

  // Sorted by final score descending
  const sortedRows = stats.rows
    .slice()
    .sort((a, b) => (b.calc.f || 0) - (a.calc.f || 0));

  let tuntasCount = 0;
  students.forEach((s) => {
    const ach = checkTargetAchievement(s, target, surahList);
    if (ach.allAchieved) tuntasCount++;
  });
  const tuntasPct = students.length ? Math.round((tuntasCount / students.length) * 100) : 0;

  return (
    <article className="print-page w-[210mm] min-h-[297mm] mx-auto bg-white text-stone-900 p-8 sm:p-12 border border-stone-300 shadow-md font-doc text-xs leading-normal box-border">
      {/* KOP SURAT */}
      <div className="grid grid-cols-[70px_1fr_70px] items-center gap-3 text-center border-b-[3px] border-double border-stone-900 pb-3 mb-4">
        <div className="flex items-center justify-center h-16 w-16">
          {school.logoL && (
            <img src={school.logoL} alt="Logo" className="max-h-16 max-w-16 object-contain" />
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
            <img src={school.logoR} alt="Logo" className="max-h-16 max-w-16 object-contain" />
          )}
        </div>
      </div>

      {/* JUDUL */}
      <div className="text-center font-bold text-sm tracking-wider uppercase my-2 underline underline-offset-4">
        REKAPITULASI NILAI & CAPAIAN KOMPETENSI TAHASSUS KELAS {ROMAN_CLASS[className] || className}
      </div>

      {/* INFO RINGKAS */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] mb-3 pb-2 border-b border-stone-200">
        <div>
          <span className="font-semibold">Tahun Ajaran:</span> {school.tahun} <span className="mx-2">·</span> <span className="font-semibold">Semester:</span> {school.semester}
        </div>
        <div className="text-right">
          <span className="font-semibold">KKM Target:</span> {target?.kkmNilai || 75} <span className="mx-2">·</span> <span className="font-semibold">Target Jilid:</span> {target?.targetJilid || '–'}
        </div>
        <div>
          <span className="font-semibold">Jumlah Siswa:</span> {students.length} Siswa (<span className="text-emerald-700 font-bold">{tuntasCount} Tuntas</span> / {tuntasPct}%)
        </div>
        <div className="text-right">
          <span className="font-semibold">Rata-Rata Kelas:</span> <strong className="text-stone-900">{formatScore(stats.avg)}</strong>
        </div>
      </div>

      {/* TABEL REKAPAN NILAI */}
      <table className="w-full border border-stone-900 border-collapse text-[10px] mb-4">
        <thead>
          <tr className="bg-stone-100 border-b border-stone-900 font-bold">
            <th className="py-1.5 px-1 text-center border-r border-stone-900 w-7">No</th>
            <th className="py-1.5 px-2 text-left border-r border-stone-900 min-w-[130px]">Nama Siswa</th>
            <th className="py-1.5 px-1 text-center border-r border-stone-900 w-16">NISN</th>
            <th className="py-1.5 px-1 text-center border-r border-stone-900 w-7">L/P</th>
            <th className="py-1.5 px-2 text-left border-r border-stone-900 w-20">Jilid</th>
            <th className="py-1.5 px-1 text-center border-r border-stone-900 w-11">Surat</th>
            <th className="py-1.5 px-1 text-center border-r border-stone-900 w-11">Tajwid</th>
            <th className="py-1.5 px-1 text-center border-r border-stone-900 w-11">Makhroj</th>
            <th className="py-1.5 px-1 text-center border-r border-stone-900 w-11">Kelanc.</th>
            <th className="py-1.5 px-1 text-center border-r border-stone-900 w-13 font-bold">Nilai Akhir</th>
            <th className="py-1.5 px-1 text-center border-r border-stone-900 w-9">Pred.</th>
            <th className="py-1.5 px-2 text-center w-16">Target</th>
          </tr>
        </thead>
        <tbody>
          {sortedRows.map(({ student, calc }, idx) => {
            const ach = checkTargetAchievement(student, target, surahList);
            return (
              <tr key={student.id} className="border-b border-stone-800">
                <td className="py-1 px-1 text-center border-r border-stone-800 font-mono">{idx + 1}</td>
                <td className="py-1 px-2 text-left border-r border-stone-800 font-semibold">{student.nama}</td>
                <td className="py-1 px-1 text-center border-r border-stone-800 font-mono text-[9.5px]">{student.nisn || '–'}</td>
                <td className="py-1 px-1 text-center border-r border-stone-800">{student.jk}</td>
                <td className="py-1 px-2 text-left border-r border-stone-800">{student.jilid || '–'}</td>
                <td className="py-1 px-1 text-center border-r border-stone-800 tabular-nums">{calc.n}/37</td>
                <td className="py-1 px-1 text-center border-r border-stone-800 tabular-nums">{formatScore(calc.t)}</td>
                <td className="py-1 px-1 text-center border-r border-stone-800 tabular-nums">{formatScore(calc.m)}</td>
                <td className="py-1 px-1 text-center border-r border-stone-800 tabular-nums">{formatScore(calc.l)}</td>
                <td className="py-1 px-1 text-center border-r border-stone-800 tabular-nums font-bold text-[10.5px]">
                  {formatScore(calc.f)}
                </td>
                <td className="py-1 px-1 text-center border-r border-stone-800 font-bold">{calc.g || '–'}</td>
                <td className="py-1 px-2 text-center font-medium">
                  {ach.allAchieved ? 'Tuntas' : 'Proses'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* STATISTIK SEBARAN */}
      <div className="border border-stone-900 p-2.5 mb-4 text-[10.5px] flex flex-col sm:flex-row items-center justify-between bg-stone-50/50 gap-2">
        <div>
          <b>Sebaran Predikat:</b> A={stats.distribution.A}, B={stats.distribution.B}, C={stats.distribution.C}, D={stats.distribution.D}, E={stats.distribution.E}
        </div>
        <div>
          <b>Tertinggi:</b> {stats.topStudent ? formatScore(stats.topStudent.calc.f) : '–'} · <b>Terendah:</b> {stats.lowStudents.length ? formatScore(Math.min(...stats.lowStudents.map(s => s.calc.f || 0))) : '–'}
        </div>
      </div>

      {/* TANDA TANGAN */}
      <div className="grid grid-cols-2 gap-4 mt-6 text-center text-xs">
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
