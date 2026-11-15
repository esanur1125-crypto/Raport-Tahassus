import React from 'react';
import { Student, SchoolInfo } from '../types';
import { calculateClassStats, formatScore, getPredikatBadgeClass } from '../utils/calculations';
import { ROMAN_CLASS } from '../data/seedData';

interface LegerPrintDocumentProps {
  students: Student[];
  school: SchoolInfo;
  className: string;
}

export const LegerPrintDocument: React.FC<LegerPrintDocumentProps> = ({
  students,
  school,
  className
}) => {
  const stats = calculateClassStats(students);
  const addressLine = `${school.alamat}${school.desa ? ' ' + school.desa : ''}`;

  // Sorted by final score descending
  const sortedRows = stats.rows
    .slice()
    .sort((a, b) => (b.calc.f || 0) - (a.calc.f || 0));

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
        LEGER REKAPITULASI NILAI TAHASSUS KELAS {ROMAN_CLASS[className] || className}
      </div>

      <div className="flex justify-between items-center text-[11px] mb-3 pb-2 border-b border-stone-200">
        <div>
          <span>Tahun Ajaran: <b>{school.tahun}</b></span>
          <span className="mx-2">·</span>
          <span>Semester: <b>{school.semester}</b></span>
        </div>
        <div>
          <span>Jumlah Siswa: <b>{students.length}</b></span>
          <span className="mx-2">·</span>
          <span>Rata-Rata Kelas: <b>{formatScore(stats.avg)}</b></span>
        </div>
      </div>

      {/* TABEL LEGER */}
      <table className="w-full border border-stone-900 border-collapse text-[10px] mb-4">
        <thead>
          <tr className="bg-stone-100 border-b border-stone-900 font-bold">
            <th className="py-1.5 px-1 text-center border-r border-stone-900 w-7">Pkt</th>
            <th className="py-1.5 px-2 text-center border-r border-stone-900 w-22">NISN</th>
            <th className="py-1.5 px-2 text-left border-r border-stone-900 min-w-[140px]">Nama Lengkap Siswa</th>
            <th className="py-1.5 px-1 text-center border-r border-stone-900 w-8">L/P</th>
            <th className="py-1.5 px-2 text-left border-r border-stone-900 w-22">Jilid</th>
            <th className="py-1.5 px-2 text-left border-r border-stone-900 w-24">Hafalan</th>
            <th className="py-1.5 px-1 text-center border-r border-stone-900 w-12">Surat</th>
            <th className="py-1.5 px-1 text-center border-r border-stone-900 w-12">Tajwid</th>
            <th className="py-1.5 px-1 text-center border-r border-stone-900 w-12">Makhroj</th>
            <th className="py-1.5 px-1 text-center border-r border-stone-900 w-12">Kelancaran</th>
            <th className="py-1.5 px-1 text-center border-r border-stone-900 w-14 font-bold">Nilai Akhir</th>
            <th className="py-1.5 px-1 text-center w-10">Pred.</th>
          </tr>
        </thead>
        <tbody>
          {sortedRows.map(({ student, calc }, idx) => (
            <tr key={student.id} className="border-b border-stone-800">
              <td className="py-1 px-1 text-center border-r border-stone-800 font-mono">{idx + 1}</td>
              <td className="py-1 px-2 text-center border-r border-stone-800 font-mono text-[9.5px]">{student.nisn}</td>
              <td className="py-1 px-2 text-left border-r border-stone-800 font-semibold">{student.nama}</td>
              <td className="py-1 px-1 text-center border-r border-stone-800">{student.jk}</td>
              <td className="py-1 px-2 text-left border-r border-stone-800">{student.jilid || '–'}</td>
              <td className="py-1 px-2 text-left border-r border-stone-800">{student.hafalan || '–'}</td>
              <td className="py-1 px-1 text-center border-r border-stone-800 tabular-nums">{calc.n}/37</td>
              <td className="py-1 px-1 text-center border-r border-stone-800 tabular-nums">{formatScore(calc.t)}</td>
              <td className="py-1 px-1 text-center border-r border-stone-800 tabular-nums">{formatScore(calc.m)}</td>
              <td className="py-1 px-1 text-center border-r border-stone-800 tabular-nums">{formatScore(calc.l)}</td>
              <td className="py-1 px-1 text-center border-r border-stone-800 tabular-nums font-bold text-[10.5px]">
                {formatScore(calc.f)}
              </td>
              <td className="py-1 px-1 text-center font-bold">
                {calc.g || '–'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* STATISTIK SEBARAN */}
      <div className="border border-stone-900 p-2.5 mb-4 text-[10.5px] flex items-center justify-between bg-stone-50/50">
        <div>
          <b>Sebaran Predikat:</b> A = {stats.distribution.A} siswa · B = {stats.distribution.B} siswa · C = {stats.distribution.C} siswa · D = {stats.distribution.D} siswa · E = {stats.distribution.E} siswa
        </div>
        <div>
          <b>Nilai Tertinggi:</b> {stats.topStudent ? formatScore(stats.topStudent.calc.f) : '–'}
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
