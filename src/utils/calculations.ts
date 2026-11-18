import { Student, StudentCalc, ClassStats, Predikat, ScoreTuple } from '../types';

export const mean = (arr: number[]): number => {
  if (!arr.length) return 0;
  return arr.reduce((acc, v) => acc + v, 0) / arr.length;
};

export function getPredikat(score: number | null): Predikat | null {
  if (score === null || isNaN(score)) return null;
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'E';
}

export function formatScore(val: number | null, decimals: number = 1): string {
  if (val === null || isNaN(val)) return '–';
  const factor = Math.pow(10, decimals);
  const rounded = (Math.round(val * factor) / factor).toFixed(decimals);
  return rounded.replace('.', ',');
}

export function getSurahAverage(scores: ScoreTuple | undefined): number | null {
  if (!scores) return null;
  const valid = scores.filter((v): v is number => v !== null && !isNaN(v));
  if (!valid.length) return null;
  return mean(valid);
}

export function calculateStudent(student?: Student | null): StudentCalc {
  if (!student) {
    return { t: null, m: null, l: null, f: null, g: null, n: 0 };
  }

  const scores = student.s || {};
  const keys = Object.keys(scores);
  if (!keys.length) {
    return { t: null, m: null, l: null, f: null, g: null, n: 0 };
  }

  const getAspectAverage = (aspectIdx: 0 | 1 | 2): number | null => {
    const values: number[] = [];
    for (const key of keys) {
      const tuple = scores[key];
      if (tuple && tuple[aspectIdx] !== null && tuple[aspectIdx] !== undefined && !isNaN(tuple[aspectIdx]!)) {
        values.push(tuple[aspectIdx]!);
      }
    }
    return values.length ? mean(values) : null;
  };

  const t = getAspectAverage(0); // Tajwid
  const m = getAspectAverage(1); // Makhroj
  const l = getAspectAverage(2); // Kelancaran

  const aspects = [t, m, l].filter((v): v is number => v !== null);
  const f = aspects.length ? mean(aspects) : null;
  const g = getPredikat(f);

  return {
    t,
    m,
    l,
    f,
    g,
    n: keys.length
  };
}

export function calculateClassStats(students: Student[]): ClassStats {
  const rows = students.map((student) => ({
    student,
    calc: calculateStudent(student)
  }));

  const assessedRows = rows.filter((r) => r.calc.f !== null);
  const finalScores = assessedRows.map((r) => r.calc.f as number);

  const avg = finalScores.length ? mean(finalScores) : null;

  const topStudent = assessedRows.length
    ? assessedRows.reduce((prev, curr) => (curr.calc.f! > prev.calc.f! ? curr : prev))
    : null;

  const lowStudents = assessedRows
    .filter((r) => r.calc.f! < 80)
    .sort((a, b) => a.calc.f! - b.calc.f!);

  const distribution: Record<Predikat, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  assessedRows.forEach((r) => {
    if (r.calc.g) {
      distribution[r.calc.g]++;
    }
  });

  const aspectConfigs: { lab: string; key: 't' | 'm' | 'l' | 'f' }[] = [
    { lab: 'Tajwid', key: 't' },
    { lab: 'Makhroj', key: 'm' },
    { lab: 'Kelancaran', key: 'l' },
    { lab: 'Nilai Akhir', key: 'f' }
  ];

  const aspects = aspectConfigs.map(({ lab, key }) => {
    const vals = assessedRows
      .map((r) => r.calc[key])
      .filter((v): v is number => v !== null);

    return {
      lab,
      key,
      min: vals.length ? Math.min(...vals) : 0,
      max: vals.length ? Math.max(...vals) : 0,
      avg: vals.length ? mean(vals) : 0
    };
  });

  return {
    n: students.length,
    assessedCount: assessedRows.length,
    avg,
    rows,
    topStudent,
    lowStudents,
    distribution,
    aspects
  };
}

export function getPredikatBadgeClass(g: Predikat | null): string {
  switch (g) {
    case 'A':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800';
    case 'B':
      return 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800';
    case 'C':
      return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800';
    case 'D':
      return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/70 dark:text-orange-300 dark:border-orange-800';
    case 'E':
      return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800';
    default:
      return 'bg-stone-100 text-stone-500 border-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700';
  }
}

