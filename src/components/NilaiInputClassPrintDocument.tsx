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
    <article className="print-page w-[297mm] min-h-[210mm] mx-auto bg-white text-stone-900 p-6 sm:p-8 border border-stone-300 shadow-md font-doc text-[10px] leading-tight box-border">
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 6mm;
          }
          .no-print { display: none !important; }
          .print-page {
            page-break-after: avoid;
            break-after: avoid;
          }
        }
      `}</style>

      {/* KOP SURAT */}
      <div className="grid grid-cols-[60px_1fr_60px] items-center gap-3 text-center border-b-[3px] border-double border-stone-900 pb-2 mb-2.5">
        <div className="flex items-center justify-center h-14 w-14">
          {school.logoL && (
            <img src={school.logoL} alt="Logo" className="max-h-14 max-w-14 object-contain" />
          )}
        </div>
        <div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-stone-800">
            {school.yayasan}
          </div>
          <h2 className="text-base font-bold tracking-tight text-stone-900 uppercase my-0.5">
            {school.nama}
          </h2>
          <div className="text-[9px] text-stone-700 leading-tight">
            NSM: {school.nsm} · NPSN: {school.npsn} · {addressLine}, Kec. {school.kec}, Kab. {school.kab} – {school.prov}
          </div>
        </div>
        <div className="flex items-center justify-center h-14 w-14">
          {school.logoR && (
            <img src={school.logoR} alt="Logo" className="max-h-14 max-w-14 object-contain" />
          )}
        </div>
      </div>

      {/* JUDUL */}
      <div className="text-center my-1.5">
        <span className="font-bold text-xs tracking-wider uppercase border-b-2 border-stone-900 pb-0.5 px-4 inline-block">
          MATRIX REKAPITULASI INPUT NILAI & CAPAIAN SURAT TAHASSUS (JUZ 30) KELAS {ROMAN_CLASS[className] || className}
        </span>
      </div>

      {/* INFO RINGKAS */}
      <div className="flex justify-between items-center text-[10px] mb-2 pb-1 border-b border-stone-300">
        <div>
          <span>Tahun Ajaran: <b>{school.tahun}</b></span>
          <span className="mx-2">·</span>
          <span>Semester: <b>{school.semester}</b></span>
          <span className="mx-2">·</span>
          <span>Target Jilid: <b>{target?.targetJilid || '–'}</b></span>
        </div>
        <div>
          <span>Jumlah Siswa: <b>{students.length} Siswa</b></span>
          <span className="mx-2">·</span>
          <span>Rata-Rata Kelas: <b>{formatScore(stats.avg)}</b></span>
          <span className="mx-2">·</span>
          <span>Guru Pengampu: <b>{school.guru}</b></span>
        </div>
      </div>

      {/* MATRIX TABLE (Students x 37 Surahs) */}
      <div className="overflow-x-auto mb-2">
        <table className="w-full border border-stone-900 border-collapse text-[9px]">
          <thead>
            <tr className="bg-stone-100 border-b border-stone-900 font-bold text-center">
              <th className="py-1 px-1 border-r border-stone-900 w-7" rowSpan={2}>No</th>
              <th className="py-1 px-2 border-r border-stone-900 text-left min-w-[130px]" rowSpan={2}>Nama Siswa</th>
              <th className="py-1 px-1 border-r border-stone-900 w-16" rowSpan={2}>NISN</th>
              <th className="py-1 px-1 border-r border-stone-900 w-16" rowSpan={2}>Jilid</th>
              <th className="py-1 px-1 border-r border-stone-900 w-20" rowSpan={2}>Hafalan</th>
              <th className="py-1 px-1 border-r border-stone-900 bg-stone-200" colSpan={surahList.length}>
                Nomor Surat Juz 30 (1 s.d. {surahList.length})
              </th>
              <th className="py-1 px-1 border-r border-stone-950 w-10" rowSpan={2}>Jml</th>
              <th className="py-1 px-1 border-r border-stone-950 w-12" rowSpan={2}>Tajwid</th>
              <th className="py-1 px-1 border-r border-stone-950 w-12" rowSpan={2}>Makhroj</th>
              <th className="py-1 px-1 border-r border-stone-950 w-12" rowSpan={2}>Kelanc.</th>
              <th className="py-1 px-1 border-r border-stone-950 w-13 font-bold" rowSpan={2}>Akhir</th>
              <th className="py-1 px-1 w-9" rowSpan={2}>Pred</th>
            </tr>
            <tr className="bg-stone-100 border-b border-stone-900 font-bold text-center text-[8.5px]">
              {surahList.map((_, idx) => (
                <th key={idx} className="py-0.5 px-0.5 border-r border-stone-800 w-5 font-mono" title={surahList[idx]}>
                  {idx + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stats.rows.map(({ student, calc }, idx) => (
              <tr key={student.id} className="border-b border-stone-800 h-5">
                <td className="py-0.5 px-1 text-center border-r border-stone-800 font-mono">{idx + 1}</td>
                <td className="py-0.5 px-2 text-left border-r border-stone-800 font-semibold truncate max-w-[130px]">{student.nama}</td>
                <td className="py-0.5 px-1 text-center border-r border-stone-800 font-mono text-[8.5px]">{student.nisn || '–'}</td>
                <td className="py-0.5 px-1 text-left border-r border-stone-800 truncate max-w-[70px]">{student.jilid || '–'}</td>
                <td className="py-0.5 px-1 text-left border-r border-stone-800 truncate max-w-[80px]">{student.hafalan || '–'}</td>

                {/* 37 Surah Score Cells */}
                {surahList.map((_, sIdx) => {
                  const tuple = student.s[sIdx];
                  const avg = tuple ? getSurahAverage(tuple) : null;
                  return (
                    <td key={sIdx} className="py-0.5 px-0.5 text-center border-r border-stone-300 font-mono text-[8.5px] tabular-nums" title={`${surahList[sIdx]}: ${avg !== null ? formatScore(avg) : 'Belum dinilai'}`}>
                      {avg !== null ? Math.round(avg) : ''}
                    </td>
                  );
                })}

                <td className="py-0.5 px-1 text-center border-r border-stone-800 font-mono tabular-nums">{calc.n}</td>
                <td className="py-0.5 px-1 text-center border-r border-stone-800 tabular-nums">{formatScore(calc.t)}</td>
                <td className="py-0.5 px-1 text-center border-r border-stone-800 tabular-nums">{formatScore(calc.m)}</td>
                <td className="py-0.5 px-1 text-center border-r border-stone-800 tabular-nums">{formatScore(calc.l)}</td>
                <td className="py-0.5 px-1 text-center border-r border-stone-800 tabular-nums font-bold text-[9.5px]">{formatScore(calc.f)}</td>
                <td className="py-0.5 px-1 text-center font-bold">{calc.g || '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SURAH LEGEND KEY */}
      <div className="border border-stone-800 p-1.5 mb-2 text-[8.5px] bg-stone-50/60 rounded">
        <div className="font-bold text-stone-900 mb-0.5 uppercase tracking-wider">Keterangan Nomor Kolom Surat Juz 30 (1 s.d. 37):</div>
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-x-2 gap-y-0.5 text-stone-700">
          {surahList.map((sName, sIdx) => (
            <div key={sIdx} className="truncate">
              <span className="font-mono font-bold text-stone-900">{sIdx + 1}.</span> {sName}
            </div>
          ))}
        </div>
      </div>

      {/* TANDA TANGAN */}
      <div className="grid grid-cols-2 gap-4 mt-4 text-center text-xs break-inside-avoid page-break-inside-avoid">
        <div>
          <div>Mengetahui,</div>
          <div>Kepala Madrasah</div>
          <div className="h-12" />
          <div className="font-bold border-b border-stone-900 inline-block px-8 pb-0.5">{school.kepala}</div>
        </div>

        <div>
          <div>{school.tanggal}</div>
          <div>Guru Pengampu Tahassus</div>
          <div className="h-12" />
          <div className="font-bold border-b border-stone-900 inline-block px-8 pb-0.5">{school.guru}</div>
        </div>
      </div>
    </article>
  );
};
