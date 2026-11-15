import { Student, SchoolInfo, ClassTarget } from '../types';
import { calculateStudent, formatScore, getPredikat, getSurahAverage, checkTargetAchievement } from './calculations';
import { ROMAN_CLASS, PREDICATE_COMMENTS } from '../data/seedData';

const WR = [250, 333, 408, 500, 500, 833, 778, 180, 333, 333, 500, 564, 250, 333, 250, 278]
  .concat(Array(10).fill(500), [278, 278, 564, 564, 564, 444, 921],
    [722, 667, 667, 722, 611, 556, 722, 722, 333, 389, 722, 611, 889, 722, 722, 556, 722, 667, 556, 611, 722, 722, 944, 722, 722, 611],
    [333, 278, 333, 469, 500, 333],
    [444, 500, 444, 500, 444, 333, 500, 500, 278, 278, 500, 278, 778, 500, 500, 500, 500, 333, 389, 278, 500, 500, 722, 500, 500, 444],
    [480, 200, 480, 541]);

const WB = [250, 333, 555, 500, 500, 1000, 833, 278, 333, 333, 500, 570, 250, 333, 250, 278]
  .concat(Array(10).fill(500), [333, 333, 570, 570, 570, 500, 930],
    [722, 667, 722, 722, 667, 611, 778, 778, 389, 500, 778, 667, 944, 722, 778, 611, 778, 722, 556, 667, 722, 722, 1000, 722, 722, 667],
    [333, 278, 333, 581, 500, 333],
    [500, 556, 444, 556, 444, 333, 500, 556, 278, 333, 556, 278, 833, 556, 500, 556, 556, 444, 389, 333, 556, 500, 722, 500, 500, 444],
    [394, 220, 394, 520]);

const PT = 72 / 25.4;
const PH = 841.89; // A4 height in pt

function tw(s: string, bold?: boolean): number {
  let w = 0;
  for (const ch of String(s)) {
    const c = ch.charCodeAt(0);
    w += (c >= 32 && c <= 126) ? (bold ? WB : WR)[c - 32] : 500;
  }
  return w / 1000;
}

function pdfEnc(s: string): string {
  return String(s)
    .replace(/[^\x20-\x7e]/g, (c) => (c === '–' ? '\x96' : (c.charCodeAt(0) > 159 && c.charCodeAt(0) < 256 ? c : '?')))
    .replace(/([\\()])/g, '\\$1');
}

function wrapText(s: string, maxMm: number, size: number, bold?: boolean): string[] {
  const words = String(s).split(/\s+/);
  const lines: string[] = [];
  let current = '';
  words.forEach((w) => {
    const t = current ? current + ' ' + w : w;
    if ((tw(t, bold) * size) / PT > maxMm && current) {
      lines.push(current);
      current = w;
    } else {
      current = t;
    }
  });
  if (current) lines.push(current);
  return lines;
}

interface ImageObj {
  w: number;
  h: number;
  bytes: Uint8Array;
}

async function jpegOf(src: string): Promise<ImageObj | null> {
  return new Promise((resolve) => {
    if (!src || src.length < 10) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onerror = () => resolve(null);
    img.onload = () => {
      try {
        const w = img.width || 100;
        const h = img.height || 100;
        const cv = document.createElement('canvas');
        cv.width = w;
        cv.height = h;
        const ctx = cv.getContext('2d');
        if (!ctx) return resolve(null);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        const b64 = cv.toDataURL('image/jpeg', 0.92).split(',')[1];
        if (!b64) return resolve(null);
        const bin = atob(b64);
        const u = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
        resolve({ w, h, bytes: u });
      } catch {
        resolve(null);
      }
    };
    img.src = src;
  });
}

