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

export function downloadStudentImportTemplate(): void {
  const headers = ['Nama Siswa', 'NISN', 'Jenis Kelamin (L/P)', 'Orang Tua', 'Jilid', 'Hafalan Terakhir'];
  const sampleRows = [
    ['MUHAMMAD FARHAN', '3170981234', 'L', 'SUKIRNO', 'Jilid III', "Al-A'la"],
    ['AISYAH NURUL JANNAH', '3170985678', 'P', 'H. AHMAD', 'Jilid II', 'Adh-Dhuha']
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
  a.download = `Template_Upload_Siswa_Tahassus.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseStudentsFromText(rawText: string): Omit<Student, 'id' | 's'>[] {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return [];

  const results: Omit<Student, 'id' | 's'>[] = [];

  for (const line of lines) {
    // Check delimiter: tab, semicolon, or comma
    let delimiter = ',';
    if (line.includes('\t')) {
      delimiter = '\t';
    } else if (line.includes(';')) {
      delimiter = ';';
    }

    // Split considering possible quotes
    const regex = new RegExp(`(?:^|${delimiter})(?:"([^"]*(?:""[^"]*)*)"|([^"${delimiter}]*))`, 'g');
    const cols: string[] = [];
    let match;
    while ((match = regex.exec(line)) !== null) {
      let val = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
      cols.push((val || '').trim());
    }

    if (!cols.length) continue;

    // Skip header row if contains 'nama' or 'nisn'
    const firstCol = cols[0].toLowerCase();
    if (firstCol.includes('nama') || firstCol === 'no' || firstCol === 'nisn') {
      continue;
    }

    // Identify columns:
    // Pattern 1: No, Nama, NISN, JK, Ortu, Jilid, Hafalan
    // Pattern 2: Nama, NISN, JK, Ortu, Jilid, Hafalan
    let nama = '';
    let nisn = '-';
    let jk: 'L' | 'P' = 'L';
    let ortu = '-';
    let jilid = '';
    let hafalan = '';

    const isFirstColNumber = /^\d+$/.test(cols[0]) && cols.length > 2;
    const offset = isFirstColNumber ? 1 : 0;

    nama = cols[offset] || '';
    if (!nama) continue;

    nisn = cols[offset + 1] || '-';

    const rawJk = (cols[offset + 2] || '').toUpperCase();
    if (rawJk.startsWith('P') || rawJk === 'PEREMPUAN') {
      jk = 'P';
    } else {
      jk = 'L';
    }

    ortu = cols[offset + 3] || '-';
    jilid = cols[offset + 4] || '';
    hafalan = cols[offset + 5] || '';

    results.push({
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
