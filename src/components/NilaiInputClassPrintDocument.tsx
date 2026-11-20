import React from 'react';
import { Student, SchoolInfo, ClassTarget } from '../types';
import { calculateClassStats, formatScore, getSurahAverage } from '../utils/calculations';
import { ROMAN_CLASS } from '../data/seedData';

interface NilaiInputClassPrintDocumentProps {
  students: Student[];
  school: SchoolInfo;
  className: string;
  target?: ClassTarget;
  surahList: string[];
}

export const NilaiInputClassPrintDocument: React.FC<NilaiInputClassPrintDocumentProps> = ({
  students,
  school,
  className,
  target,
  surahList
}) => {
  const stats = calculateClassStats(students);
  const addressLine = `${school.alamat}${school.desa ? ' ' + school.desa : ''}`;

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
        REKAPITULASI DETAIL INPUT NILAI & SURAT TAHASSUS KELAS {ROMAN_CLASS[className] || className}
      </div>

      {/* INFO RINGKAS */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] mb-3 pb-2 border-b border-stone-200">
        <div>
          <span className="font-semibold">Tahun Ajaran:</span> {school.tahun} <span className="mx-2">·</span> <span className="font-semibold">Semester:</span> {school.semester}
        </div>
        <div className="text-right">
          <span className="font-semibold">Target Jilid:</span> {target?.targetJilid || '–'} <span className="mx-2">·</span> <span className="font-semibold">KKM:</span> {target?.kkmNilai || 75}
        </div>
        <div>
          <span className="font-semibold">Jumlah Siswa:</span> {students.length} Siswa
        </div>
        <div className="text-right">
          <span className="font-semibold">Rata-Rata Kelas:</span> <strong className="text-stone-900">{formatScore(stats.avg)}</strong>
        </div>
      </div>

      {/* TABEL DETAIL PER KELAS */}
      <table className="w-full border border-stone-900 border-collapse text-[10px] mb-4">
        <thead>
          <tr className="bg-stone-100 border-b border-stone-900 font-bold">
            <th className="py-2 px-1 text-center border-r border-stone-900 w-7">No</th>
            <th className="py-2 px-2 text-left border-r border-stone-900 min-w-[130px]">Nama Siswa</th>
            <th className="py-2 px-1 text-center border-r border-stone-900 w-16">NISN</th>
            <th className="py-2 px-2 text-left border-r border-stone-900 w-18">Jilid</th>
            <th className="py-2 px-2 text-left border-r border-stone-900 w-22">Hafalan Surat</th>
            <th className="py-2 px-1 text-center border-r border-stone-900 w-12">Dinilai</th>
            <th className="py-2 px-1 text-center border-r border-stone-900 w-12">Tajwid</th>
            <th className="py-2 px-1 text-center border-r border-stone-900 w-12">Makhroj</th>
            <th className="py-2 px-1 text-center border-r border-stone-900 w-12">Kelanc.</th>
            <th className="py-2 px-1 text-center border-r border-stone-900 w-13 font-bold">Akhir</th>
            <th className="py-2 px-1 text-center w-10">Pred.</th>
          </tr>
        </thead>
        <tbody>
          {stats.rows.map(({ student, calc }, idx) => (
            <tr key={student.id} className="border-b border-stone-800">
              <td className="py-1 px-1 text-center border-r border-stone-800 font-mono">{idx + 1}</td>
              <td className="py-1 px-2 text-left border-r border-stone-800 font-semibold">{student.nama}</td>
              <td className="py-1 px-1 text-center border-r border-stone-800 font-mono text-[9.5px]">{student.nisn || '–'}</td>
              <td className="py-1 px-2 text-left border-r border-stone-800">{student.jilid || '–'}</td>
              <td className="py-1 px-2 text-left border-r border-stone-800">{student.hafalan || '–'}</td>
              <td className="py-1 px-1 text-center border-r border-stone-800 tabular-nums">{calc.n}/37</td>
              <td className="py-1 px-1 text-center border-r border-stone-800 tabular-nums">{formatScore(calc.t)}</td>
              <td className="py-1 px-1 text-center border-r border-stone-800 tabular-nums">{formatScore(calc.m)}</td>
              <td className="py-1 px-1 text-center border-r border-stone-800 tabular-nums">{formatScore(calc.l)}</td>
              <td className="py-1 px-1 text-center border-r border-stone-800 tabular-nums font-bold">{formatScore(calc.f)}</td>
              <td className="py-1 px-1 text-center font-bold">{calc.g || '–'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* DETAIL SURAT YANG SUDAH DIINPUT PER SISWA */}
      <div className="space-y-3 mt-4">
        <h3 className="font-bold text-xs uppercase tracking-wider border-b border-stone-300 pb-1 text-stone-800">
          Rincian Surat & Nilai per Siswa
        </h3>
        {students.map((student, sIdx) => {
          const scores = student.s || {};
          const assessedEntries = Object.entries(scores);
          if (assessedEntries.length === 0) return null;

          return (
            <div key={student.id} className="border border-stone-200 rounded p-2.5 text-[10px] bg-stone-50/40">
              <div className="font-bold text-stone-900 mb-1 flex items-center justify-between">
                <span>{sIdx + 1}. {student.nama} (Jilid: {student.jilid || '–'} · Hafalan: {student.hafalan || '–'})</span>
                <span className="text-stone-500 font-mono">{assessedEntries.length} Surat Dinilai</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {assessedEntries.map(([surahIdxStr, tuple]) => {
                  const sIdxNum = Number(surahIdxStr);
                  const surahName = surahList[sIdxNum] || `Surat #${sIdxNum + 1}`;
                  const avg = getSurahAverage(tuple);
                  return (
                    <span key={sIdxNum} className="inline-flex items-center gap-1 bg-white border border-stone-300 rounded px-1.5 py-0.5">
                      <span className="font-semibold text-stone-800">{surahName}:</span>
                      <span className="font-mono text-emerald-800 font-bold">{formatScore(avg)}</span>
                      <span className="text-stone-400">({tuple[0] ?? '–'},{tuple[1] ?? '–'},{tuple[2] ?? '–'})</span>
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* TANDA TANGAN */}
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