function drawPage(
  st: Student,
  sc: SchoolInfo,
  surahList: string[],
  className: string,
  imgs: Record<string, ImageObj>,
  target?: ClassTarget
): string {
  let o = '';
  const px = (v: number) => (v * PT).toFixed(2);
  const py = (v: number) => (PH - v * PT).toFixed(2);
  const d = (v: number) => (v * PT).toFixed(2);

  const T = (
    s: string,
    x: number,
    y: number,
    op: { s?: number; b?: number | boolean; a?: 'center' | 'right' | 'left'; g?: number } = {}
  ): number => {
    s = String(s);
    const sz = op.s || 10;
    const isBold = Boolean(op.b);
    const w = ((tw(s, isBold) * sz) / PT);
    const xx = op.a === 'center' ? x - w / 2 : op.a === 'right' ? x - w : x;
    o += `BT /${isBold ? 'F2' : 'F1'} ${sz} Tf ${op.g !== undefined ? op.g : 0.08} g ${px(xx)} ${py(y)} Td (${pdfEnc(s)}) Tj ET\n`;
    return w;
  };

  const LN = (x1: number, y1: number, x2: number, y2: number, w: number) => {
    o += `${w} w 0.1 G ${px(x1)} ${py(y1)} m ${px(x2)} ${py(y2)} l S\n`;
  };

  const RC = (x: number, y: number, w: number, h: number, fill?: boolean) => {
    o += `0.57 w 0.1 G ${fill ? '0.93 g ' : ''}${px(x)} ${py(y + h)} ${d(w)} ${d(h)} re ${fill ? 'B' : 'S'}\n`;
  };

  const IMG = (k: string, x: number, y: number, box: number) => {
    const im = imgs[k];
    if (!im) return;
    const r = Math.min(box / im.w, box / im.h);
    const w = im.w * r;
    const h = im.h * r;
    o += `q ${d(w)} 0 0 ${d(h)} ${px(x + (box - w) / 2)} ${py(y + box - (box - h) / 2)} cm /${k} Do Q\n`;
  };

  interface ColDef {
    w: number;
    a?: 'center' | 'right' | 'left';
  }

  const table = (
    x: number,
    y0: number,
    cols: ColDef[],
    head: string[],
    rows: (string[] | { cells: string[]; bold?: boolean })[],
    rh: number,
    fs: number
  ): number => {
    let y = y0;
    const row = (cells: string[], bold?: boolean, fill?: boolean) => {
      let cx = x;
      cells.forEach((c, i) => {
        RC(cx, y, cols[i].w, rh, fill);
        const al = cols[i].a || 'left';
        T(c, al === 'center' ? cx + cols[i].w / 2 : cx + 1.8, y + rh * 0.68, { b: bold, s: fs, a: al });
        cx += cols[i].w;
      });
      y += rh;
    };
    row(head, true, true);
    rows.forEach((r) => {
      const isObj = typeof r === 'object' && 'cells' in r;
      row(isObj ? (r as any).cells : r, isObj ? (r as any).bold : false);
    });
    return y;
  };

  const X0 = 18;
  const W = 174;
  const k = calculateStudent(st);
  let y = 14;

  IMG('logoL', X0, y, 22);
  IMG('logoR', X0 + W - 22, y, 22);

  T(sc.yayasan, 105, y + 5, { b: 1, s: 9.5, a: 'center' });
  T(sc.nama, 105, y + 11.5, { b: 1, s: 15, a: 'center' });
  T(`${sc.alamat}${sc.desa ? ' ' + sc.desa : ''}`, 105, y + 16.5, { s: 8.5, g: 0.3, a: 'center' });
  T(`Kecamatan ${sc.kec}, Kabupaten ${sc.kab} – ${sc.prov}`, 105, y + 20.5, { s: 8.5, g: 0.3, a: 'center' });

  y += 25;
  LN(X0, y, X0 + W, y, 1.8);
  LN(X0, y + 1.3, X0 + W, y + 1.3, 0.6);

  y += 9;
  T('CAPAIAN BELAJAR', 105, y, { b: 1, s: 12, a: 'center' });
  y += 8;

  const id = (l: string, v: string, x: number, yy: number) => {
    T(l, x, yy, { s: 10 });
    T(': ' + v, x + 20, yy, { s: 10 });
  };

  id('Nama', st.nama, X0, y);
  id('Kelas', ROMAN_CLASS[className] || className, X0 + 108, y);
  id('NISN', st.nisn, X0, y + 5);
  id('Semester', sc.semester, X0 + 108, y + 5);
  id('Sekolah', sc.nama, X0, y + 10);
  id('Tahun', sc.tahun, X0 + 108, y + 10);

  y += 17;
  T('1. Materi Tahassus', X0, y, { b: 1, s: 10.5 });
  const ach = checkTargetAchievement(st, target, surahList);
  const targetHafalan = target?.targetHafalanSurah
    ? `${target.targetHafalanSurah} (Min. ${target.targetSurahCount} Surat)`
    : '–';
  const targetJilid = target?.targetJilid || '–';

  y = table(
    X0,
    y + 2,
    [{ w: 10, a: 'center' }, { w: 56 }, { w: 46 }, { w: 42 }, { w: 20, a: 'center' }],
    ['No', 'Materi Tahassus', 'Target Kelas', 'Capaian Siswa', 'Status'],
    [
      ['1', 'Hafalan Surat', targetHafalan, st.hafalan || '–', ach.hafalanAchieved ? 'Tuntas' : 'Proses'],
      ['2', 'Fashohati/Qiroati', targetJilid, st.jilid || '–', ach.jilidAchieved ? 'Tuntas' : 'Proses']
    ],
    5.4,
    9.5
  ) + 6;

  T('2. Penilaian Tahfidz', X0, y, { b: 1, s: 10.5 });
  const cols2: ColDef[] = [{ w: 12, a: 'center' }, { w: 110 }, { w: 26, a: 'center' }, { w: 26, a: 'center' }];
  y = table(
    X0,
    y + 2,
    cols2,
    ['No', 'Penilaian Tahfidz', 'Nilai', 'Predikat'],
    [
      ['1', 'Tajwid', formatScore(k.t, 0), getPredikat(k.t) || '–'],
      ['2', 'Makhroj', formatScore(k.m, 0), getPredikat(k.m) || '–'],
      ['3', 'Kelancaran', formatScore(k.l, 0), getPredikat(k.l) || '–'],
      { cells: ['4', 'Nilai', formatScore(k.f, 1), k.g || '–'], bold: true }
    ],
    5.4,
    9.5
  ) + 6;

  T('3. Materi Hafalan', X0, y, { b: 1, s: 10.5 });
  const done = Object.keys(st.s || {})
    .map(Number)
    .sort((a, b) => a - b);
  const half = Math.ceil(done.length / 2);
  const rh = half > 16 ? 4.6 : 5.2;
  const cols3: ColDef[] = [{ w: 10, a: 'center' }, { w: 41 }, { w: 17, a: 'center' }, { w: 17, a: 'center' }];
  const rws = (a: number[]) =>
    a.map((i) => {
      const v = getSurahAverage(st.s[i]);
      return [String(i + 1), surahList[i] || `Surat ${i + 1}`, formatScore(v), getPredikat(v) || '–'];
    });
  const hd = ['No', 'Surat', 'Nilai', 'Predikat'];
  let ye = y + 2;

  if (done.length) {
    const e1 = table(X0, y + 2, cols3, hd, rws(done.slice(0, half)), rh, 9);
    const e2 = half < done.length ? table(X0 + 89, y + 2, cols3, hd, rws(done.slice(half)), rh, 9) : y + 2;
    ye = Math.max(e1, e2);
  } else {
    T('Belum ada surat yang dinilai.', X0, y + 7, { s: 9.5 });
    ye = y + 10;
  }

  y = ye + 5;
  const cm = k.g ? PREDICATE_COMMENTS[k.g] : '–';
  const cl = wrapText(cm, W - 6, 9.5);
  const bh = 6.5 + cl.length * 4.3;

  RC(X0, y, W, bh);
  T('Catatan', X0 + 2, y + 4.6, { b: 1, s: 9.5 });
  cl.forEach((l, i) => T(l, X0 + 2, y + 9 + i * 4.3, { s: 9.5 }));

  y += bh + 8;
  const cx = [X0 + 29, 105, X0 + W - 29];
  T('Orang Tua/Wali', cx[0], y + 4.5, { s: 10, a: 'center' });
  T('Kepala Madrasah', cx[1], y + 4.5, { s: 10, a: 'center' });
  T(sc.tanggal, cx[2], y, { s: 10, a: 'center' });
  T('Guru Pengampu', cx[2], y + 4.5, { s: 10, a: 'center' });

  const ny = y + 4.5 + 20;
  T('(................................)', cx[0], ny, { s: 10, a: 'center' });
  const signatures: [string, number][] = [
    [sc.kepala, cx[1]],
    [sc.guru, cx[2]]
  ];
  signatures.forEach(([n, x]) => {
    const w = T(n, x, ny, { b: 1, s: 10, a: 'center' });
    LN(x - w / 2, ny + 0.8, x + w / 2, ny + 0.8, 0.4);
  });

  return o;
}