export function findSurahIndex(input: string | undefined, surahList: string[]): number {
  if (!input || !input.trim()) return -1;
  const raw = input.trim().toLowerCase();

  // 1. Direct exact or lowercase match
  const exact = surahList.findIndex((s) => s.toLowerCase() === raw);
  if (exact !== -1) return exact;

  // 2. Normalized alphanumeric (stripping hyphens, spaces, apostrophes)
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanInput = norm(raw);
  if (!cleanInput) return -1;

  const normMatch = surahList.findIndex((s) => norm(s) === cleanInput);
  if (normMatch !== -1) return normMatch;

  // 3. Match without Arabic article (al-, an-, at-, as-, az-, etc.)
  const stripArticle = (s: string) => norm(s).replace(/^(al|an|at|as|az|ad|ar)/, '');
  const strippedInput = stripArticle(raw);
  if (strippedInput.length >= 3) {
    const articleMatch = surahList.findIndex((s) => stripArticle(s) === strippedInput);
    if (articleMatch !== -1) return articleMatch;
  }

  // 4. StartsWith match
  const prefixMatch = surahList.findIndex((s) => {
    const ns = norm(s);
    return ns.startsWith(cleanInput) || (cleanInput.length >= 4 && cleanInput.startsWith(ns));
  });
  if (prefixMatch !== -1) return prefixMatch;

  return -1;
}

export function getSurahTargetCount(surahName: string | undefined, surahList: string[]): number | null {
  const idx = findSurahIndex(surahName, surahList);
  return idx >= 0 ? idx + 1 : null;
}

export function checkTargetAchievement(
  student: Student,
  target?: {
    targetJilid: string;
    targetHafalanSurah: string;
    targetSurahCount: number;
    kkmNilai: number;
  },
  surahList?: string[]
): {
  jilidAchieved: boolean;
  hafalanAchieved: boolean;
  nilaiAchieved: boolean;
  allAchieved: boolean;
} {
  if (!target) {
    return { jilidAchieved: true, hafalanAchieved: true, nilaiAchieved: true, allAchieved: true };
  }

  const getJilidRank = (rawJilid?: string): number => {
    const val = (rawJilid || '').trim().toLowerCase();
    if (!val || val === '-') return 0;
    if (val === 'jilid dasar' || val === 'dasar') return 1;
    if (val === 'jilid i' || val === 'jilid 1') return 2;
    if (val === 'jilid ii' || val === 'jilid 2') return 3;
    if (val === 'jilid iii' || val === 'jilid 3') return 4;
    if (val === 'jilid iv' || val === 'jilid 4') return 5;
    if (val === 'jilid v' || val === 'jilid 5') return 6;
    if (val === 'jilid vi' || val === 'jilid 6') return 6;
    if (val === "al-qur'an" || val === 'alquran' || val === "al-qur’an") return 7;
    return 0;
  };

  const studentJilidIdx = getJilidRank(student.jilid);
  const targetJilidIdx = getJilidRank(target.targetJilid);
  const jilidAchieved = targetJilidIdx <= 0 || (studentJilidIdx >= targetJilidIdx && studentJilidIdx > 0);

  // Hafalan check
  let hafalanAchieved = false;
  const assessedCount = Object.keys(student.s || {}).length;
  if (assessedCount >= target.targetSurahCount) {
    hafalanAchieved = true;
  } else if (surahList && student.hafalan) {
    const studentSurahIdx = findSurahIndex(student.hafalan, surahList);
    const targetSurahIdx = findSurahIndex(target.targetHafalanSurah, surahList);
    if (studentSurahIdx >= 0 && targetSurahIdx >= 0) {
      hafalanAchieved = studentSurahIdx >= targetSurahIdx;
    }
  }

  // Nilai check
  const calc = calculateStudent(student);
  const nilaiAchieved = calc.f !== null ? calc.f >= target.kkmNilai : false;

  return {
    jilidAchieved,
    hafalanAchieved,
    nilaiAchieved,
    allAchieved: jilidAchieved && hafalanAchieved
  };
}

