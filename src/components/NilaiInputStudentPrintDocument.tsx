import React from 'react';
import { Student, SchoolInfo, ClassTarget } from '../types';
import { calculateStudent, formatScore, getSurahAverage, getPredikat, checkTargetAchievement } from '../utils/calculations';
import { ROMAN_CLASS } from '../data/seedData';

interface NilaiInputStudentPrintDocumentProps {
  student: Student;
  school: SchoolInfo;
  className: string;
  surahList: string[];
  target?: ClassTarget;
}

export const NilaiInputStudentPrintDocument: React.FC<NilaiInputStudentPrintDocumentProps> = ({
  student,
  school,
  className,
  surahList,
  target
}) => {
  const calc = calculateStudent(student);
  const addressLine = `${school.alamat}${school.desa ? ' ' + school.desa : ''}`;
  const ach = checkTargetAchievement(student, target, surahList);

  return (
    <article className="print-page w-[210mm] min-h-[297mm] mx-auto bg-white text-stone-900 p-8 sm:p-12 border border-stone-300 shadow-md font-doc text-xs leading-normal box-border">
      <style>{`
        @media print {
          .print-page {
            page-break-after: always;
            break-after: page;
          }
        }
      `}</style>

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
      <div className="text-center my-2">
        <span className="font-bold text-sm tracking-wider uppercase border-b-2 border-stone-900 pb-0.5 px-4 inline-block">
          LEMBAR RINCIAN & INPUT NILAI TAHASSUS PER SISWA
        </span>
      </div>

      {/* BIODATA SISWA */}
      <div className="border border-stone-900 p-3 mb-4 rounded bg-stone-50/50 grid grid-cols-2 gap-x-6 gap-y-1 text-[11px]">
        <div>
          <span className="font-semibold">Nama Lengkap:</span> <strong className="text-stone-900">{student.nama}</strong>
        </div>
        <div>
          <span className="font-semibold">Kelas:</span> {ROMAN_CLASS[className] || className}
        </div>
        <div>
          <span className="font-semibold">NISN / NIS:</span> {student.nisn || '–'}
        </div>
        <div>
          <span className="font-semibold">Semester / Tgl:</span> {school.semester} ({school.tahun})
        </div>
        <div>
          <span className="font-semibold">Jilid Saat Ini:</span> <strong className="text-emerald-800">{student.jilid || '–'}</strong> {ach.jilidAchieved && ' (Tuntas Target)'}
        </div>
        <div>
          <span className="font-semibold">Hafalan Terakhir:</span> <strong className="text-emerald-800">{student.hafalan || '–'}</strong>
        </div>
      </div>

      {/* RINGKASAN NILAI */}
      <div className="grid grid-cols-4 gap-2 mb-4 text-center">
        <div className="border border-stone-900 p-2 bg-stone-50">
          <div className="text-[10px] text-stone-500 uppercase font-bold">Tajwid</div>
          <div className="text-base font-bold text-stone-900">{formatScore(calc.t)}</div>
        </div>
        <div className="border border-stone-900 p-2 bg-stone-50">
          <div className="text-[10px] text-stone-500 uppercase font-bold">Makhroj</div>
          <div className="text-base font-bold text-stone-900">{formatScore(calc.m)}</div>
        </div>
        <div className="border border-stone-900 p-2 bg-stone-50">
          <div className="text-[10px] text-stone-500 uppercase font-bold">Kelancaran</div>
          <div className="text-base font-bold text-stone-900">{formatScore(calc.l)}</div>
        </div>
        <div className="border border-stone-900 p-2 bg-emerald-50">
          <div className="text-[10px] text-emerald-800 uppercase font-bold">Nilai Akhir</div>
          <div className="text-base font-bold text-emerald-900">{formatScore(calc.f)} ({calc.g || '–'})</div>
        </div>
      </div>

      {/* TABEL 37 SURAH */}
      <table className="w-full border border-stone-900 border-collapse text-[10px] mb-4">
        <thead>
          <tr className="bg-stone-100 border-b border-stone-900 font-bold">
            <th className="py-1.5 px-1 text-center border-r border-stone-900 w-8">No</th>
            <th className="py-1.5 px-3 text-left border-r border-stone-950 min-w-[150px]">Nama Surat (Juz 30)</th>
            <th className="py-1.5 px-2 text-center border-r border-stone-900 w-16">Tajwid</th>
            <th className="py-1.5 px-2 text-center border-r border-stone-900 w-16">Makhroj</th>
            <th className="py-1.5 px-2 text-center border-r border-stone-900 w-16">Kelancaran</th>
            <th className="py-1.5 px-2 text-center border-r border-stone-900 w-16 font-bold">Rata2</th>
            <th className="py-1.5 px-2 text-center w-14">Pred.</th>
          </tr>
        </thead>
        <tbody>
          {surahList.map((surahName, idx) => {
            const tuple = student.s[idx] || [null, null, null];
            const avg = getSurahAverage(tuple);
            const pred = getPredikat(avg);
            const hasScore = tuple.some((v) => v !== null);

            return (
              <tr key={idx} className={`border-b border-stone-800 ${hasScore ? '' : 'text-stone-400 bg-stone-50/30'}`}>
                <td className="py-1 px-1 text-center border-r border-stone-800 font-mono">{idx + 1}</td>
                <td className="py-1 px-3 text-left border-r border-stone-800 font-medium">{surahName}</td>
                <td className="py-1 px-2 text-center border-r border-stone-800 tabular-nums">{tuple[0] !== null ? tuple[0] : '–'}</td>
                <td className="py-1 px-2 text-center border-r border-stone-800 tabular-nums">{tuple[1] !== null ? tuple[1] : '–'}</td>
                <td className="py-1 px-2 text-center border-r border-stone-800 tabular-nums">{tuple[2] !== null ? tuple[2] : '–'}</td>
                <td className="py-1 px-2 text-center border-r border-stone-800 tabular-nums font-bold">{formatScore(avg)}</td>
                <td className="py-1 px-2 text-center font-bold">{pred || '–'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* TANDA TANGAN */}
      <div className="grid grid-cols-2 gap-4 mt-6 text-center text-xs break-inside-avoid page-break-inside-avoid">
        <div>
          <div>Mengetahui,</div>
          <div>Kepala Madrasah</div>
          <div className="h-16" />
          <div className="font-bold border-b border-stone-900 inline-block px-8 pb-0.5">{school.kepala}</div>
        </div>

        <div>
          <div>{school.tanggal}</div>
          <div>Guru Pengampu Tahassus</div>
          <div className="h-16" />
          <div className="font-bold border-b border-stone-900 inline-block px-8 pb-0.5">{school.guru}</div>
        </div>
      </div>
    </article>
  );
};
