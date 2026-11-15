import React from 'react';
import { Student, SchoolInfo, ClassTarget } from '../types';
import { calculateStudent, formatScore, getPredikat, getSurahAverage, checkTargetAchievement } from '../utils/calculations';
import { ROMAN_CLASS, PREDICATE_COMMENTS } from '../data/seedData';

interface RaportDocumentProps {
  student: Student;
  school: SchoolInfo;
  surahList: string[];
  className: string;
  target?: ClassTarget;
}

export const RaportDocument: React.FC<RaportDocumentProps> = ({
  student,
  school,
  surahList,
  className,
  target
}) => {
  if (!student) {
    return null;
  }

  const calc = calculateStudent(student);
  const achievement = checkTargetAchievement(student, target, surahList);
  const doneSurahs = Object.keys(student.s || {})
    .map(Number)
    .sort((a, b) => a - b);

  const half = Math.ceil(doneSurahs.length / 2);
  const leftCol = doneSurahs.slice(0, half);
  const rightCol = doneSurahs.slice(half);

  const renderSurahRows = (indices: number[]) => {
    return indices.map((idx) => {
      const avg = getSurahAverage(student.s?.[idx]);
      const pred = getPredikat(avg);
      return (
        <tr key={idx} className="border-b border-stone-800">
          <td className="py-1 px-2 text-center border-r border-stone-800 font-mono text-xs w-8">
            {idx + 1}
          </td>
          <td className="py-1 px-2 text-left border-r border-stone-800 font-medium text-xs">
            {surahList[idx] || `Surat ${idx + 1}`}
          </td>
          <td className="py-1 px-2 text-center border-r border-stone-800 tabular-nums font-semibold text-xs w-12">
            {formatScore(avg)}
          </td>
          <td className="py-1 px-2 text-center font-bold text-xs w-10">
            {pred || '–'}
          </td>
        </tr>
      );
    });
  };

  const addressLine = `${school.alamat}${school.desa ? ' ' + school.desa : ''}`;
  const comment = calc.g ? PREDICATE_COMMENTS[calc.g] : '–';

  return (
    <article className="print-page w-[210mm] min-h-[297mm] mx-auto bg-white text-stone-900 p-8 sm:p-12 border border-stone-300 shadow-md font-doc text-sm leading-normal box-border">
      {/* KOP SURAT */}
      <div className="grid grid-cols-[80px_1fr_80px] items-center gap-3 text-center border-b-[3px] border-double border-stone-900 pb-3 mb-4">
        {/* Logo Kiri */}
        <div className="flex items-center justify-center h-20 w-20">
          {school.logoL ? (
            <img
              src={school.logoL}
              alt="Logo Madrasah"
              className="max-h-20 max-w-20 object-contain"
            />
          ) : (
            <div className="w-16 h-16 border border-dashed border-stone-300 rounded flex items-center justify-center text-xs text-stone-400">
              Logo
            </div>
          )}
        </div>

        {/* Identitas Madrasah */}
        <div>
          <div className="text-xs uppercase font-semibold tracking-wider text-stone-800">
            {school.yayasan}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 uppercase my-0.5">
            {school.nama}
          </h2>
          <div className="text-xs text-stone-700 leading-tight">
            NSM: {school.nsm} · NPSN: {school.npsn}
            <br />
            {addressLine}, Kec. {school.kec}, Kab. {school.kab} – {school.prov}
          </div>
        </div>

        {/* Logo Kanan */}
        <div className="flex items-center justify-center h-20 w-20">
          {school.logoR ? (
            <img
              src={school.logoR}
              alt="Logo Kemenag"
              className="max-h-20 max-w-20 object-contain"
            />
          ) : (
            <div className="w-16 h-16 border border-dashed border-stone-300 rounded flex items-center justify-center text-xs text-stone-400">
              Logo
            </div>
          )}
        </div>
      </div>

      {/* JUDUL RAPORT */}
      <div className="text-center font-bold text-base tracking-widest uppercase my-3 underline underline-offset-4">
        CAPAIAN BELAJAR
      </div>

      {/* IDENTITAS SISWA */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs sm:text-sm mb-4">
        <div className="grid grid-cols-[80px_1fr]">
          <span className="font-semibold">Nama</span>
          <span>: {student.nama}</span>
        </div>
        <div className="grid grid-cols-[80px_1fr]">
          <span className="font-semibold">Kelas</span>
          <span>: {ROMAN_CLASS[className] || className}</span>
        </div>
        <div className="grid grid-cols-[80px_1fr]">
          <span className="font-semibold">NISN</span>
          <span>: {student.nisn || '–'}</span>
        </div>
        <div className="grid grid-cols-[80px_1fr]">
          <span className="font-semibold">Semester</span>
          <span>: {school.semester}</span>
        </div>
        <div className="grid grid-cols-[80px_1fr]">
          <span className="font-semibold">Sekolah</span>
          <span>: {school.nama}</span>
        </div>
        <div className="grid grid-cols-[80px_1fr]">
          <span className="font-semibold">Tahun</span>
          <span>: {school.tahun}</span>
        </div>
      </div>

      {/* 1. MATERI TAHASSUS */}
      <div className="mb-3">
        <h3 className="font-bold text-sm mb-1.5">1. Materi Tahassus</h3>
        <table className="w-full border border-stone-900 border-collapse text-xs">
          <thead>
            <tr className="bg-stone-100 border-b border-stone-900 font-bold">
              <th className="py-1 px-2 text-center border-r border-stone-900 w-8">No</th>
              <th className="py-1 px-3 text-left border-r border-stone-900">Materi Tahassus</th>
              <th className="py-1 px-3 text-left border-r border-stone-900">Target Kelas</th>
              <th className="py-1 px-3 text-left border-r border-stone-900">Capaian Siswa</th>
              <th className="py-1 px-2 text-center w-24">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-stone-900">
              <td className="py-1 px-2 text-center border-r border-stone-900">1</td>
              <td className="py-1 px-3 border-r border-stone-900 font-medium">Hafalan Surat (Juz 30)</td>
              <td className="py-1 px-3 border-r border-stone-900 text-stone-700">
                {target?.targetHafalanSurah ? `${target.targetHafalanSurah} (Min. ${target.targetSurahCount} Surat)` : '–'}
              </td>
              <td className="py-1 px-3 border-r border-stone-900 font-semibold">{student.hafalan || '–'}</td>
              <td className="py-1 px-2 text-center font-bold text-xs">
                {achievement.hafalanAchieved ? 'Tuntas' : 'Proses'}
              </td>
            </tr>
            <tr>
              <td className="py-1 px-2 text-center border-r border-stone-900">2</td>
              <td className="py-1 px-3 border-r border-stone-900 font-medium">Fashohati / Qiroati</td>
              <td className="py-1 px-3 border-r border-stone-900 text-stone-700">
                {target?.targetJilid || '–'}
              </td>
              <td className="py-1 px-3 border-r border-stone-900 font-semibold">{student.jilid || '–'}</td>
              <td className="py-1 px-2 text-center font-bold text-xs">
                {achievement.jilidAchieved ? 'Tuntas' : 'Proses'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 2. PENILAIAN TAHFIDZ */}
      <div className="mb-3">
        <h3 className="font-bold text-sm mb-1.5">2. Penilaian Tahfidz</h3>
        <table className="w-full border border-stone-900 border-collapse text-xs">
          <thead>
            <tr className="bg-stone-100 border-b border-stone-900 font-bold">
              <th className="py-1 px-2 text-center border-r border-stone-900 w-10">No</th>
              <th className="py-1 px-3 text-left border-r border-stone-900">Penilaian Tahfidz</th>
              <th className="py-1 px-3 text-center border-r border-stone-900 w-20">Nilai</th>
              <th className="py-1 px-3 text-center w-20">Predikat</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-stone-900">
              <td className="py-1 px-2 text-center border-r border-stone-900">1</td>
              <td className="py-1 px-3 border-r border-stone-900 font-medium">Tajwid</td>
              <td className="py-1 px-3 text-center border-r border-stone-900 tabular-nums">
                {formatScore(calc.t, 0)}
              </td>
              <td className="py-1 px-3 text-center font-semibold">
                {getPredikat(calc.t) || '–'}
              </td>
            </tr>
            <tr className="border-b border-stone-900">
              <td className="py-1 px-2 text-center border-r border-stone-900">2</td>
              <td className="py-1 px-3 border-r border-stone-900 font-medium">Makhroj</td>
              <td className="py-1 px-3 text-center border-r border-stone-900 tabular-nums">
                {formatScore(calc.m, 0)}
              </td>
              <td className="py-1 px-3 text-center font-semibold">
                {getPredikat(calc.m) || '–'}
              </td>
            </tr>
            <tr className="border-b border-stone-900">
              <td className="py-1 px-2 text-center border-r border-stone-900">3</td>
              <td className="py-1 px-3 border-r border-stone-900 font-medium">Kelancaran</td>
              <td className="py-1 px-3 text-center border-r border-stone-900 tabular-nums">
                {formatScore(calc.l, 0)}
              </td>
              <td className="py-1 px-3 text-center font-semibold">
                {getPredikat(calc.l) || '–'}
              </td>
            </tr>
            <tr className="font-bold bg-stone-50">
              <td className="py-1 px-2 text-center border-r border-stone-900">4</td>
              <td className="py-1 px-3 border-r border-stone-900">Nilai Akhir</td>
              <td className="py-1 px-3 text-center border-r border-stone-900 tabular-nums">
                {formatScore(calc.f, 1)}
              </td>
              <td className="py-1 px-3 text-center text-sm font-bold">
                {calc.g || '–'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 3. MATERI HAFALAN (SPLIT INTO TWO COLUMNS) */}
      <div className="mb-3">
        <h3 className="font-bold text-sm mb-1.5">3. Materi Hafalan</h3>
        {doneSurahs.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 items-start">
            {/* Left table */}
            <table className="w-full border border-stone-900 border-collapse text-xs">
              <thead>
                <tr className="bg-stone-100 border-b border-stone-900 font-bold">
                  <th className="py-1 px-1 text-center border-r border-stone-900 w-8">No</th>
                  <th className="py-1 px-2 text-left border-r border-stone-900">Surat</th>
                  <th className="py-1 px-1 text-center border-r border-stone-900 w-12">Nilai</th>
                  <th className="py-1 px-1 text-center w-10">Pred.</th>
                </tr>
              </thead>
              <tbody>{renderSurahRows(leftCol)}</tbody>
            </table>

            {/* Right table */}
            {rightCol.length > 0 ? (
              <table className="w-full border border-stone-900 border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-100 border-b border-stone-900 font-bold">
                    <th className="py-1 px-1 text-center border-r border-stone-900 w-8">No</th>
                    <th className="py-1 px-2 text-left border-r border-stone-900">Surat</th>
                    <th className="py-1 px-1 text-center border-r border-stone-900 w-12">Nilai</th>
                    <th className="py-1 px-1 text-center w-10">Pred.</th>
                  </tr>
                </thead>
                <tbody>{renderSurahRows(rightCol)}</tbody>
              </table>
            ) : (
              <div />
            )}
          </div>
        ) : (
          <div className="border border-stone-300 p-4 text-center text-xs text-stone-500 italic">
            Belum ada surat yang dinilai.
          </div>
        )}
      </div>

      {/* CATATAN GURU */}
      <div className="border border-stone-900 p-2.5 mb-4 text-xs">
        <span className="font-bold block mb-0.5">Catatan Guru:</span>
        <p className="italic text-stone-800 leading-relaxed">{comment}</p>
      </div>

      {/* TANDA TANGAN */}
      <div className="grid grid-cols-2 gap-4 mt-6 text-center text-xs">
        <div>
          <div>Orang Tua / Wali</div>
          <div className="h-16" />
          <div className="font-semibold">( ........................................ )</div>
        </div>

        <div>
          <div>{school.tanggal}</div>
          <div>Guru Pengampu</div>
          <div className="h-14" />
          <div className="font-bold underline">{school.guru}</div>
        </div>

        <div className="col-span-2 mt-2">
          <div>Mengetahui,</div>
          <div>Kepala Madrasah</div>
          <div className="h-14" />
          <div className="font-bold underline">{school.kepala}</div>
        </div>
      </div>

      {/* KRITERIA PREDIKAT FOOTER */}
      <div className="mt-4 pt-2 border-t border-stone-300 text-[10px] text-stone-500 text-center">
        Rentang Predikat: A = 90 – 100 · B = 80 – 89 · C = 70 – 79 · D = 60 – 69 · E = &lt; 60
      </div>
    </article>
  );
};
