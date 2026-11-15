export const NAMA_BULAN_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
];

export const NAMA_HARI_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
export const NAMA_HARI_PENDEK_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

/**
 * Format YYYY-MM-DD into "11 Juni 2026"
 */
export function formatIndoDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return `${day} ${NAMA_BULAN_ID[monthIdx] || parts[1]} ${year}`;
}

/**
 * Format YYYY-MM-DD into "11/06"
 */
export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}`;
}

/**
 * Format YYYY-MM into "Juni 2026"
 */
export function formatIndoMonth(monthStr: string): string {
  if (!monthStr) return '';
  const parts = monthStr.split('-');
  if (parts.length < 2) return monthStr;
  const monthIdx = parseInt(parts[1], 10) - 1;
  return `${NAMA_BULAN_ID[monthIdx] || parts[1]} ${parts[0]}`;
}

/**
 * Get 6 school days (Senin s.d. Sabtu) for the week containing baseDateStr
 */
export function getWeekDates(baseDateStr: string): {
  date: string;
  dayName: string;
  dayIndex: number; // 1 = Senin, ...
  shortLabel: string; // e.g. "Sen (08/06)"
}[] {
  const parts = baseDateStr.split('-');
  if (parts.length !== 3) {
    const today = new Date();
    baseDateStr = today.toISOString().slice(0, 10);
  }
  const [y, m, d] = baseDateStr.split('-').map(Number);
  const base = new Date(y, m - 1, d);

  const dayOfWeek = base.getDay(); // 0 is Sunday, 1 is Monday...
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(base);
  monday.setDate(base.getDate() + diffToMonday);

  const result = [];
  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  for (let i = 0; i < 6; i++) {
    const cur = new Date(monday);
    cur.setDate(monday.getDate() + i);

    const curY = cur.getFullYear();
    const curM = String(cur.getMonth() + 1).padStart(2, '0');
    const curD = String(cur.getDate()).padStart(2, '0');
    const dateStr = `${curY}-${curM}-${curD}`;

    result.push({
      date: dateStr,
      dayName: days[i],
      dayIndex: i + 1,
      shortLabel: `${days[i].slice(0, 3)} (${curD}/${curM})`
    });
  }

  return result;
}

/**
 * Get week range label, e.g. "08 Juni s.d. 13 Juni 2026"
 */
export function getWeekRangeLabel(baseDateStr: string): string {
  const week = getWeekDates(baseDateStr);
  if (!week.length) return baseDateStr;
  const start = formatIndoDate(week[0].date);
  const end = formatIndoDate(week[week.length - 1].date);
  return `${start} s.d. ${end}`;
}
