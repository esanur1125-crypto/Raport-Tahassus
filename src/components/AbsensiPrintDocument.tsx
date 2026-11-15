import React from 'react';
import { Student, SchoolInfo, AttendanceDay, AttendanceStatus } from '../types';
import { ROMAN_CLASS } from '../data/seedData';
import { formatIndoDate } from '../utils/dateUtils';

interface AbsensiPrintDocumentProps {
  students: Student[];
  school: SchoolInfo;
  className: string;
  attendanceDay: AttendanceDay;
}

export const AbsensiPrintDocument: React.FC<AbsensiPrintDocumentProps> = ({
  students,
  school,
  className,
  attendanceDay
}) => {
  const addressLine = `${school.alamat}${school.desa ? ' ' + school.desa : ''}`;

  let hadirCount = 0;
  let izinCount = 0;
  let sakitCount = 0;
  let alpaCount = 0;

  const records = attendanceDay?.records || {};

  students.forEach((s) => {
    const st = records[s.id] || 'H';
    if (st === 'H') hadirCount++;
    else if (st === 'I') izinCount++;
    else if (st === 'S') sakitCount++;
    else if (st === 'A') alpaCount++;
  });

  const total = students.length || 1;
  const hadirPct = Math.round((hadirCount / total) * 100);

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
        DAFTAR HADIR & PRESENSI SISWA TAHASSUS
      </div>

      {/* SUB-HEADER INFO */}
      <div className="grid grid-cols-2 gap-x-6 text-[11px] mb-3 pb-2 border-b border-stone-200">
        <div>
          <span>Kelas: <b>{ROMAN_CLASS[className] || className}</b></span>
          <span className="mx-2">·</span>
          <span>Semester: <b>{school.semester}</b></span>
        </div>
        <div className="text-right">
          <span>Hari / Tanggal: <b>{formatIndoDate(attendanceDay.tanggal) || attendanceDay.tanggal}</b></span>
          <span className="mx-2">·</span>
          <span>Tahun: <b>{school.tahun}</b></span>
        </div>
      </div>

      {/* TABEL PRESENSI */}
      <table className="w-full border border-stone-900 border-collapse text-[10.5px] mb-4">
        <thead>
          <tr className="bg-stone-100 border-b border-stone-900 font-bold">
            <th className="py-1.5 px-1 text-center border-r border-stone-900 w-8">No</th>
            <th className="py-1.5 px-2 text-center border-r border-stone-900 w-24">NISN</th>
            <th className="py-1.5 px-3 text-left border-r border-stone-900">Nama Lengkap Siswa</th>
            <th className="py-1.5 px-1 text-center border-r border-stone-900 w-10">L/P</th>
            <th className="py-1.5 px-1 text-center border-r border-stone-900 w-12">Status</th>
            <th className="py-1.5 px-3 text-left border-r border-stone-900 min-w-[140px]">Keterangan</th>
            <th className="py-1.5 px-2 text-center w-20">Tanda Tangan</th>
          </tr>
        </thead>
        <tbody>
          {students.map((st, idx) => {
            const status: AttendanceStatus = records[st.id] || 'H';
            const statusLabel =
              status === 'H' ? 'Hadir' : status === 'I' ? 'Izin' : status === 'S' ? 'Sakit' : 'Alpa';

            return (
              <tr key={st.id} className="border-b border-stone-800">
                <td className="py-1.5 px-1 text-center border-r border-stone-800 font-mono">{idx + 1}</td>
                <td className="py-1.5 px-2 text-center border-r border-stone-800 font-mono text-[10px]">{st.nisn}</td>
                <td className="py-1.5 px-3 text-left border-r border-stone-800 font-semibold">{st.nama}</td>
                <td className="py-1.5 px-1 text-center border-r border-stone-800">{st.jk}</td>
                <td className="py-1.5 px-1 text-center border-r border-stone-800 font-bold">
                  {status}
                </td>
                <td className="py-1.5 px-3 text-left border-r border-stone-800 italic text-[10px]">
                  {status !== 'H' ? statusLabel : ''}
                </td>
                <td className="py-1.5 px-2 text-center font-mono text-[9px] text-stone-400">
                  {status === 'H' ? '✓' : '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* REKAP KEHADIRAN BOX */}
      <div className="border border-stone-900 p-3 mb-4 text-[11px] grid grid-cols-5 text-center gap-2 bg-stone-50/50">
        <div>
          <span className="block text-stone-600">Hadir (H)</span>
          <b className="text-sm">{hadirCount}</b>
        </div>
        <div>
          <span className="block text-stone-600">Izin (I)</span>
          <b className="text-sm">{izinCount}</b>
        </div>
        <div>
          <span className="block text-stone-600">Sakit (S)</span>
          <b className="text-sm">{sakitCount}</b>
        </div>
        <div>
          <span className="block text-stone-600">Alpa (A)</span>
          <b className="text-sm">{alpaCount}</b>
        </div>
        <div>
          <span className="block text-stone-600">% Kehadiran</span>
          <b className="text-sm text-emerald-900">{hadirPct}%</b>
        </div>
      </div>

      {attendanceDay.catatan && (
        <div className="border border-stone-300 p-2 text-[10.5px] italic mb-4">
          <b>Catatan Sesi:</b> {attendanceDay.catatan}
        </div>
      )}

      {/* PENGESAHAN TANDA TANGAN */}
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
