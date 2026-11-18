import React from 'react';
import { SchoolInfo } from '../types';
import { Check, Menu, PanelLeftOpen, PanelLeftClose, Sun, Moon } from 'lucide-react';
import { NAV_ITEMS } from './Sidebar';

interface HeaderProps {
  school: SchoolInfo;
  onUpdateSchool: (school: SchoolInfo) => void;
  activeClass: string;
  onClassChange: (className: string) => void;
  activeTab: string;
  savedIndicator: boolean;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  school,
  onUpdateSchool,
  activeClass,
  onClassChange,
  activeTab,
  savedIndicator,
  isSidebarOpen,
  onToggleSidebar,
  theme,
  onToggleTheme
}) => {
  const activeNav = NAV_ITEMS.find((item) => item.id === activeTab);

  return (
    <header className="sticky top-0 z-30 h-14 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 no-print">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Left-Slide Menu Toggle + Contextual Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label={isSidebarOpen ? 'Tutup menu samping' : 'Buka menu samping'}
            aria-expanded={isSidebarOpen}
            title={isSidebarOpen ? 'Tutup Menu Kiri' : 'Buka Menu Kiri'}
            className="inline-flex items-center justify-center w-10 h-10 -ml-2 rounded-xl text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer shrink-0"
          >
            <Menu className="w-5 h-5 lg:hidden" />
            {isSidebarOpen ? (
              <PanelLeftClose className="w-5 h-5 hidden lg:block" />
            ) : (
              <PanelLeftOpen className="w-5 h-5 hidden lg:block" />
            )}
          </button>

          <div className="flex items-center gap-2 text-sm min-w-0">
            <span className="font-display font-bold text-stone-900 dark:text-stone-100 whitespace-nowrap hidden sm:inline">
              {school.nama}
            </span>
            <span className="text-stone-300 dark:text-stone-600 hidden sm:inline" aria-hidden="true">
              /
            </span>
            <span className="font-semibold text-emerald-900 dark:text-emerald-400 truncate">
              {activeNav?.label || 'Rekap Kelas'}
            </span>
            <span className="text-stone-300 dark:text-stone-600" aria-hidden="true">
              ·
            </span>
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400 whitespace-nowrap shrink-0">
              Kelas {activeClass}
            </span>
          </div>
        </div>

        {/* Right: Save feedback, Theme Toggle & quick class switcher */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            className={`flex items-center gap-1 text-xs transition-opacity duration-200 font-medium whitespace-nowrap ${
              savedIndicator
                ? 'opacity-100 text-emerald-700 dark:text-emerald-400'
                : 'opacity-0 pointer-events-none'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tersimpan</span>
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Aktifkan Tema Terang' : 'Aktifkan Tema Gelap'}
            title={theme === 'dark' ? 'Beralih ke Tema Terang' : 'Beralih ke Tema Gelap'}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200/80 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Terang</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-stone-600" />
                <span className="hidden md:inline">Gelap</span>
              </>
            )}
          </button>

          <label className="sr-only" htmlFor="topbar-semester-select">
            Pilih Semester
          </label>
          <select
            id="topbar-semester-select"
            value={school.semester || 'II (Dua)'}
            onChange={(e) => onUpdateSchool({ ...school, semester: e.target.value })}
            className="py-1.5 px-2.5 text-xs font-semibold text-emerald-900 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-lg focus:outline-emerald-700 cursor-pointer whitespace-nowrap"
            title="Pilih Semester aktif yang akan muncul di semua dokumen raport, jurnal & absensi"
          >
            <option value="I (Satu) / Ganjil">Semester I (Ganjil)</option>
            <option value="II (Dua) / Genap">Semester II (Genap)</option>
            <option value="I (Satu)">Semester I</option>
            <option value="II (Dua)">Semester II</option>
            <option value="Ganjil">Semester Ganjil</option>
            <option value="Genap">Semester Genap</option>
          </select>

          <label className="sr-only" htmlFor="topbar-class-select">
            Pilih Kelas
          </label>
          <select
            id="topbar-class-select"
            value={activeClass}
            onChange={(e) => onClassChange(e.target.value)}
            className="py-1.5 px-3 text-xs font-semibold text-stone-800 dark:text-stone-100 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200/70 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-emerald-700 cursor-pointer whitespace-nowrap"
          >
            {['1', '2', '3', '4', '5', '6'].map((cls) => (
              <option key={cls} value={cls}>
                Kelas {cls}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};
