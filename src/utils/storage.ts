import { AppState, Student } from '../types';
import { SEED_DATA } from '../data/seedData';
import { calculateStudent, formatScore } from './calculations';

const STORAGE_KEY = 'raport-tahassus-mi-syuriyah-v3';

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('raport-tahassus-mi-syuriyah-v2');
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppState>;
      if (parsed && parsed.school && Array.isArray(parsed.surah)) {
        const classes: Record<string, Student[]> = {
          '1': parsed.classes?.['1'] || SEED_DATA.classes['1'] || [],
          '2': parsed.classes?.['2'] || SEED_DATA.classes['2'] || [],
          '3': parsed.classes?.['3'] || SEED_DATA.classes['3'] || [],
          '4': parsed.classes?.['4'] || SEED_DATA.classes['4'] || [],
          '5': parsed.classes?.['5'] || SEED_DATA.classes['5'] || [],
          '6': parsed.classes?.['6'] || SEED_DATA.classes['6'] || []
        };

        // Ensure student ids & normalize legacy Jilid VI
        Object.values(classes).forEach((arr) => {
          arr.forEach((s, idx) => {
            if (!s.id) {
              s.id = `std_${Date.now()}_${idx}`;
            }
            if (!s.s) {
              s.s = {};
            }
            if (s.jilid === 'Jilid VI') {
              s.jilid = 'Jilid V';
            }
          });
        });

        // Upgrade untouched legacy default targets to Jilid Dasar .. Jilid V
        let resolvedTargets = SEED_DATA.targets;
        if (parsed.targets) {
          const isLegacyDefault =
            parsed.targets['1']?.targetJilid === 'Jilid I' &&
            parsed.targets['2']?.targetJilid === 'Jilid II' &&
            parsed.targets['3']?.targetJilid === 'Jilid III' &&
            parsed.targets['4']?.targetJilid === 'Jilid III' &&
            parsed.targets['5']?.targetJilid === 'Jilid IV' &&
            parsed.targets['6']?.targetJilid === "Al-Qur'an";

          if (isLegacyDefault) {
            resolvedTargets = JSON.parse(JSON.stringify(SEED_DATA.targets));
          } else {
            resolvedTargets = { ...SEED_DATA.targets, ...parsed.targets };
            Object.keys(resolvedTargets).forEach((cls) => {
              if (resolvedTargets![cls]?.targetJilid === 'Jilid VI') {
                resolvedTargets![cls] = {
                  ...resolvedTargets![cls],
                  targetJilid: 'Jilid V'
                };
              }
            });
          }
        }

        return {
          school: parsed.school,
          classes,
          surah: parsed.surah,
          journal: Array.isArray(parsed.journal) ? parsed.journal : SEED_DATA.journal,
          attendance: Array.isArray(parsed.attendance) ? parsed.attendance : SEED_DATA.attendance,
          targets: resolvedTargets
        };
      }
    }
  } catch (err) {
    console.error('Failed to load saved state:', err);
  }

  // Clone seed data
  return JSON.parse(JSON.stringify(SEED_DATA));
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

