import React from 'react';
import { Student, SchoolInfo, ClassTarget } from '../types';
import { calculateClassStats, formatScore } from '../utils/calculations';
import { ROMAN_CLASS } from '../data/seedData';

interface NilaiInputPrintDocumentProps {
  students: Student[];
  school: SchoolInfo;
  className: string;
  target?: ClassTarget;
}

export const NilaiInputPrintDocument: React.FC<NilaiInputPrintDocumentProps> = ({
  students,
  school,
  className,
  target
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
        LEMBAR KERJA & FORM INPUT PENILAIAN TAHASSUS KELAS {ROMAN_CLASS[className] || className}
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
          <span className="font-semibold">Guru Pengampu:</span> {school.guru}
        </div>
      </div>

      {/* TABEL FORM INPUT PENILAIAN PER KELAS */}
      <table className="w-full border border-stone-900 border-collapse text-[10px] mb-4">
        <thead>
          <tr className="bg-stone-100 border-b border-stone-900 font-bold">
            <th className="py-2 px-1 text-center border-r border-stone-900 w-8">No</th>
            <th className="py-2 px-2 text-left border-r border-stone-900 min-w-[150px]">Nama Lengkap Siswa</th>
            <th className="py-2 px-1 text-center border-r border-stone-900 w-20">NISN</th>
            <th className="py-2 px-1 text-center border-r border-stone-900 w-7">L/P</th>
            <th className="py-2 px-2 text-left border-r border-stone-900 w-20">Jilid</th>
            <th className="py-2 px-2 text-left border-r border-stone-900 w-24">Hafalan Surat</th>
            <th className="py-2 px-1 text-center border-r border-stone-900 w-12">Tajwid</th>
            <th className="py-2 px-1 text-center border-r border-stone-900 w-12">Makhroj</th>
            <th className="py-2 px-1 text-center border-r border-stone-900 w-12">Kelanc.</th>
            <th className="py-2 px-1 text-center border-r border-stone-900 w-12 font-bold">Nilai</th>
            <th className="py-2 px-2 text-center w-16">Paraf</th>
          </tr>
        </thead>
        <tbody>
          {stats.rows.map(({ student, calc }, idx) => (
            <tr key={student.id} className="border-b border-stone-800 h-8">
              <td className="py-1 px-1 text-center border-r border-stone-800 font-mono">{idx + 1}</td>
              <td className="py-1 px-2 text-left border-r border-stone-800 font-semibold">{student.nama}</td>
              <td className="py-1 px-1 text-center border-r border-stone-800 font-mono text-[9.5px]">{student.nisn || '–'}</td>
              <td className="py-1 px-1 text-center border-r border-stone-800">{student.jk}</td>
              <td className="py-1 px-2 text-left border-r border-stone-800">{student.jilid || '–'}</td>
              <td className="py-1 px-2 text-left border-r border-stone-800">{student.hafalan || '–'}</td>
              <td className="py-1 px-1 text-center border-r border-stone-800">{calc.t !== null ? formatScore(calc.t) : ''}</td>
              <td className="py-1 px-1 text-center border-r border-stone-800">{calc.m !== null ? formatScore(calc.m) : ''}</td>
              <td className="py-1 px-1 text-center border-r border-stone-800">{calc.l !== null ? formatScore(calc.l) : ''}</td>
              <td className="py-1 px-1 text-center border-r border-stone-800 font-bold">{calc.f !== null ? formatScore(calc.f) : ''}</td>
              <td className="py-1 px-2 text-center"></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* CATATAN PETUNJUK */}
      <div className="border border-stone-900 p-2.5 mb-4 text-[10px] bg-stone-50/50 leading-relaxed">
        <b>Petunjuk Pengisian:</b>
        <ol className="list-decimal list-inside mt-0.5 space-y-0.5 text-stone-700">
          <li>Lembar kerja ini digunakan oleh guru pengampu untuk mencatat nilai harian / ujian tahassus siswa per kelas secara manual sebelum diinput ke aplikasi.</li>
          <li>Aspek penilaian meliputi <b>Tajwid</b>, <b>Makhroj</b>, dan <b>Kelancaran</b> dengan rentang nilai 0 s.d. 100.</li>
          <li>Nilai akhir dihitung secara otomatis berdasarkan bobot capaian surat dalam Juz 30.</li>
        </ol>
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
