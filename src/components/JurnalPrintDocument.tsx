import React from 'react';
import { JournalEntry, SchoolInfo } from '../types';
import { ROMAN_CLASS } from '../data/seedData';
import { formatScore, mean } from '../utils/calculations';

export type JurnalPeriodType = 'harian' | 'mingguan' | 'bulanan';

interface JurnalPrintDocumentProps {
  entries: JournalEntry[];
  school: SchoolInfo;
  className: string;
  periodType?: JurnalPeriodType;
  periodLabel?: string;
  filterDate?: string;
  selectedStudentName?: string;
}

export const JurnalPrintDocument: React.FC<JurnalPrintDocumentProps> = ({
  entries,
  school,
  className,
  periodType = 'harian',
  periodLabel,
  filterDate,
  selectedStudentName
}) => {
  const addressLine = `${school.alamat}${school.desa ? ' ' + school.desa : ''}`;

  // Statistics
  const ziyadahCount = entries.filter((e) => e.tipe === 'ziyadah').length;
  const murojaahCount = entries.filter((e) => e.tipe === 'murojaah').length;
  const fashohatiCount = entries.filter((e) => e.tipe === 'fashohati').length;
  const lancarCount = entries.filter((e) => e.status === 'Lancar').length;
  const lancarPct = entries.length ? Math.round((lancarCount / entries.length) * 100) : 0;

  const validScores = entries.map((e) => e.nilai).filter((v): v is number => v !== null && !isNaN(v));
  const avgNilai = validScores.length ? mean(validScores) : null;

  // Title per period
  const docTitle =
    periodType === 'mingguan'
      ? "REKAPITULASI JURNAL MUTABA'AH MINGGUAN"
      : periodType === 'bulanan'
      ? "REKAPITULASI JURNAL MUTABA'AH BULANAN"
      : "JURNAL MUTABA'AH HARIAN HAFALAN & FASHOATI";

  return (
    <article className="print-page w-[210mm] min-h-[297mm] mx-auto bg-white text-stone-900 p-8 sm:p-12 border border-stone-300 shadow-md font-doc text-xs leading-normal box-border">
      {/* KOP SURAT RESMI */}
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
        {docTitle}
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
          <span>Periode: <b>{periodLabel || filterDate || 'Semua Periode'}</b></span>
          {selectedStudentName && (
            <>
              <span className="mx-2">·</span>
              <span>Siswa: <b>{selectedStudentName}</b></span>
            </>
          )}
        </div>
      </div>

      {/* STATISTICAL SUMMARY BANNER */}
      <div className="border border-stone-900 p-2.5 mb-3 text-[10.5px] grid grid-cols-6 text-center gap-2 bg-stone-50/60">
        <div>
          <span className="block text-stone-600">Total Setoran</span>
          <b className="text-xs text-stone-900">{entries.length}</b>
        </div>
        <div>
          <span className="block text-stone-600">Ziyadah</span>
          <b className="text-xs text-emerald-900">{ziyadahCount}</b>
        </div>
        <div>
          <span className="block text-stone-600">Muroja'ah</span>
          <b className="text-xs text-sky-900">{murojaahCount}</b>
        </div>
        <div>
          <span className="block text-stone-600">Fashohati</span>
          <b className="text-xs text-amber-900">{fashohatiCount}</b>
        </div>
        <div>
          <span className="block text-stone-600">Rata-Rata Nilai</span>
          <b className="text-xs text-stone-900">{formatScore(avgNilai)}</b>
        </div>
        <div>
          <span className="block text-stone-600">% Kelancaran</span>
          <b className="text-xs text-emerald-900">{lancarPct}%</b>
        </div>
      </div>

      {/* TABEL JURNAL MUTABA'AH */}
      <table className="w-full border border-stone-900 border-collapse text-[10px] mb-4">
        <thead>
          <tr className="bg-stone-100 border-b border-stone-900 font-bold">
            <th className="py-1.5 px-1 text-center border-r border-stone-900 w-7">No</th>
            <th className="py-1.5 px-2 text-center border-r border-stone-900 w-20">Tanggal</th>
            <th className="py-1.5 px-2 text-left border-r border-stone-900 min-w-[130px]">Nama Siswa</th>
            <th className="py-1.5 px-2 text-center border-r border-stone-900 w-16">Jenis</th>
            <th className="py-1.5 px-2 text-left border-r border-stone-900 min-w-[110px]">Materi (Surat/Jilid)</th>
            <th className="py-1.5 px-2 text-left border-r border-stone-900 w-24">Ayat / Hal</th>
            <th className="py-1.5 px-1 text-center border-r border-stone-900 w-10">Nilai</th>
            <th className="py-1.5 px-2 text-center border-r border-stone-900 w-18">Status</th>
            <th className="py-1.5 px-2 text-left border-r border-stone-900 min-w-[120px]">Catatan Evaluasi</th>
            <th className="py-1.5 px-1 text-center w-12">Paraf</th>
          </tr>
        </thead>
        <tbody>
          {entries.length > 0 ? (
            entries.map((item, idx) => (
              <tr key={item.id} className="border-b border-stone-800">
                <td className="py-1 px-1 text-center border-r border-stone-800 font-mono">{idx + 1}</td>
                <td className="py-1 px-2 text-center border-r border-stone-800 tabular-nums">{item.tanggal}</td>
                <td className="py-1 px-2 text-left border-r border-stone-800 font-semibold">{item.studentNama}</td>
                <td className="py-1 px-2 text-center border-r border-stone-800 capitalize font-medium">
                  {item.tipe === 'ziyadah'
                    ? 'Ziyadah'
                    : item.tipe === 'murojaah'
                    ? "Muroja'ah"
                    : 'Fashohati'}
                </td>
                <td className="py-1 px-2 text-left border-r border-stone-800">{item.surahOrJilid}</td>
                <td className="py-1 px-2 text-left border-r border-stone-800">{item.ayatOrHalaman}</td>
                <td className="py-1 px-1 text-center border-r border-stone-800 font-bold tabular-nums">
                  {item.nilai !== null ? item.nilai : '–'}
                </td>
                <td className="py-1 px-2 text-center border-r border-stone-800 font-medium">{item.status}</td>
                <td className="py-1 px-2 text-left border-r border-stone-800 italic text-[9.5px]">
                  {item.catatan || '–'}
                </td>
                <td className="py-1 px-1 text-center text-stone-500 font-mono">✓</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={10} className="py-8 text-center italic text-stone-500">
                Belum ada data setoran hafalan pada periode {periodLabel || filterDate || 'ini'}.
              </td>
            </tr>
          )}
        </tbody>
      </table>

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
