import React, { useState } from 'react';
import { Student, ScoreTuple, ClassTarget } from '../types';
import { calculateStudent, formatScore, getPredikat, getSurahAverage, getPredikatBadgeClass, checkTargetAchievement } from '../utils/calculations';
import { JILID_OPTIONS } from '../data/seedData';
import { ChevronLeft, ChevronRight, Sparkles, Trash2, CheckCircle2, Target } from 'lucide-react';

interface NilaiViewProps {
  students: Student[];
  currentStudentId: string;
  onSelectStudentId: (id: string) => void;
  surahList: string[];
  activeClass: string;
  target?: ClassTarget;
  onUpdateStudent: (updated: Student) => void;
}

export const NilaiView: React.FC<NilaiViewProps> = ({
  students,
  currentStudentId,
  onSelectStudentId,
  surahList,
  activeClass,
  target,
  onUpdateStudent
}) => {
  const [quickScoreVal, setQuickScoreVal] = useState<number>(80);
  const [showBatchModal, setShowBatchModal] = useState(false);

  const currentIndex = students.findIndex((s) => s.id === currentStudentId);
  const student = students[currentIndex] || students[0];

  if (!student) {
    return (
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-12 text-center text-stone-500 dark:text-stone-400">
        Kelas {activeClass} belum memiliki siswa. Tambahkan siswa di tab Data Siswa terlebih dahulu.
      </div>
    );
  }

  const calc = calculateStudent(student);

  const handlePrev = () => {
    const prevIdx = (currentIndex - 1 + students.length) % students.length;
    onSelectStudentId(students[prevIdx].id);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % students.length;
    onSelectStudentId(students[nextIdx].id);
  };

  const handleScoreChange = (surahIdx: number, aspectIdx: 0 | 1 | 2, rawVal: string) => {
    const clean = rawVal.trim().replace(',', '.');
    let numVal: number | null = clean === '' ? null : parseFloat(clean);
    if (numVal !== null) {
      if (isNaN(numVal)) numVal = null;
      else numVal = Math.max(0, Math.min(100, numVal));
    }

    const currentTuple: ScoreTuple = student.s[surahIdx]
      ? [...student.s[surahIdx]]
      : [null, null, null];

    currentTuple[aspectIdx] = numVal;

    const newScores = { ...student.s };
    if (currentTuple.every((v) => v === null)) {
      delete newScores[surahIdx];
    } else {
      newScores[surahIdx] = currentTuple;
    }

    onUpdateStudent({
      ...student,
      s: newScores
    });
  };

  const handleClearSurah = (surahIdx: number) => {
    const newScores = { ...student.s };
    delete newScores[surahIdx];
    onUpdateStudent({
      ...student,
      s: newScores
    });
  };

  const handleFieldChange = (field: 'jilid' | 'hafalan', value: string) => {
    onUpdateStudent({
      ...student,
      [field]: value
    });
  };

  // Quick fill empty surahs up to selected surah
  const handleQuickFillEmpty = (upToSurahIdx: number, score: number) => {
    const newScores = { ...student.s };
    for (let i = 0; i <= upToSurahIdx; i++) {
      if (!newScores[i]) {
        newScores[i] = [score, score, score];
      }
    }
    onUpdateStudent({
      ...student,
      s: newScores
    });
    setShowBatchModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Student Selector & Bio Card */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Picker */}
          <div>
            <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5">
              Pilih Siswa · Kelas {activeClass}
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                title="Siswa Sebelumnya"
                className="p-2 border border-stone-200 dark:border-stone-700 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer text-stone-700 dark:text-stone-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <select
                value={student.id}
                onChange={(e) => onSelectStudentId(e.target.value)}
                className="py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-semibold text-sm focus:outline-emerald-700 min-w-[240px] max-w-sm"
              >
                {students.map((s, idx) => (
                  <option key={s.id} value={s.id}>
                    {idx + 1}. {s.nama} ({s.nisn || '-'})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleNext}
                title="Siswa Berikutnya"
                className="p-2 border border-stone-200 dark:border-stone-700 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer text-stone-700 dark:text-stone-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick inputs: Jilid & Hafalan */}
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor="jilid-select" className="block text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1">
                Jilid Fashohati / Qiroati
              </label>
              <select
                id="jilid-select"
                value={student.jilid || ''}
                onChange={(e) => handleFieldChange('jilid', e.target.value)}
                className="py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-100 focus:outline-emerald-700 min-w-[150px]"
              >
                {JILID_OPTIONS.map((j) => (
                  <option key={j} value={j}>
                    {j || '– Belum Diisi –'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="hafalan-input" className="block text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1">
                Hafalan Surat Terakhir
              </label>
              <input
                id="hafalan-input"
                type="text"
                list="surah-suggestions"
                value={student.hafalan || ''}
                onChange={(e) => handleFieldChange('hafalan', e.target.value)}
                placeholder="mis. Al-Lail"
                className="py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-emerald-700 min-w-[170px]"
              />
              <datalist id="surah-suggestions">
                {surahList.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>

            {/* Quick helper button */}
            <button
              type="button"
              onClick={() => setShowBatchModal(!showBatchModal)}
              className="py-2 px-3 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/70 border border-emerald-200 dark:border-emerald-800 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bantuan Nilai</span>
            </button>
          </div>
        </div>

        {/* Modal/Dropdown for batch score filling helper */}
        {showBatchModal && (
          <div className="mt-4 p-4 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs space-y-3">
            <div className="font-semibold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              Bantuan Isi Nilai Cepat untuk {student.nama}
            </div>
            <p className="text-stone-600 dark:text-stone-300 text-xs">
              Isi otomatis surat yang belum dinilai sampai surat tertentu dengan nilai seragam:
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                <span>Nilai Default:</span>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={quickScoreVal}
                  onChange={(e) => setQuickScoreVal(Number(e.target.value))}
                  className="w-16 py-1 px-2 border border-stone-300 dark:border-stone-700 rounded text-center bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </label>

              <button
                type="button"
                onClick={() => handleQuickFillEmpty(15, quickScoreVal)}
                className="px-3 py-1 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200 font-medium cursor-pointer shadow-2xs"
              >
                Isi s.d. Az-Zalzalah (#16)
              </button>

              <button
                type="button"
                onClick={() => handleQuickFillEmpty(22, quickScoreVal)}
                className="px-3 py-1 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200 font-medium cursor-pointer shadow-2xs"
              >
                Isi s.d. Al-Lail (#23)
              </button>

              <button
                type="button"
                onClick={() => handleQuickFillEmpty(surahList.length - 1, quickScoreVal)}
                className="px-3 py-1 bg-emerald-800 text-white rounded-lg font-medium hover:bg-emerald-700 cursor-pointer shadow-2xs"
              >
                Isi Semua 37 Surat
              </button>
            </div>
          </div>
        )}

        {/* Live Score Strip Ribbon */}
        <div className="mt-6 pt-5 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center gap-4 sm:gap-8">
          <div>
            <div className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 tracking-wider">Tajwid</div>
            <div className="text-xl sm:text-2xl font-display font-bold text-stone-900 dark:text-stone-100 tabular-nums">
              {formatScore(calc.t)}
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 tracking-wider">Makhroj</div>
            <div className="text-xl sm:text-2xl font-display font-bold text-stone-900 dark:text-stone-100 tabular-nums">
              {formatScore(calc.m)}
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 tracking-wider">Kelancaran</div>
            <div className="text-xl sm:text-2xl font-display font-bold text-stone-900 dark:text-stone-100 tabular-nums">
              {formatScore(calc.l)}
            </div>
          </div>

          <div className="pl-4 border-l border-stone-200 dark:border-stone-700">
            <div className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-400 tracking-wider">Nilai Akhir</div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-emerald-900 dark:text-emerald-300 tabular-nums">
              {formatScore(calc.f)}
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 tracking-wider">Predikat</div>
            <div className="mt-0.5">
              <span
                className={`text-sm px-2.5 py-0.5 rounded-md font-bold border ${getPredikatBadgeClass(
                  calc.g
                )}`}
              >
                {calc.g || '–'}
              </span>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 tracking-wider">Surat Dinilai</div>
            <div className="text-xl font-display font-bold text-stone-700 dark:text-stone-200 tabular-nums">
              {calc.n} <span className="text-xs font-normal text-stone-400 dark:text-stone-500">/ 37</span>
            </div>
          </div>
        </div>

        {/* Target Benchmark Strip */}
        {target && (
          <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <Target className="w-3.5 h-3.5" />
              </span>
              <span className="font-semibold text-stone-700 dark:text-stone-300">Target Kurikulum Kelas {activeClass}:</span>
              <span className="text-stone-600 dark:text-stone-400">
                Jilid <strong className="text-stone-900 dark:text-stone-100">{target.targetJilid}</strong> · Hafalan <strong className="text-stone-900 dark:text-stone-100">{target.targetHafalanSurah}</strong> (Min. {target.targetSurahCount} Surat) · KKM <strong className="text-stone-900 dark:text-stone-100">{target.kkmNilai}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 font-medium">
              <span className={`px-2 py-0.5 rounded text-[11px] border ${
                checkTargetAchievement(student, target, surahList).jilidAchieved
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700'
              }`}>
                Jilid: {checkTargetAchievement(student, target, surahList).jilidAchieved ? '✓ Tuntas' : 'Proses'}
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] border ${
                checkTargetAchievement(student, target, surahList).hafalanAchieved
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700'
              }`}>
                Hafalan: {checkTargetAchievement(student, target, surahList).hafalanAchieved ? '✓ Tuntas' : 'Proses'}
              </span>
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                checkTargetAchievement(student, target, surahList).allAchieved
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
              }`}>
                {checkTargetAchievement(student, target, surahList).allAchieved ? 'Target Tercapai' : 'Dalam Proses'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Surah Assessment Table */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="font-display font-bold text-base text-stone-900 dark:text-stone-100">
              Formulir Penilaian 37 Surat (Juz 30)
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Isi nilai Tajwid, Makhroj, dan Kelancaran (skala 0–100). Kosongkan baris untuk surat yang belum diujikan.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Otomatis tersimpan
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 dark:bg-stone-800/80 text-stone-600 dark:text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-200 dark:border-stone-800 font-semibold">
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-4 min-w-[140px]">Nama Surat</th>
                <th className="py-2.5 px-3 text-center w-24">Tajwid</th>
                <th className="py-2.5 px-3 text-center w-24">Makhroj</th>
                <th className="py-2.5 px-3 text-center w-24">Kelancaran</th>
                <th className="py-2.5 px-3 text-center w-20">Nilai</th>
                <th className="py-2.5 px-3 text-center w-16">Pred.</th>
                <th className="py-2.5 px-3 text-center w-12">Hapus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {surahList.map((surahName, idx) => {
                const tuple = student.s[idx] || [null, null, null];
                const avg = getSurahAverage(tuple);
                const pred = getPredikat(avg);
                const hasScore = tuple.some((v) => v !== null);

                return (
                  <tr
                    key={idx}
                    className={`hover:bg-stone-50/70 dark:hover:bg-stone-800/50 transition-colors ${
                      hasScore ? 'bg-white dark:bg-stone-900' : 'bg-stone-50/40 dark:bg-stone-900/50 text-stone-400 dark:text-stone-500'
                    }`}
                  >
                    <td className="py-2 px-3 text-center font-mono text-stone-400 dark:text-stone-500">
                      {idx + 1}
                    </td>
                    <td className={`py-2 px-4 font-semibold ${hasScore ? 'text-stone-900 dark:text-stone-100' : 'text-stone-500 dark:text-stone-400'}`}>
                      {surahName}
                    </td>

                    {/* Tajwid */}
                    <td className="py-2 px-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        placeholder="–"
                        value={tuple[0] !== null ? tuple[0] : ''}
                        onChange={(e) => handleScoreChange(idx, 0, e.target.value)}
                        className={`w-18 py-1 px-1.5 text-center text-xs font-semibold tabular-nums rounded border focus:outline-emerald-700 transition-colors ${
                          tuple[0] !== null
                            ? 'bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-600 text-stone-900 dark:text-stone-100'
                            : 'bg-stone-100/70 dark:bg-stone-800/50 border-stone-200 dark:border-stone-700/80 text-stone-400 dark:text-stone-500'
                        }`}
                      />
                    </td>

                    {/* Makhroj */}
                    <td className="py-2 px-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        placeholder="–"
                        value={tuple[1] !== null ? tuple[1] : ''}
                        onChange={(e) => handleScoreChange(idx, 1, e.target.value)}
                        className={`w-18 py-1 px-1.5 text-center text-xs font-semibold tabular-nums rounded border focus:outline-emerald-700 transition-colors ${
                          tuple[1] !== null
                            ? 'bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-600 text-stone-900 dark:text-stone-100'
                            : 'bg-stone-100/70 dark:bg-stone-800/50 border-stone-200 dark:border-stone-700/80 text-stone-400 dark:text-stone-500'
                        }`}
                      />
                    </td>

                    {/* Kelancaran */}
                    <td className="py-2 px-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        placeholder="–"
                        value={tuple[2] !== null ? tuple[2] : ''}
                        onChange={(e) => handleScoreChange(idx, 2, e.target.value)}
                        className={`w-18 py-1 px-1.5 text-center text-xs font-semibold tabular-nums rounded border focus:outline-emerald-700 transition-colors ${
                          tuple[2] !== null
                            ? 'bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-600 text-stone-900 dark:text-stone-100'
                            : 'bg-stone-100/70 dark:bg-stone-800/50 border-stone-200 dark:border-stone-700/80 text-stone-400 dark:text-stone-500'
                        }`}
                      />
                    </td>

                    {/* Average */}
                    <td className="py-2 px-3 text-center tabular-nums font-bold text-stone-900 dark:text-stone-100">
                      {formatScore(avg)}
                    </td>

                    {/* Predikat */}
                    <td className="py-2 px-3 text-center">
                      {pred ? (
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border ${getPredikatBadgeClass(
                            pred
                          )}`}
                        >
                          {pred}
                        </span>
                      ) : (
                        <span className="text-stone-300 dark:text-stone-600">–</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-2 px-3 text-center">
                      {hasScore && (
                        <button
                          type="button"
                          onClick={() => handleClearSurah(idx)}
                          title="Hapus Nilai Surat Ini"
                          className="p-1 text-stone-400 dark:text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