export function exportClassToCsv(students: Student[], className: string): void {
  const headers = [
    'No',
    'NISN',
    'Nama Siswa',
    'L/P',
    'Orang Tua',
    'Jilid',
    'Hafalan Terakhir',
    'Surat Dinilai',
    'Tajwid',
    'Makhroj',
    'Kelancaran',
    'Nilai Akhir',
    'Predikat'
  ];

  const rows = students.map((s, idx) => {
    const calc = calculateStudent(s);
    return [
      idx + 1,
      `"${s.nisn || '-'}"`,
      `"${s.nama.replace(/"/g, '""')}"`,
      s.jk,
      `"${(s.ortu || '-').replace(/"/g, '""')}"`,
      `"${s.jilid || '-'}"`,
      `"${s.hafalan || '-'}"`,
      `${calc.n}/37`,
      formatScore(calc.t),
      formatScore(calc.m),
      formatScore(calc.l),
      formatScore(calc.f),
      calc.g || '-'
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Rekap_Nilai_Tahassus_Kelas_${className}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

import { DEFAULT_CLASS_TARGETS } from '../data/seedData';

export interface ParsedImportStudent extends Omit<Student, 'id' | 's'> {
  targetClass?: string;
}

export function downloadStudentTemplatePerClass(className: string = '4'): void {
  const target = DEFAULT_CLASS_TARGETS[className] || DEFAULT_CLASS_TARGETS['4'];
  const sampleJilid = target?.targetJilid || 'Jilid Dasar';
  const sampleSurah = target?.targetHafalanSurah || 'An-Nas';

  const headers = ['No', 'Nama Siswa', 'NISN', 'Jenis Kelamin (L/P)', 'Orang Tua', 'Jilid', 'Hafalan Terakhir'];
  const sampleRows: string[][] = [
    ['1', 'MUHAMMAD FARHAN', '3170981234', 'L', 'SUKIRNO', sampleJilid, sampleSurah],
    ['2', 'AISYAH NURUL JANNAH', '3170985678', 'P', 'H. AHMAD', sampleJilid, sampleSurah],
    // 8 baris kosong bernomor siap diisi di Excel
    ...Array.from({ length: 8 }, (_, idx) => [String(idx + 3), '', '', '', '', '', ''])
  ];

  const csvContent =
    '\uFEFF' +
    [
      headers.join(','),
      ...sampleRows.map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Template_Input_Siswa_Kelas_${className}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadStudentTemplateMassal(): void {
  const headers = ['No', 'Kelas (1-6)', 'Nama Siswa', 'NISN', 'Jenis Kelamin (L/P)', 'Orang Tua', 'Jilid', 'Hafalan Terakhir'];
  const sampleRows: string[][] = [
    ['1', '1', 'AHMAD ZAKI AL-FATIH', '3170100001', 'L', 'BUDI SANTOSO', 'Jilid Dasar', 'An-Nas'],
    ['2', '1', 'ZAHRA KHAIRUNNISA', '3170100002', 'P', 'HENDRA', 'Jilid Dasar', 'Al-Ikhlas'],
    ['3', '2', 'MUHAMMAD RIZQI', '3170200001', 'L', 'SULAIMAN', 'Jilid I', 'Al-Maun'],
    ['4', '3', 'SITI FATIMAH', '3170300001', 'P', 'MUHAMMAD ALI', 'Jilid II', 'Al-Qoriah'],
    ['5', '4', 'ABDULLAH FAQIH', '3170400001', 'L', 'H. MUNAWAR', 'Jilid III', "Al-A'la"],
    ['6', '5', 'NAILA SYARIFAH', '3170500001', 'P', 'AHMAD FAUZI', 'Jilid IV', 'Al-Muthaffifin'],
    ['7', '6', 'HANIF AL-GHIFFARI', '3170600001', 'L', 'SYAMSUDIN', 'Jilid V', 'An-Naba'],
    // Tambahan baris kosong siap isi per kelas 1-6
    ['8', '1', '', '', '', '', '', ''],
    ['9', '2', '', '', '', '', '', ''],
    ['10', '3', '', '', '', '', '', ''],
    ['11', '4', '', '', '', '', '', ''],
    ['12', '5', '', '', '', '', '', ''],
    ['13', '6', '', '', '', '', '', '']
  ];

  const csvContent =
    '\uFEFF' +
    [
      headers.join(','),
      ...sampleRows.map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Template_Input_Siswa_Massal_Kelas_1-6.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadStudentImportTemplate(className?: string): void {
  downloadStudentTemplatePerClass(className || '4');
}

function normalizeClassValue(raw?: string): string | undefined {
  const val = (raw || '').trim().toUpperCase();
  if (!val) return undefined;
  const cleaned = val.replace(/^KELAS\s*/i, '').replace(/^KLS\s*/i, '').trim();
  if (['1', '2', '3', '4', '5', '6'].includes(cleaned)) return cleaned;
  const romanMap: Record<string, string> = {
    I: '1',
    II: '2',
    III: '3',
    IV: '4',
    V: '5',
    VI: '6'
  };
  return romanMap[cleaned];
}

function normalizeJilidValue(raw?: string): string {
  const val = (raw || '').trim();
  if (!val) return '';
  const low = val.toLowerCase();
  if (low === 'jilid dasar' || low === 'dasar') return 'Jilid Dasar';
  if (low === 'jilid i' || low === 'jilid 1' || low === 'i' || low === '1') return 'Jilid I';
  if (low === 'jilid ii' || low === 'jilid 2' || low === 'ii' || low === '2') return 'Jilid II';
  if (low === 'jilid iii' || low === 'jilid 3' || low === 'iii' || low === '3') return 'Jilid III';
  if (low === 'jilid iv' || low === 'jilid 4' || low === 'iv' || low === '4') return 'Jilid IV';
  if (low === 'jilid v' || low === 'jilid 5' || low === 'v' || low === '5') return 'Jilid V';
  if (low === 'jilid vi' || low === 'jilid 6') return 'Jilid V';
  if (low === "al-qur'an" || low === 'alquran' || low === 'al quran' || low === "al-qur’an") return "Al-Qur'an";
  return val;
}

function splitCsvLine(line: string): string[] {
  let delimiter = ',';
  if (line.includes('\t')) {
    delimiter = '\t';
  } else if (line.includes(';')) {
    delimiter = ';';
  }

  const regex = new RegExp(`(?:^|${delimiter})(?:"([^"]*(?:""[^"]*)*)"|([^"${delimiter}]*))`, 'g');
  const cols: string[] = [];
  let match;
  while ((match = regex.exec(line)) !== null) {
    // Prevent infinite loop on empty matches
    if (match.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    const val = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
    cols.push((val || '').trim());
  }
  return cols;
}

export function parseStudentsFromText(rawText: string): ParsedImportStudent[] {
  const cleanText = rawText.replace(/^\uFEFF/, '');
  const lines = cleanText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return [];

  const results: ParsedImportStudent[] = [];

  interface HeaderColumnMap {
    kelas?: number;
    nama?: number;
    nisn?: number;
    jk?: number;
    ortu?: number;
    jilid?: number;
    hafalan?: number;
  }

  // Optional header column mapping
  let headerMap: HeaderColumnMap | null = null;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const cols = splitCsvLine(lines[lineIdx]);
    if (!cols.length) continue;

    // Detect header row
    const lowerCols = cols.map((c) => c.toLowerCase());
    const hasHeaderKeyword = lowerCols.some(
      (c) => c.includes('nama') || c === 'nisn' || c.startsWith('kelas') || c === 'no'
    );

    if (hasHeaderKeyword) {
      const map: HeaderColumnMap = {};
      lowerCols.forEach((h, i) => {
        if (h.includes('kelas') || h === 'kls') map.kelas = i;
        else if (h.includes('nama')) map.nama = i;
        else if (h.includes('nisn') || h === 'nis') map.nisn = i;
        else if (h.includes('kelamin') || h === 'jk' || h.includes('l/p')) map.jk = i;
        else if (h.includes('orang tua') || h.includes('ortu') || h.includes('wali')) map.ortu = i;
        else if (h.includes('jilid')) map.jilid = i;
        else if (h.includes('hafalan') || h.includes('surat') || h.includes('surah')) map.hafalan = i;
      });
      if (map.nama !== undefined) {
        headerMap = map;
      }
      continue;
    }

    let targetClass: string | undefined;
    let nama = '';
    let nisn = '-';
    let jk: 'L' | 'P' = 'L';
    let ortu = '-';
    let jilid = '';
    let hafalan = '';

    if (headerMap && headerMap.nama !== undefined) {
      targetClass = headerMap.kelas !== undefined ? normalizeClassValue(cols[headerMap.kelas]) : undefined;
      nama = (cols[headerMap.nama] || '').trim();
      nisn = headerMap.nisn !== undefined ? cols[headerMap.nisn] || '-' : '-';
      const rawJk = (headerMap.jk !== undefined ? cols[headerMap.jk] || '' : '').toUpperCase();
      jk = rawJk.startsWith('P') || rawJk === 'PEREMPUAN' ? 'P' : 'L';
      ortu = headerMap.ortu !== undefined ? cols[headerMap.ortu] || '-' : '-';
      jilid = headerMap.jilid !== undefined ? normalizeJilidValue(cols[headerMap.jilid]) : '';
      hafalan = headerMap.hafalan !== undefined ? cols[headerMap.hafalan] || '' : '';
    } else {
      // Headerless heuristic:
      // Pattern 1 (Massal with No): No, Kelas, Nama, NISN, JK, Ortu, Jilid, Hafalan
      // Pattern 2 (Massal no No): Kelas, Nama, NISN, JK, Ortu, Jilid, Hafalan
      // Pattern 3 (Per-kelas with No): No, Nama, NISN, JK, Ortu, Jilid, Hafalan
      // Pattern 4 (Per-kelas no No): Nama, NISN, JK, Ortu, Jilid, Hafalan
      const isCol0Number = /^\d+$/.test(cols[0]);
      const col1Class = normalizeClassValue(cols[1]);
      const col0Class = normalizeClassValue(cols[0]);
      const hasLetters = (s?: string) => Boolean(s && /[A-Za-z]/.test(s));

      let offset = 0;
      if (isCol0Number && col1Class && hasLetters(cols[2]) && cols.length >= 6) {
        targetClass = col1Class;
        offset = 2;
      } else if (col0Class && hasLetters(cols[1]) && cols.length >= 6 && !/^\d{5,}$/.test(cols[1] || '')) {
        targetClass = col0Class;
        offset = 1;
      } else if (isCol0Number && cols.length > 2) {
        offset = 1;
      }

      nama = (cols[offset] || '').trim();
      nisn = cols[offset + 1] || '-';
      const rawJk = (cols[offset + 2] || '').toUpperCase();
      jk = rawJk.startsWith('P') || rawJk === 'PEREMPUAN' ? 'P' : 'L';
      ortu = cols[offset + 3] || '-';
      jilid = normalizeJilidValue(cols[offset + 4]);
      hafalan = cols[offset + 5] || '';
    }

    // Skip blank or numeric-only placeholder names
    if (!nama || /^\d+$/.test(nama)) continue;

    results.push({
      targetClass,
      nama: nama.toUpperCase(),
      nisn: nisn || '-',
      jk,
      ortu: ortu || '-',
      jilid: jilid || '',
      hafalan: hafalan || ''
    });
  }

  return results;
}

export function downloadJsonBackup(state: AppState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Backup_Raport_Tahassus_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
