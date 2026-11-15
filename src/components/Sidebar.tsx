import React, { useEffect } from 'react';
import { SchoolInfo } from '../types';
import {
  LayoutGrid,
  PenLine,
  BookOpen,
  BookOpenCheck,
  UserCheck,
  Users,
  FileText,
  Settings,
  X,
  PanelLeftClose,
  Sun,
  Moon
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'rekap', label: 'Rekap Kelas', icon: LayoutGrid },
  { id: 'nilai', label: 'Input Nilai', icon: PenLine },
  { id: 'jurnal', label: 'Jurnal Hafalan', icon: BookOpenCheck },
  { id: 'absensi', label: 'Absensi', icon: UserCheck },
  { id: 'siswa', label: 'Data Siswa', icon: Users },
  { id: 'raport', label: 'Raport Resmi', icon: FileText },
  { id: 'setelan', label: 'Pengaturan', icon: Settings }
];

interface SidebarProps {
  school: SchoolInfo;
  activeClass: string;
  onClassChange: (className: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  onSetTheme: (theme: 'light' | 'dark') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  school,
  activeClass,
  onClassChange,
  activeTab,
  onTabChange,
  isOpen,
  onClose,
  theme,
  onSetTheme
}) => {
  // Close on Escape key for mobile/overlay convenience
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && window.innerWidth < 1024) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSelectTab = (tabId: string) => {
    onTabChange(tabId);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleSelectClass = (cls: string) => {
    onClassChange(cls);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile & Tablet Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-stone-950/50 backdrop-blur-[1px] transition-opacity duration-200 lg:hidden no-print ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Left Slide Sidebar */}
      <aside
        aria-label="Menu Navigasi Utama"
        className={`fixed inset-y-0 left-0 z-50 w-[264px] bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 flex flex-col justify-between transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] no-print ${
          isOpen ? 'translate-x-0 shadow-xl lg:shadow-none' : '-translate-x-full'
        }`}
      >
        {/* Top Section: Brand + Class Switcher + Navigation */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="px-4 py-4 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-800 dark:bg-emerald-700 text-white flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-display text-base font-bold tracking-tight text-stone-900 dark:text-stone-100 truncate leading-tight">
                  Raport Tahassus
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
                  {school.nama}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup Menu Samping"
              title="Tutup Menu"
              className="p-2 text-stone-400 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4 lg:hidden" />
              <PanelLeftClose className="w-4 h-4 hidden lg:block" />
            </button>
          </div>

          {/* Class Selector 1 - 6 */}
          <div className="px-4 py-3.5 border-b border-stone-100 dark:border-stone-800">
            <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-2">
              Pilih Kelas Aktif
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {['1', '2', '3', '4', '5', '6'].map((cls) => {
                const isActive = activeClass === cls;
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => handleSelectClass(cls)}
                    className={`py-2 px-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer border ${
                      isActive
                        ? 'bg-emerald-800 dark:bg-emerald-700 text-white border-emerald-800 dark:border-emerald-700'
                        : 'bg-stone-50 dark:bg-stone-800/70 text-stone-700 dark:text-stone-300 border-stone-200/80 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                  >
                    Kelas {cls}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Navigation Links */}
          <nav className="px-3 py-3 space-y-1 flex-1">
            <div className="px-2 pb-1 text-[11px] font-semibold text-stone-500 dark:text-stone-400">
              Menu Program
            </div>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors whitespace-nowrap cursor-pointer text-left ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 font-semibold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100/80 dark:hover:bg-stone-800/70'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-emerald-800 dark:text-emerald-400' : 'text-stone-400 dark:text-stone-500'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Theme Switcher + Metadata */}
        <div className="px-4 py-3.5 border-t border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/80 space-y-3">
          {/* Light / Dark Theme Switcher */}
          <div>
            <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-1.5">
              Tema Tampilan
            </div>
            <div className="grid grid-cols-2 gap-1 p-1 bg-stone-200/70 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
              <button
                type="button"
                onClick={() => onSetTheme('light')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  theme === 'light'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-600" />
                <span>Terang</span>
              </button>
              <button
                type="button"
                onClick={() => onSetTheme('dark')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-stone-900 text-stone-100 shadow-2xs border border-stone-700'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-sky-400" />
                <span>Gelap</span>
              </button>
            </div>
          </div>

          <div className="text-xs text-stone-600 dark:text-stone-400 space-y-0.5 pt-1 border-t border-stone-200/70 dark:border-stone-800">
            <div className="font-semibold text-stone-800 dark:text-stone-200 truncate">{school.guru}</div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1.5 truncate">
              <span>Smt {school.semester}</span>
              <span aria-hidden="true">·</span>
              <span>TA {school.tahun}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
