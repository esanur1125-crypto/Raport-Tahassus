export type Predikat = 'A' | 'B' | 'C' | 'D' | 'E';

export interface SchoolInfo {
  nama: string;
  npsn: string;
  nsm: string;
  alamat: string;
  desa: string;
  kec: string;
  kab: string;
  prov: string;
  kepala: string;
  guru: string;
  semester: string;
  tahun: string;
  tanggal: string;
  yayasan: string;
  logoL?: string;
  logoR?: string;
}

export type ScoreTuple = [number | null, number | null, number | null]; // [Tajwid, Makhroj, Kelancaran]

export interface Student {
  id: string;
  nisn: string;
  nama: string;
  jk: 'L' | 'P';
  ortu: string;
  jilid: string;
  hafalan: string;
  s: Record<number | string, ScoreTuple>;
}

export type JournalType = 'ziyadah' | 'murojaah' | 'fashohati';
export type JournalStatus = 'Lancar' | 'Kurang Lancar' | 'Belum Lancar' | 'Mengulang';

export interface JournalEntry {
  id: string;
  studentId: string;
  studentNama: string;
  className: string;
  tanggal: string; // YYYY-MM-DD
  tipe: JournalType;
  surahOrJilid: string;
  ayatOrHalaman: string;
  nilai: number | null;
  status: JournalStatus;
  catatan: string;
  guru: string;
}

export type AttendanceStatus = 'H' | 'I' | 'S' | 'A'; // Hadir, Izin, Sakit, Alpa

export interface AttendanceDay {
  id: string;
  className: string;
  tanggal: string; // YYYY-MM-DD
  records: Record<string, AttendanceStatus>; // studentId -> status
  catatan?: string;
}

export interface ClassTarget {
  targetJilid: string;
  targetHafalanSurah: string;
  targetSurahCount: number;
  kkmNilai: number;
  keterangan?: string;
}

export interface AppState {
  school: SchoolInfo;
  classes: Record<string, Student[]>;
  surah: string[];
  journal: JournalEntry[];
  attendance: AttendanceDay[];
  targets: Record<string, ClassTarget>;
}

export interface StudentCalc {
  t: number | null; // Tajwid average
  m: number | null; // Makhroj average
  l: number | null; // Kelancaran average
  f: number | null; // Final grade average
  g: Predikat | null; // Predikat letter
  n: number; // Count of assessed surahs
}

export interface ClassStats {
  n: number;
  assessedCount: number;
  avg: number | null;
  rows: { student: Student; calc: StudentCalc }[];
  topStudent: { student: Student; calc: StudentCalc } | null;
  lowStudents: { student: Student; calc: StudentCalc }[];
  distribution: Record<Predikat, number>;
  aspects: {
    lab: string;
    key: 't' | 'm' | 'l' | 'f';
    min: number;
    max: number;
    avg: number;
  }[];
}