function assemblePdf(pages: string[], imgs: Record<string, ImageObj>): ArrayBuffer {
  const chunks: Uint8Array[] = [];
  let off = 0;
  const offs: number[] = [];

  const put = (b: string | Uint8Array) => {
    const u = typeof b === 'string' ? Uint8Array.from(b, (c) => c.charCodeAt(0) & 255) : b;
    chunks.push(u);
    off += u.length;
  };

  const ik = Object.keys(imgs);
  const io: Record<string, number> = {};
  let n = 5;
  ik.forEach((k) => {
    io[k] = n++;
  });

  const po = pages.map(() => {
    const p = n;
    n += 2;
    return p;
  });
  const total = n - 1;

  const obj = (id: number, fn: () => void) => {
    offs[id] = off;
    put(id + ' 0 obj\n');
    fn();
    put('\nendobj\n');
  };

  put('%PDF-1.4\n');
  obj(1, () => put('<</Type/Catalog/Pages 2 0 R>>'));
  obj(2, () => put('<</Type/Pages/Count ' + pages.length + '/Kids[' + po.map((p) => p + ' 0 R').join(' ') + ']>>'));
  obj(3, () => put('<</Type/Font/Subtype/Type1/BaseFont/Times-Roman/Encoding/WinAnsiEncoding>>'));
  obj(4, () => put('<</Type/Font/Subtype/Type1/BaseFont/Times-Bold/Encoding/WinAnsiEncoding>>'));

  ik.forEach((k) => {
    const im = imgs[k];
    obj(io[k], () => {
      put(
        `<</Type/XObject/Subtype/Image/Width ${im.w}/Height ${im.h}/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length ${im.bytes.length}>>\nstream\n`
      );
      put(im.bytes);
      put('\nendstream');
    });
  });

  const xo = ik.map((k) => `/${k} ${io[k]} 0 R`).join(' ');

  pages.forEach((ops, i) => {
    const p = po[i];
    obj(p, () =>
      put(
        `<</Type/Page/Parent 2 0 R/MediaBox[0 0 595.28 841.89]/Resources<</Font<</F1 3 0 R/F2 4 0 R>>/XObject<<${xo}>>>>/Contents ${
          p + 1
        } 0 R>>`
      )
    );
    obj(p + 1, () => {
      put(`<</Length ${ops.length}>>\nstream\n`);
      put(ops);
      put('\nendstream');
    });
  });

  const xr = off;
  let x = 'xref\n0 ' + (total + 1) + '\n0000000000 65535 f \n';
  for (let i = 1; i <= total; i++) x += String(offs[i]).padStart(10, '0') + ' 00000 n \n';
  put(x + `trailer\n<</Size ${total + 1}/Root 1 0 R>>\nstartxref\n${xr}\n%%EOF`);

  const out = new Uint8Array(off);
  let p = 0;
  chunks.forEach((c) => {
    out.set(c, p);
    p += c.length;
  });

  return out.buffer;
}

export async function generateAndDownloadPdf(
  students: Student[],
  school: SchoolInfo,
  surahList: string[],
  className: string,
  filename?: string,
  target?: ClassTarget
): Promise<void> {
  const imgs: Record<string, ImageObj> = {};
  if (school.logoL) {
    const im = await jpegOf(school.logoL);
    if (im) imgs.logoL = im;
  }
  if (school.logoR) {
    const im = await jpegOf(school.logoR);
    if (im) imgs.logoR = im;
  }

  const pages = students.map((st) => drawPage(st, school, surahList, className, imgs, target));
  const buffer = assemblePdf(pages, imgs);

  const blob = new Blob([buffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download =
    filename ||
    (students.length === 1
      ? `Raport_${students[0].nama.replace(/[^A-Za-z0-9]+/g, '_')}.pdf`
      : `Raport_Tahassus_Kelas_${className}.pdf`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
