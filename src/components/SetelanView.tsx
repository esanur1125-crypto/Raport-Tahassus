import React, { useState, useRef } from 'react';
import { SchoolInfo, AppState, ClassTarget } from '../types';
import { DEFAULT_LOGO_MADRASAH, JILID_OPTIONS, ROMAN_CLASS } from '../data/seedData';
import { downloadJsonBackup } from '../utils/storage';
import { getSurahTargetCount } from '../utils/calculations';
import {
  Building2,
  Image as ImageIcon,
  Copy,
  Check,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Target,
  BookOpen,
  Sparkles
} from 'lucide-react';

interface SetelanViewProps {
  school: SchoolInfo;
  onUpdateSchool: (updated: SchoolInfo) => void;
  fullState: AppState;
  onRestoreState: (restored: AppState) => void;
  onResetSeedData: () => void;
  targets: Record<string, ClassTarget>;
  onUpdateTarget: (className: string, updatedTarget: ClassTarget) => void;
  onResetTargets: () => void;
  surahList: string[];
}

export const SetelanView: React.FC<SetelanViewProps> = ({
  school,
  onUpdateSchool,
  fullState,
  onRestoreState,
  onResetSeedData,
  targets,
  onUpdateTarget,
  onResetTargets,
  surahList
}) => {
  const [copiedBackup, setCopiedBackup] = useState(false);
  const [restoreText, setRestoreText] = useState('');
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreSuccess, setRestoreSuccess] = useState(false);
  const [armedReset, setArmedReset] = useState(false);
  const [selectedTargetClass, setSelectedTargetClass] = useState<string>('4');
  const [targetToast, setTargetToast] = useState(false);

  const [logoError, setLogoError] = useState<string | null>(null);

  const fileInputLRef = useRef<HTMLInputElement>(null);
  const fileInputRRef = useRef<HTMLInputElement>(null);

  const activeClassTarget: ClassTarget = targets[selectedTargetClass] || {
    targetJilid: 'Jilid Dasar',
    targetHafalanSurah: 'Al-Fiil',
    targetSurahCount: 10,
    kkmNilai: 75,
    keterangan: ''
  };

  const autoSurahCount = getSurahTargetCount(activeClassTarget.targetHafalanSurah, surahList);

  const handleTargetChange = (field: keyof ClassTarget, value: string | number) => {
    const updated: ClassTarget = {
      ...activeClassTarget,
      [field]: value
    };

    // Otomatis isi target minimal jumlah surat mengikuti surat hafalan yang diinput
    if (field === 'targetHafalanSurah' && typeof value === 'string') {
      const computedCount = getSurahTargetCount(value, surahList);
      if (computedCount !== null) {
        updated.targetSurahCount = computedCount;
      }
    }

    onUpdateTarget(selectedTargetClass, updated);
    setTargetToast(true);
    setTimeout(() => setTargetToast(false), 2000);
  };

  const handleFieldChange = (field: keyof SchoolInfo, val: string) => {
    onUpdateSchool({
      ...school,
      [field]: val
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'logoL' | 'logoR') => {
    setLogoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLogoError('File harus berupa gambar (PNG atau JPG)');
      setTimeout(() => setLogoError(null), 4000);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 240;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/png');
          onUpdateSchool({
            ...school,
            [side]: dataUrl
          });
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCopyBackup = () => {
    const text = JSON.stringify(fullState, null, 2);
    const markCopied = () => {
      setCopiedBackup(true);
      setTimeout(() => setCopiedBackup(false), 2500);
    };

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(markCopied).catch(() => {
        fallbackCopyText(text);
        markCopied();
      });
    } else {
      fallbackCopyText(text);
      markCopied();
    }
  };

  const fallbackCopyText = (text: string) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
    } catch {
      // ignore
    }
  };

  const handleRestoreSubmit = () => {
    setRestoreError(null);
    setRestoreSuccess(false);
    try {
      const parsed = JSON.parse(restoreText.trim()) as AppState;
      if (!parsed || !parsed.school || !parsed.classes || !Array.isArray(parsed.surah)) {
        throw new Error('Format cadangan tidak sesuai');
      }
      onRestoreState(parsed);
      setRestoreSuccess(true);
      setRestoreText('');
      setTimeout(() => setRestoreSuccess(false), 3000);
    } catch {
      setRestoreError('Format teks JSON cadangan tidak valid. Pastikan menyalin seluruh teks cadangan.');
    }
  };

  const handleResetClick = () => {
    if (armedReset) {
      onResetSeedData();
      setArmedReset(false);
    } else {
      setArmedReset(true);
      setTimeout(() => setArmedReset(false), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* KOP RAPORT & DUAL LOGO */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-xs">
        <div className="mb-4">
          <h2 className="font-display font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
            Logo Kop Raport
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Logo akan muncul pada kop surat resmi raport (kiri dan kanan). Disarankan gambar format PNG atau JPG.
          </p>
          {logoError && (
            <div className="mt-2 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900 animate-in fade-in">
              {logoError}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Kiri */}
          <div className="flex items-start gap-4 p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40">
            <div className="w-20 h-20 rounded-xl bg-white border border-stone-300 dark:border-stone-700 flex items-center justify-center p-2 shrink-0 overflow-hidden shadow-2xs">
              {school.logoL ? (
                <img src={school.logoL} alt="Logo Kiri" className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="text-xs text-stone-400">Tidak ada</span>
              )}
            </div>
            <div className="space-y-2">
              <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 block">Logo Kiri (Madrasah / Yayasan)</span>
              <input
                ref={fileInputLRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleLogoUpload(e, 'logoL')}
                className="hidden"
              />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputLRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-medium text-emerald-900 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-lg cursor-pointer"
                >
                  Unggah Logo
                </button>
                {school.logoL && (
                  <button
                    type="button"
                    onClick={() => handleFieldChange('logoL', '')}
                    className="px-2.5 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg cursor-pointer"
                  >
                    Hapus
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleFieldChange('logoL', DEFAULT_LOGO_MADRASAH)}
                  className="px-2.5 py-1.5 text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-700/60 rounded-lg cursor-pointer"
                >
                  Logo Default
                </button>
              </div>
            </div>
          </div>

          {/* Logo Kanan */}
          <div className="flex items-start gap-4 p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40">
            <div className="w-20 h-20 rounded-xl bg-white border border-stone-300 dark:border-stone-700 flex items-center justify-center p-2 shrink-0 overflow-hidden shadow-2xs">
              {school.logoR ? (
                <img src={school.logoR} alt="Logo Kanan" className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="text-xs text-stone-400">Tidak ada</span>
              )}
            </div>
            <div className="space-y-2">
              <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 block">Logo Kanan (Kemenag / Instansi)</span>
              <input
                ref={fileInputRRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleLogoUpload(e, 'logoR')}
                className="hidden"
              />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-medium text-emerald-900 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-lg cursor-pointer"
                >
                  Unggah Logo
                </button>
                {school.logoR && (
                  <button
                    type="button"
                    onClick={() => handleFieldChange('logoR', '')}
                    className="px-2.5 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg cursor-pointer"
                  >
                    Hapus
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleFieldChange('logoR', DEFAULT_LOGO_MADRASAH)}
                  className="px-2.5 py-1.5 text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-700/60 rounded-lg cursor-pointer"
                >
                  Logo Default
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Kop Surat Preview (Explicitly white paper) */}
        <div className="mt-6 pt-5 border-t border-stone-200 dark:border-stone-800">
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-2">
            Pratinjau Kop Surat
          </span>
          <div className="border border-stone-300 dark:border-stone-700 rounded-xl p-4 bg-white text-stone-900 font-doc text-center text-xs">
            <div className="grid grid-cols-[60px_1fr_60px] items-center gap-2 border-b-[2px] border-double border-stone-900 pb-2">
              <div className="flex items-center justify-center h-12 w-12">
                {school.logoL && <img src={school.logoL} alt="" className="max-h-12 max-w-12 object-contain" />}
              </div>
              <div>
                <div className="text-[11px] uppercase font-bold text-stone-800">{school.yayasan}</div>
                <div className="text-base font-bold text-stone-900 uppercase my-0.5">{school.nama}</div>
                <div className="text-[10px] text-stone-600">
                  NSM: {school.nsm} · NPSN: {school.npsn}
                  <br />
                  {school.alamat} {school.desa}, Kec. {school.kec}, Kab. {school.kab} – {school.prov}
                </div>
              </div>
              <div className="flex items-center justify-center h-12 w-12">
                {school.logoR && <img src={school.logoR} alt="" className="max-h-12 max-w-12 object-contain" />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* IDENTITAS MADRASAH */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-xs">
        <div className="mb-4">
          <h2 className="font-display font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
            Identitas Madrasah & Pengesahan
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Data ini akan tercetak otomatis pada kop dan lembar pengesahan tanda tangan raport.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-600 dark:text-stone-400 mb-1">Nama Madrasah</label>
            <input
              type="text"
              value={school.nama}
              onChange={(e) => handleFieldChange('nama', e.target.value)}
              className="w-full py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:outline-emerald-700 dark:focus:outline-emerald-500 font-semibold"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-600 dark:text-stone-400 mb-1">Nama Yayasan</label>
            <input
              type="text"
              value={school.yayasan}
              onChange={(e) => handleFieldChange('yayasan', e.target.value)}
              className="w-full py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:outline-emerald-700 dark:focus:outline-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-600 dark:text-stone-400 mb-1">NPSN</label>
            <input
              type="text"
              value={school.npsn}
              onChange={(e) => handleFieldChange('npsn', e.target.value)}
              className="w-full py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:outline-emerald-700 dark:focus:outline-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-600 dark:text-stone-400 mb-1">NSM</label>
            <input
              type="text"
              value={school.nsm}
              onChange={(e) => handleFieldChange('nsm', e.target.value)}
              className="w-full py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:outline-emerald-700 dark:focus:outline-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-600 dark:text-stone-400 mb-1">Alamat Jalan</label>
            <input
              type="text"
              value={school.alamat}
              onChange={(e) => handleFieldChange('alamat', e.target.value)}
              className="w-full py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:outline-emerald-700 dark:focus:outline-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-600 dark:text-stone-400 mb-1">Desa / Kelurahan</label>
            <input
              type="text"
              value={school.desa}
              onChange={(e) => handleFieldChange('desa', e.target.value)}
              className="w-full py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:outline-emerald-700 dark:focus:outline-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-600 dark:text-stone-400 mb-1">Kecamatan</label>
            <input
              type="text"
              value={school.kec}
              onChange={(e) => handleFieldChange('kec', e.target.value)}
              className="w-full py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:outline-emerald-700 dark:focus:outline-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-600 dark:text-stone-400 mb-1">Kabupaten</label>
            <input
              type="text"
              value={school.kab}
              onChange={(e) => handleFieldChange('kab', e.target.value)}
              className="w-full py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:outline-emerald-700 dark:focus:outline-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-600 dark:text-stone-400 mb-1">Provinsi</label>
            <input
              type="text"
              value={school.prov}
              onChange={(e) => handleFieldChange('prov', e.target.value)}
              className="w-full py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:outline-emerald-700 dark:focus:outline-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-600 dark:text-stone-400 mb-1">Kepala Madrasah</label>
            <input
              type="text"
              value={school.kepala}
              onChange={(e) => handleFieldChange('kepala', e.target.value)}
              className="w-full py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:outline-emerald-700 dark:focus:outline-emerald-500 font-semibold"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-600 dark:text-stone-400 mb-1">Guru Pengampu</label>
            <input
              type="text"
              value={school.guru}
              onChange={(e) => handleFieldChange('guru', e.target.value)}
              className="w-full py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:outline-emerald-700 dark:focus:outline-emerald-500 font-semibold"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-stone-600 dark:text-stone-400">Semester</label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleFieldChange('semester', 'I (Satu) / Ganjil')}
                  className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded hover:bg-emerald-100 cursor-pointer"
                >
                  Smt I (Ganjil)
                </button>
                <button
                  type="button"
                  onClick={() => handleFieldChange('semester', 'II (Dua) / Genap')}
                  className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded hover:bg-emerald-100 cursor-pointer"
                >
                  Smt II (Genap)
                </button>
              </div>
            </div>
            <input
              type="text"
              value={school.semester}
              onChange={(e) => handleFieldChange('semester', e.target.value)}
              className="w-full py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:outline-emerald-700 dark:focus:outline-emerald-500 font-semibold"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-600 dark:text-stone-400 mb-1">Tahun Pelajaran</label>
            <input
              type="text"
              value={school.tahun}
              onChange={(e) => handleFieldChange('tahun', e.target.value)}
              className="w-full py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:outline-emerald-700 dark:focus:outline-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-600 dark:text-stone-400 mb-1">Tempat & Tanggal Raport</label>
            <input
              type="text"
              value={school.tanggal}
              onChange={(e) => handleFieldChange('tanggal', e.target.value)}
              className="w-full py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:outline-emerald-700 dark:focus:outline-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* PENGATURAN TARGET KURIKULUM PER KELAS (KELAS 1 - 6) */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="font-display font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
              Target Kurikulum Per Kelas (Hafalan & Jilid)
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Tentukan target capaian Jilid Fashohati/Qiroati, surat hafalan Juz 30, target jumlah surat, dan batas KKM kelulusan untuk Kelas 1 s.d. 6.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {targetToast && (
              <span className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 font-medium animate-pulse">
                Target diperbarui
              </span>
            )}
            <button
              type="button"
              onClick={onResetTargets}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition-colors cursor-pointer"
              title="Kembalikan semua target kelas ke standar kurikulum MI Syuriyah"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Standar Madrasah</span>
            </button>
          </div>
        </div>

        {/* Class Selection Tabs (1 - 6) */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-stone-100 dark:border-stone-800 pb-4">
          {(['1', '2', '3', '4', '5', '6'] as const).map((cls) => {
            const isSelected = selectedTargetClass === cls;
            const t = targets[cls] || { targetJilid: '-', targetHafalanSurah: '-' };
            return (
              <button
                key={cls}
                type="button"
                onClick={() => setSelectedTargetClass(cls)}
                className={`flex-1 min-w-[130px] p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/50 border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-stone-50 dark:bg-stone-800/70 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${isSelected ? 'text-emerald-950 dark:text-emerald-300' : 'text-stone-800 dark:text-stone-200'}`}>
                    Kelas {cls} ({ROMAN_CLASS[cls] || cls})
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                  )}
                </div>
                <div className="text-[11px] text-stone-600 dark:text-stone-300 truncate">
                  {t.targetJilid || '–'}
                </div>
                <div className="text-[10px] text-stone-400 dark:text-stone-500 truncate">
                  {t.targetHafalanSurah || '–'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Class Target Form */}
        <div className="bg-stone-50/70 dark:bg-stone-800/40 rounded-xl p-5 border border-stone-200 dark:border-stone-800 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-200 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" />
              Konfigurasi Target Kelas {selectedTargetClass} ({ROMAN_CLASS[selectedTargetClass] || selectedTargetClass})
            </h3>
            <span className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
              Otomatis diterapkan di Raport & Rekap
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Target Jilid */}
            <div>
              <label htmlFor="target-jilid-select" className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Target Jilid Fashohati / Qiroati
              </label>
              <select
                id="target-jilid-select"
                value={activeClassTarget.targetJilid || ''}
                onChange={(e) => handleTargetChange('targetJilid', e.target.value)}
                className="w-full py-2 px-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl font-medium text-stone-900 dark:text-stone-100 focus:outline-emerald-700 dark:focus:outline-emerald-500"
              >
                {JILID_OPTIONS.map((j) => (
                  <option key={j} value={j}>
                    {j || '– Belum Ada Target –'}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">
                Standar jilid minimal yang harus dituntaskan
              </p>
            </div>

            {/* Target Hafalan Surat */}
            <div className="space-y-1">
              <label htmlFor="target-hafalan-select" className="block font-semibold text-stone-700 dark:text-stone-300">
                Target Surat Hafalan (Juz 30)
              </label>

              {/* Quick Dropdown Picker */}
              <select
                id="target-hafalan-select"
                value={activeClassTarget.targetHafalanSurah || ''}
                onChange={(e) => handleTargetChange('targetHafalanSurah', e.target.value)}
                className="w-full py-2 px-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl font-medium text-stone-900 dark:text-stone-100 focus:outline-emerald-700 dark:focus:outline-emerald-500"
              >
                <option value="">-- Pilih Surat Target --</option>
                {surahList.map((s, idx) => (
                  <option key={s} value={s}>
                    {idx + 1}. {s} ({idx + 1} Surat)
                  </option>
                ))}
              </select>

              {/* Manual Input with datalist fallback */}
              <input
                id="target-hafalan-input"
                type="text"
                list="target-surah-list"
                value={activeClassTarget.targetHafalanSurah || ''}
                onChange={(e) => handleTargetChange('targetHafalanSurah', e.target.value)}
                placeholder="Atau ketik nama surat..."
                className="w-full py-1.5 px-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-xs text-stone-700 dark:text-stone-200 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-emerald-700 dark:focus:outline-emerald-500 mt-1"
              />
              <datalist id="target-surah-list">
                {surahList.map((s, idx) => (
                  <option key={s} value={s}>
                    Surat ke-{idx + 1} ({idx + 1} Surat)
                  </option>
                ))}
              </datalist>
              <p className="text-[10px] text-stone-400 dark:text-stone-500">
                Pilih dari daftar atau ketik nama surat
              </p>
            </div>

            {/* Target Minimal Jumlah Surat */}
            <div className="space-y-1">
              <label htmlFor="target-count-input" className="block font-semibold text-stone-700 dark:text-stone-300">
                Target Minimal Jumlah Surat
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="target-count-input"
                  type="number"
                  min="1"
                  max="37"
                  value={activeClassTarget.targetSurahCount || 0}
                  onChange={(e) => handleTargetChange('targetSurahCount', parseInt(e.target.value) || 0)}
                  className="w-full py-2 px-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl font-medium text-stone-900 dark:text-stone-100 focus:outline-emerald-700 dark:focus:outline-emerald-500 tabular-nums"
                />
                <span className="text-xs text-stone-500 dark:text-stone-400 font-semibold whitespace-nowrap">/ 37</span>
              </div>

              {autoSurahCount !== null ? (
                <div className="space-y-0.5 mt-1">
                  <div className="flex items-center gap-1 text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="truncate">
                      Otomatis: {autoSurahCount} Surat (An-Nas s.d. {activeClassTarget.targetHafalanSurah})
                    </span>
                  </div>
                  {activeClassTarget.targetSurahCount !== autoSurahCount && (
                    <button
                      type="button"
                      onClick={() => handleTargetChange('targetSurahCount', autoSurahCount)}
                      className="text-[10px] text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 underline text-left block cursor-pointer"
                    >
                      Kembalikan ke {autoSurahCount} surat otomatis
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-[10px] text-stone-400 dark:text-stone-500">
                  Otomatis terisi mengikuti surat yang dipilih
                </p>
              )}
            </div>

            {/* KKM Nilai */}
            <div>
              <label htmlFor="target-kkm-input" className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                KKM Nilai Minimal (Skala 0-100)
              </label>
              <input
                id="target-kkm-input"
                type="number"
                min="60"
                max="100"
                value={activeClassTarget.kkmNilai || 75}
                onChange={(e) => handleTargetChange('kkmNilai', parseInt(e.target.value) || 75)}
                className="w-full py-2 px-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl font-medium text-stone-900 dark:text-stone-100 focus:outline-emerald-700 dark:focus:outline-emerald-500 tabular-nums"
              />
              <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">
                Batas kriteria ketuntasan minimal nilai akhir
              </p>
            </div>

            {/* Catatan / Keterangan Kurikulum */}
            <div className="sm:col-span-2 lg:col-span-4">
              <label htmlFor="target-desc-input" className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Keterangan / Fokus Kurikulum Kelas {selectedTargetClass}
              </label>
              <input
                id="target-desc-input"
                type="text"
                value={activeClassTarget.keterangan || ''}
                onChange={(e) => handleTargetChange('keterangan', e.target.value)}
                placeholder="mis. Pengenalan makhraj huruf hijaiyah dan hafalan surat pendek dasar"
                className="w-full py-2 px-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-emerald-700 dark:focus:outline-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Matrix Overview Table across all classes 1-6 */}
        <div>
          <span className="text-xs font-semibold text-stone-600 dark:text-stone-400 block mb-2">
            Matriks Target Kurikulum Kelas 1 s.d. 6:
          </span>
          <div className="overflow-x-auto border border-stone-200 dark:border-stone-800 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 uppercase text-[10px] tracking-wider border-b border-stone-200 dark:border-stone-700 font-semibold">
                  <th className="py-2 px-3 text-center w-14">Kelas</th>
                  <th className="py-2 px-3">Target Jilid</th>
                  <th className="py-2 px-3">Target Hafalan Surat</th>
                  <th className="py-2 px-3 text-center">Jumlah Surat</th>
                  <th className="py-2 px-3 text-center">KKM</th>
                  <th className="py-2 px-3">Fokus Kurikulum</th>
                  <th className="py-2 px-3 text-center w-16">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {(['1', '2', '3', '4', '5', '6'] as const).map((cls) => {
                  const t = targets[cls] || {
                    targetJilid: '–',
                    targetHafalanSurah: '–',
                    targetSurahCount: 0,
                    kkmNilai: 75,
                    keterangan: '–'
                  };
                  const isCurrent = selectedTargetClass === cls;
                  return (
                    <tr
                      key={cls}
                      onClick={() => setSelectedTargetClass(cls)}
                      className={`cursor-pointer transition-colors ${
                        isCurrent
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/40 font-semibold text-stone-900 dark:text-stone-100'
                          : 'hover:bg-stone-50 dark:hover:bg-stone-800/50 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <td className="py-2 px-3 text-center font-bold">
                        Kelas {cls}
                      </td>
                      <td className="py-2 px-3 font-medium">
                        {t.targetJilid || '–'}
                      </td>
                      <td className="py-2 px-3">
                        {t.targetHafalanSurah || '–'}
                      </td>
                      <td className="py-2 px-3 text-center tabular-nums">
                        {t.targetSurahCount} Surat
                      </td>
                      <td className="py-2 px-3 text-center tabular-nums font-bold text-emerald-900 dark:text-emerald-400">
                        {t.kkmNilai}
                      </td>
                      <td className="py-2 px-3 text-[11px] text-stone-500 dark:text-stone-400 max-w-xs truncate">
                        {t.keterangan || '–'}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTargetClass(cls);
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border cursor-pointer ${
                            isCurrent
                              ? 'bg-emerald-800 dark:bg-emerald-700 text-white border-emerald-800 dark:border-emerald-700'
                              : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
                          }`}
                        >
                          {isCurrent ? 'Aktif' : 'Edit'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CADANGAN & PEMULIHAN DATA */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-xs">
        <div className="mb-4">
          <h2 className="font-display font-bold text-base text-stone-900 dark:text-stone-100">
            Cadangan & Pemulihan Data
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Seluruh data tersimpan aman di browser Anda. Anda dapat mengunduh berkas cadangan JSON agar tidak hilang ketika berpindah perangkat.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCopyBackup}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-900 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-xl transition-colors cursor-pointer"
            >
              {copiedBackup ? <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedBackup ? 'Teks Cadangan Tersalin!' : 'Salin Teks Cadangan'}</span>
            </button>

            <button
              type="button"
              onClick={() => downloadJsonBackup(fullState)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Berkas JSON (.json)</span>
            </button>
          </div>

          {/* Restore Box */}
          <div className="pt-4 border-t border-stone-100 dark:border-stone-800">
            <label htmlFor="restore-textarea" className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Pulihkan Data dari Teks Cadangan
            </label>
            <textarea
              id="restore-textarea"
              rows={3}
              placeholder="Tempel teks JSON cadangan di sini..."
              value={restoreText}
              onChange={(e) => setRestoreText(e.target.value)}
              className="w-full p-3 font-mono text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 rounded-xl focus:outline-emerald-700 dark:focus:outline-emerald-500"
            />
            {restoreError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-medium">{restoreError}</p>
            )}
            {restoreSuccess && (
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 font-medium">Data berhasil dipulihkan!</p>
            )}
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={handleRestoreSubmit}
                disabled={!restoreText.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 rounded-xl transition-colors cursor-pointer disabled:opacity-40"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Terapkan Pemulihan</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RESET KE DATA AWAL */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-rose-200 dark:border-rose-900/70 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-base text-rose-900 dark:text-rose-400 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-rose-700 dark:text-rose-400" />
              Kembalikan Data Awal (Reset)
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Mengembalikan semua nilai dan data siswa ke versi awal MI Syuriyah (Kelas 4, 5, dan 6).
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetClick}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
              armedReset
                ? 'bg-rose-700 text-white animate-pulse'
                : 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800'
            }`}
          >
            {armedReset ? 'Yakin? Klik Sekali Lagi' : 'Kembalikan Data Awal'}
          </button>
        </div>
      </div>
    </div>
  );
};
