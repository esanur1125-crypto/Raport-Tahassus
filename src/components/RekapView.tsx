import React, { useState, useMemo } from 'react';
import { Student, SchoolInfo, ClassTarget } from '../types';
import { calculateClassStats, formatScore, getPredikatBadgeClass, checkTargetAchievement } from '../utils/calculations';
import { exportClassToCsv } from '../utils/storage';
import {
  Users,
  Award,
  TrendingUp,
  AlertCircle,
  Download,
  Search,
  ArrowUpDown,
  FileText,
  SlidersHorizontal,
  Printer,
  Target,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface RekapViewProps {
  students: Student[];
  school: SchoolInfo;
  surahList: string[];
  activeClass: string;
  allClasses: Record<string, Student[]>;
  target?: ClassTarget;
  onSelectStudent: (studentId: string, targetTab: 'raport' | 'nilai') => void;
  onSwitchClass: (className: string) => void;
  onPrintLeger?: () => void;
}

export const RekapView: React.FC<RekapViewProps> = ({
  students,
  activeClass,
  allClasses,
  target,
  surahList,
  onSelectStudent,
  onSwitchClass,
  onPrintLeger
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'nilai' | 'nama' | 'hafalan'>('nilai');
  const [filterJilid, setFilterJilid] = useState<string>('all');

  const stats = useMemo(() => calculateClassStats(students), [students]);

  // Target statistics for active class
  const targetStats = useMemo(() => {
    let tuntasCount = 0;
    let jilidTuntasCount = 0;
    let hafalanTuntasCount = 0;
    students.forEach((s) => {
      const ach = checkTargetAchievement(s, target, surahList);
      if (ach.allAchieved) tuntasCount++;
      if (ach.jilidAchieved) jilidTuntasCount++;
      if (ach.hafalanAchieved) hafalanTuntasCount++;
    });
    return {
      tuntasCount,
      tuntasPct: students.length ? Math.round((tuntasCount / students.length) * 100) : 0,
      jilidTuntasCount,
      hafalanTuntasCount
    };
  }, [students, target, surahList]);

  // Unique jilids for filtering
  const jilidOptions = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.jilid) set.add(s.jilid);
    });
    return Array.from(set).sort();
  }, [students]);

  // Filtered and sorted student rows
  const filteredRows = useMemo(() => {
    const q = (searchQuery || '').toLowerCase().trim();
    return stats.rows
      .filter(({ student }) => {
        const nama = (student.nama || '').toLowerCase();
        const nisn = (student.nisn || '').toLowerCase();
        const matchQuery = nama.includes(q) || nisn.includes(q);
        const matchJilid = filterJilid === 'all' || student.jilid === filterJilid;
        return matchQuery && matchJilid;
      })
      .sort((a, b) => {
        if (sortBy === 'nama') {
          return (a.student.nama || '').localeCompare(b.student.nama || '');
        }
        if (sortBy === 'hafalan') {
          return (b.calc.n || 0) - (a.calc.n || 0) || (b.calc.f || 0) - (a.calc.f || 0);
        }
        // sort by nilai
        return (b.calc.f || 0) - (a.calc.f || 0);
      });
  }, [stats.rows, searchQuery, sortBy, filterJilid]);

  if (!students.length) {
    return (
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-12 text-center text-stone-500 dark:text-stone-400">
        Belum ada data siswa di Kelas {activeClass}. Tambahkan siswa di tab Data Siswa.
      </div>
    );
  }

  // Calculate comparative statistics for classes 1 to 6
  const classComparisons = ['1', '2', '3', '4', '5', '6'].map((cls) => {
    const cStats = calculateClassStats(allClasses[cls] || []);
    return {
      className: cls,
      count: (allClasses[cls] || []).length,
      avg: cStats.avg
    };
  });

  const maxDist = Math.max(1, ...Object.values(stats.distribution));

  return (
    <div className="space-y-6">
      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Siswa Dinilai */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Siswa Dinilai</span>
            <Users className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-display font-bold text-stone-900 dark:text-stone-100 tabular-nums">
              {stats.assessedCount}
              <span className="text-base font-normal text-stone-500 dark:text-stone-400 font-sans ml-1">
                / {stats.n}
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              {Math.round((stats.assessedCount / (stats.n || 1)) * 100)}% selesai dinilai
            </p>
          </div>
        </div>

        {/* Rata-Rata Kelas */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Rata-Rata Kelas</span>
            <TrendingUp className="w-4 h-4 text-sky-700 dark:text-sky-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-display font-bold text-stone-900 dark:text-stone-100 tabular-nums">
              {formatScore(stats.avg)}
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Predikat {stats.avg !== null ? (stats.avg >= 80 ? 'B (Baik)' : 'C (Cukup)') : '–'}
            </p>
          </div>
        </div>

        {/* Nilai Tertinggi */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Nilai Tertinggi</span>
            <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-display font-bold text-stone-900 dark:text-stone-100 tabular-nums">
              {stats.topStudent ? formatScore(stats.topStudent.calc.f) : '–'}
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 truncate mt-1 font-medium" title={stats.topStudent?.student.nama}>
              {stats.topStudent ? stats.topStudent.student.nama : 'Belum ada nilai'}
            </p>
          </div>
        </div>

        {/* Perlu Perhatian (< 80) */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Di Bawah 80</span>
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-display font-bold text-stone-900 dark:text-stone-100 tabular-nums">
              {stats.lowStudents.length}
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Perlu pengayaan & bimbingan hafalan
            </p>
          </div>
        </div>
      </div>

      {/* Target Kurikulum Banner */}
      {target && (
        <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-2xl p-5 shadow-xs border border-emerald-800/60">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-800/80 rounded-lg text-emerald-200">
                  <Target className="w-4 h-4" />
                </span>
                <h3 className="font-display font-bold text-base text-white">
                  Target Kurikulum Kelas {activeClass}
                </h3>
                <span className="text-[11px] bg-emerald-800/90 text-emerald-100 px-2 py-0.5 rounded-full font-semibold border border-emerald-700/50">
                  KKM: {target.kkmNilai}
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 leading-relaxed max-w-2xl">
                {target.keterangan || 'Target capaian pembelajaran tahassus semester ini.'}
              </p>
            </div>

            {/* Target Badges & Completion Bar */}
            <div className="flex flex-wrap items-center gap-4 lg:gap-6 bg-black/20 backdrop-blur-xs px-4 py-3 rounded-xl border border-emerald-700/30">
              <div>
                <div className="text-[10px] uppercase font-bold text-emerald-300/80 tracking-wider">Target Jilid</div>
                <div className="text-sm font-bold text-white mt-0.5">{target.targetJilid || '–'}</div>
              </div>

              <div className="h-8 w-[1px] bg-emerald-700/50 hidden sm:block" />

              <div>
                <div className="text-[10px] uppercase font-bold text-emerald-300/80 tracking-wider">Target Hafalan</div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {target.targetHafalanSurah} <span className="text-xs font-normal text-emerald-200">({target.targetSurahCount} Surat)</span>
                </div>
              </div>

              <div className="h-8 w-[1px] bg-emerald-700/50 hidden sm:block" />

              <div className="min-w-[140px]">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-emerald-300/80 tracking-wider mb-1">
                  <span>Ketuntasan Target</span>
                  <span className="text-white font-mono">{targetStats.tuntasCount}/{students.length} ({targetStats.tuntasPct}%)</span>
                </div>
                <div className="w-full h-2 bg-emerald-950/80 rounded-full overflow-hidden border border-emerald-700/40">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${targetStats.tuntasPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2-Column Analytic Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sebaran Predikat */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-bold text-base text-stone-900 dark:text-stone-100">
                Sebaran Predikat Kelas {activeClass}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">Distribusi nilai capaian siswa</p>
            </div>
            <span className="text-xs text-stone-400 dark:text-stone-500 font-mono">Total {stats.assessedCount}</span>
          </div>

          <div className="space-y-2.5">
            {(['A', 'B', 'C', 'D', 'E'] as const).map((grade) => {
              const count = stats.distribution[grade] || 0;
              const pct = (count / maxDist) * 100;
              return (
                <div key={grade} className="grid grid-cols-[40px_1fr_40px] items-center gap-3 text-xs">
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-center border ${getPredikatBadgeClass(
                      grade
                    )}`}
                  >
                    {grade}
                  </span>
                  <div className="h-4 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        grade === 'A'
                          ? 'bg-emerald-600'
                          : grade === 'B'
                          ? 'bg-sky-600'
                          : grade === 'C'
                          ? 'bg-amber-500'
                          : grade === 'D'
                          ? 'bg-orange-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="tabular-nums font-semibold text-right text-stone-700 dark:text-stone-300">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
            A ≥ 90 (Sangat Baik) · B 80–89 (Baik) · C 70–79 (Cukup) · D 60–69 · E &lt; 60
          </p>
        </div>

        {/* Rentang Nilai per Aspek */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-bold text-base text-stone-900 dark:text-stone-100">
                Rentang Nilai per Aspek
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Titik = Rata-rata · Rentang garis = Terendah s.d. Tertinggi
              </p>
            </div>
            <SlidersHorizontal className="w-4 h-4 text-stone-400 dark:text-stone-500" />
          </div>

          <div className="space-y-4 pt-1">
            {stats.aspects.map((aspect) => {
              // Scale from 60 to 100
              const pos = (val: number) => Math.max(0, Math.min(100, ((val - 60) / 40) * 100));
              const left = pos(aspect.min);
              const width = Math.max(2, pos(aspect.max) - left);
              const dotPos = pos(aspect.avg);

              return (
                <div key={aspect.lab} className="grid grid-cols-[85px_1fr_45px] items-center gap-3 text-xs">
                  <span className="font-medium text-stone-700 dark:text-stone-300 truncate">{aspect.lab}</span>
                  <div className="relative h-5 flex items-center">
                    {/* Background line */}
                    <div className="w-full h-1 bg-stone-100 dark:bg-stone-800 rounded-full" />
                    {/* Tick markers 70, 80, 90 */}
                    {[70, 80, 90].map((tick) => (
                      <div
                        key={tick}
                        className="absolute h-2 w-[1px] bg-stone-300 dark:bg-stone-600"
                        style={{ left: `${pos(tick)}%` }}
                      />
                    ))}
                    {/* Min to Max Range Band */}
                    <div
                      className="absolute h-2 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-400 dark:border-emerald-600"
                      style={{ left: `${left}%`, width: `${width}%` }}
                    />
                    {/* Average dot */}
                    <div
                      className="absolute w-3.5 h-3.5 -ml-1.5 rounded-full bg-emerald-800 dark:bg-emerald-400 border-2 border-white dark:border-stone-900 shadow-xs"
                      style={{ left: `${dotPos}%` }}
                      title={`Rata-rata: ${formatScore(aspect.avg)} (Min: ${formatScore(
                        aspect.min
                      )}, Max: ${formatScore(aspect.max)})`}
                    />
                  </div>
                  <span className="tabular-nums font-bold text-right text-stone-900 dark:text-stone-100">
                    {formatScore(aspect.avg)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="relative h-4 mt-2 ml-[85px] mr-[45px] text-[10px] text-stone-400 dark:text-stone-500">
            <span className="absolute left-0">60</span>
            <span className="absolute left-[25%] -translate-x-1/2">70</span>
            <span className="absolute left-[50%] -translate-x-1/2">80</span>
            <span className="absolute left-[75%] -translate-x-1/2">90</span>
            <span className="absolute right-0">100</span>
          </div>
        </div>
      </div>

      {/* 2-Column: Perlu Perhatian & Perbandingan Antar Kelas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Siswa Perlu Perhatian */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-base text-stone-900 dark:text-stone-100">
              Siswa Perlu Perhatian (Nilai &lt; 80)
            </h2>
            <span className="text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-0.5 rounded-full font-semibold border border-rose-200 dark:border-rose-800">
              {stats.lowStudents.length} Siswa
            </span>
          </div>

          {stats.lowStudents.length > 0 ? (
            <ul className="divide-y divide-stone-100 dark:divide-stone-800">
              {stats.lowStudents.map(({ student, calc }) => (
                <li
                  key={student.id}
                  className="py-2.5 flex items-center justify-between hover:bg-stone-50/80 dark:hover:bg-stone-800/60 px-2 rounded-lg transition-colors"
                >
                  <div>
                    <button
                      type="button"
                      onClick={() => onSelectStudent(student.id, 'raport')}
                      className="text-left font-semibold text-xs text-emerald-900 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline cursor-pointer"
                    >
                      {student.nama}
                    </button>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                      Hafalan: {student.hafalan || '–'} · {student.jilid || '–'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold tabular-nums text-stone-900 dark:text-stone-100">
                      {formatScore(calc.f)}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getPredikatBadgeClass(
                        calc.g
                      )}`}
                    >
                      {calc.g}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectStudent(student.id, 'nilai')}
                      className="text-[11px] text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/70 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-800 font-medium cursor-pointer"
                    >
                      Nilai
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-stone-500 dark:text-stone-400 italic py-4 text-center">
              Alhamdulillah, seluruh siswa kelas {activeClass} mencapai nilai 80 ke atas.
            </p>
          )}
        </div>

        {/* Perbandingan Antar Kelas */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-base text-stone-900 dark:text-stone-100">
              Perbandingan Antar Kelas MI Syuriyah
            </h2>
            <span className="text-xs text-stone-500 dark:text-stone-400">Kelas 1 – 6</span>
          </div>

          <div className="space-y-3">
            {classComparisons.map((c) => {
              const isCurrent = c.className === activeClass;
              return (
                <div
                  key={c.className}
                  onClick={() => onSwitchClass(c.className)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isCurrent
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 ring-1 ring-emerald-300 dark:ring-emerald-700'
                      : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700/80 hover:bg-stone-100/70 dark:hover:bg-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isCurrent
                          ? 'bg-emerald-800 dark:bg-emerald-700 text-white'
                          : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200'
                      }`}
                    >
                      {c.className}
                    </span>
                    <div>
                      <div className="font-semibold text-xs text-stone-900 dark:text-stone-100">
                        Kelas {c.className} {isCurrent && '(Aktif)'}
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400">{c.count} siswa terdaftar</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold tabular-nums text-stone-900 dark:text-stone-100">
                      {formatScore(c.avg)}
                    </div>
                    <div className="text-[10px] text-stone-500 dark:text-stone-400">
                      {c.avg ? (c.avg >= 80 ? 'Predikat Baik' : 'Predikat Cukup') : '–'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Peringkat & Daftar Siswa Kelas */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-base text-stone-900 dark:text-stone-100">
              Peringkat & Daftar Siswa Kelas {activeClass}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Klik nama siswa untuk membuka raport capaian belajar resmi
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari siswa atau NISN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 rounded-lg focus:outline-emerald-700 w-48 sm:w-56"
              />
            </div>

            {/* Filter Jilid */}
            {jilidOptions.length > 0 && (
              <select
                value={filterJilid}
                onChange={(e) => setFilterJilid(e.target.value)}
                className="py-1.5 px-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-700 dark:text-stone-200 focus:outline-emerald-700"
              >
                <option value="all">Semua Jilid</option>
                {jilidOptions.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            )}

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-lg border border-stone-200 dark:border-stone-700 text-xs font-medium">
              <span className="text-stone-500 dark:text-stone-400 px-1.5 flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3" /> Urut:
              </span>
              <button
                type="button"
                onClick={() => setSortBy('nilai')}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  sortBy === 'nilai'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                Nilai
              </button>
              <button
                type="button"
                onClick={() => setSortBy('nama')}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  sortBy === 'nama'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                Nama
              </button>
              <button
                type="button"
                onClick={() => setSortBy('hafalan')}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  sortBy === 'hafalan'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                Hafalan
              </button>
            </div>

            {/* Print Leger button */}
            {onPrintLeger && (
              <button
                type="button"
                onClick={onPrintLeger}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded-lg transition-colors cursor-pointer shadow-2xs"
                title="Cetak lembar leger rekap nilai A4"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" />
                <span>Cetak Leger (A4)</span>
              </button>
            )}

            {/* Export CSV button */}
            <button
              type="button"
              onClick={() => exportClassToCsv(students, activeClass)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/70 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 dark:bg-stone-800/80 text-stone-600 dark:text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-200 dark:border-stone-800 font-semibold">
                <th className="py-2.5 px-4 w-12 text-center">#</th>
                <th className="py-2.5 px-4">Nama Siswa</th>
                <th className="py-2.5 px-3">NISN</th>
                <th className="py-2.5 px-3">Jilid</th>
                <th className="py-2.5 px-3">Surat Dinilai</th>
                <th className="py-2.5 px-3 text-right">Tajwid</th>
                <th className="py-2.5 px-3 text-right">Makhroj</th>
                <th className="py-2.5 px-3 text-right">Kelancaran</th>
                <th className="py-2.5 px-3 text-right font-bold">Nilai Akhir</th>
                <th className="py-2.5 px-3 text-center">Predikat</th>
                <th className="py-2.5 px-3 text-center">Target Kelas</th>
                <th className="py-2.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredRows.length > 0 ? (
                filteredRows.map(({ student, calc }, index) => {
                  const ach = checkTargetAchievement(student, target, surahList);
                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-stone-50/80 dark:hover:bg-stone-800/50 transition-colors group cursor-pointer"
                      onClick={() => onSelectStudent(student.id, 'raport')}
                    >
                      <td className="py-2.5 px-4 text-center tabular-nums text-stone-400 dark:text-stone-500 font-semibold">
                        {index + 1}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-stone-900 dark:text-stone-100 group-hover:text-emerald-800 dark:group-hover:text-emerald-400">
                        {student.nama}
                      </td>
                      <td className="py-2.5 px-3 text-stone-500 dark:text-stone-400 font-mono text-[11px]">
                        {student.nisn || '–'}
                      </td>
                      <td className="py-2.5 px-3 text-stone-600 dark:text-stone-300">
                        <div className="flex items-center gap-1.5">
                          <span>{student.jilid || '–'}</span>
                          {ach.jilidAchieved && student.jilid && (
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold" title="Mencapai target jilid">✓</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden border border-stone-200 dark:border-stone-700">
                            <div
                              className="h-full bg-emerald-600 rounded-full"
                              style={{ width: `${Math.round((calc.n / 37) * 100)}%` }}
                            />
                          </div>
                          <span className="text-[11px] tabular-nums text-stone-500 dark:text-stone-400 font-medium">
                            {calc.n}/37
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-stone-600 dark:text-stone-300">
                        {formatScore(calc.t)}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-stone-600 dark:text-stone-300">
                        {formatScore(calc.m)}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-stone-600 dark:text-stone-300">
                        {formatScore(calc.l)}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-bold text-stone-900 dark:text-stone-100 text-sm">
                        {formatScore(calc.f)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${getPredikatBadgeClass(
                            calc.g
                          )}`}
                        >
                          {calc.g || '–'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {ach.allAchieved ? (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                            title={`Target Jilid (${target?.targetJilid || '-'}): ${ach.jilidAchieved ? 'Tuntas' : 'Proses'} · Target Hafalan (${target?.targetHafalanSurah || '-'}): ${ach.hafalanAchieved ? 'Tuntas' : 'Proses'}`}
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                            Tuntas
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                            title={`Target Jilid (${target?.targetJilid || '-'}): ${ach.jilidAchieved ? 'Tuntas' : 'Proses'} · Target Hafalan (${target?.targetHafalanSurah || '-'}): ${ach.hafalanAchieved ? 'Tuntas' : 'Proses'}`}
                          >
                            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            Proses
                          </span>
                        )}
                      </td>
                    <td className="py-2.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectStudent(student.id, 'raport')}
                          title="Buka Raport"
                          className="p-1 rounded text-stone-500 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-400 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectStudent(student.id, 'nilai')}
                          title="Input Nilai"
                          className="px-2 py-0.5 text-[11px] rounded font-medium bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/70 border border-emerald-200 dark:border-emerald-800 cursor-pointer"
                        >
                          Input
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={12} className="py-8 text-center text-stone-400 dark:text-stone-500 italic">
                    Tidak ditemukan data siswa yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
