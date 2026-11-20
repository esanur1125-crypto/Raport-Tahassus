import React, { useState, useEffect, useRef } from 'react';
import { AppState, Student, SchoolInfo, JournalEntry, AttendanceDay, ClassTarget } from './types';
import { loadAppState, saveAppState, ParsedImportStudent } from './utils/storage';
import { SEED_DATA, DEFAULT_CLASS_TARGETS } from './data/seedData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { RekapView } from './components/RekapView';
import { NilaiView } from './components/NilaiView';
import { JurnalView } from './components/JurnalView';
import { AbsensiView } from './components/AbsensiView';
import { SiswaView } from './components/SiswaView';
import { RaportView } from './components/RaportView';
import { SetelanView } from './components/SetelanView';
import { RaportDocument } from './components/RaportDocument';
import { LegerPrintDocument } from './components/LegerPrintDocument';
import { RekapNilaiPrintDocument } from './components/RekapNilaiPrintDocument';
import { NilaiInputPrintDocument } from './components/NilaiInputPrintDocument';
import { JurnalPrintDocument } from './components/JurnalPrintDocument';
import { AbsensiPrintDocument } from './components/AbsensiPrintDocument';
import { AbsensiMingguanPrintDocument } from './components/AbsensiMingguanPrintDocument';
import { AbsensiBulananPrintDocument } from './components/AbsensiBulananPrintDocument';
import { JurnalPrintConfig } from './components/JurnalView';
import { AbsensiPrintConfig } from './components/AbsensiView';

type PrintType =
  | 'raport-single'
  | 'raport-batch'
  | 'leger'
  | 'rekap-nilai'
  | 'nilai-input'
  | 'jurnal'
  | 'absensi-harian'
  | 'absensi-mingguan'
  | 'absensi-bulanan';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadAppState());
  const [activeClass, setActiveClass] = useState<string>('4');
  const [activeTab, setActiveTab] = useState<string>('rekap');
  const [selectedStudentIds, setSelectedStudentIds] = useState<Record<string, string>>({});
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem('raport-tahassus-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  // Sync dark class and persist theme preference
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem('raport-tahassus-theme', theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  // Print states
  const [printType, setPrintType] = useState<PrintType>('raport-single');
  const [jurnalPrintConfig, setJurnalPrintConfig] = useState<JurnalPrintConfig>({
    entries: [],
    periodType: 'harian',
    periodLabel: ''
  });
  const [absensiPrintConfig, setAbsensiPrintConfig] = useState<AbsensiPrintConfig>({
    periodType: 'harian'
  });

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save whenever state changes
  useEffect(() => {
    saveAppState(state);
    setSavedIndicator(true);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setSavedIndicator(false);
    }, 1800);
  }, [state]);

  // Handle window afterprint to restore single raport view mode
  useEffect(() => {
    const handleAfterPrint = () => {
      setPrintType('raport-single');
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const currentClassStudents = state.classes[activeClass] || [];

  // Determine currently selected student for active class
  const currentStudentId =
    selectedStudentIds[activeClass] ||
    (currentClassStudents[0] ? currentClassStudents[0].id : '');

  const currentStudent =
    currentClassStudents.find((s) => s.id === currentStudentId) ||
    currentClassStudents[0];

  const activeClassTarget: ClassTarget =
    (state.targets && state.targets[activeClass]) ||
    DEFAULT_CLASS_TARGETS[activeClass];

  const handleSelectStudentId = (id: string) => {
    setSelectedStudentIds((prev) => ({
      ...prev,
      [activeClass]: id
    }));
  };

  const handleSelectStudentAndTab = (studentId: string, targetTab: 'raport' | 'nilai') => {
    handleSelectStudentId(studentId);
    setActiveTab(targetTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateStudent = (updated: Student) => {
    setState((prev) => {
      const classList = (prev.classes[activeClass] || []).map((s) =>
        s.id === updated.id ? updated : s
      );
      return {
        ...prev,
        classes: {
          ...prev.classes,
          [activeClass]: classList
        }
      };
    });
  };

  const handleAddStudent = (newStudentData: Omit<Student, 'id' | 's'>) => {
    const newId = `std_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const studentObj: Student = {
      id: newId,
      ...newStudentData,
      s: {}
    };

    setState((prev) => {
      const updatedClass = [...(prev.classes[activeClass] || []), studentObj];
      return {
        ...prev,
        classes: {
          ...prev.classes,
          [activeClass]: updatedClass
        }
      };
    });

    handleSelectStudentId(newId);
  };

  const handleImportStudents = (imported: ParsedImportStudent[], mode: 'append' | 'replace') => {
    const groupedByClass: Record<string, Student[]> = {};
    const stamp = Date.now();

    imported.forEach((item, idx) => {
      const targetCls =
        item.targetClass && ['1', '2', '3', '4', '5', '6'].includes(item.targetClass)
          ? item.targetClass
          : activeClass;
      const { targetClass: _ignored, ...studentFields } = item;
      if (!groupedByClass[targetCls]) {
        groupedByClass[targetCls] = [];
      }
      groupedByClass[targetCls].push({
        id: `std_imp_${stamp}_${idx}_${Math.random().toString(36).substr(2, 4)}`,
        ...studentFields,
        s: {}
      });
    });

    setState((prev) => {
      const nextClasses = { ...prev.classes };
      Object.entries(groupedByClass).forEach(([cls, list]) => {
        const existing = nextClasses[cls] || [];
        nextClasses[cls] = mode === 'replace' ? list : [...existing, ...list];
      });
      return {
        ...prev,
        classes: nextClasses
      };
    });

    const activeImported = groupedByClass[activeClass];
    if (activeImported && activeImported[0]) {
      handleSelectStudentId(activeImported[0].id);
    } else {
      const importedClassKeys = Object.keys(groupedByClass);
      if (importedClassKeys.length === 1 && groupedByClass[importedClassKeys[0]][0]) {
        setActiveClass(importedClassKeys[0]);
      }
    }
  };

  const handleDeleteStudent = (id: string) => {
    setState((prev) => {
      const updatedClass = (prev.classes[activeClass] || []).filter((s) => s.id !== id);
      return {
        ...prev,
        classes: {
          ...prev.classes,
          [activeClass]: updatedClass
        }
      };
    });
  };

  // Journal handlers
  const handleAddJournalEntry = (newEntry: Omit<JournalEntry, 'id'>) => {
    const entryObj: JournalEntry = {
      id: `j_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      ...newEntry
    };
    setState((prev) => ({
      ...prev,
      journal: [entryObj, ...(prev.journal || [])]
    }));
  };

  const handleDeleteJournalEntry = (id: string) => {
    setState((prev) => ({
      ...prev,
      journal: (prev.journal || []).filter((j) => j.id !== id)
    }));
  };

  // Attendance handlers
  const handleSaveAttendanceDay = (day: AttendanceDay) => {
    setState((prev) => {
      const existing = prev.attendance || [];
      const idx = existing.findIndex((a) => a.id === day.id);
      let updated: AttendanceDay[];
      if (idx >= 0) {
        updated = [...existing];
        updated[idx] = day;
      } else {
        updated = [day, ...existing];
      }
      return {
        ...prev,
        attendance: updated
      };
    });
  };

  const handleUpdateSchool = (updatedSchool: SchoolInfo) => {
    setState((prev) => ({
      ...prev,
      school: updatedSchool
    }));
  };

  const handleRestoreState = (restored: AppState) => {
    setState(restored);
  };

  const handleResetSeedData = () => {
    const fresh = JSON.parse(JSON.stringify(SEED_DATA)) as AppState;
    setState(fresh);
    setSelectedStudentIds({});
  };

  const handleUpdateTarget = (className: string, updatedTarget: ClassTarget) => {
    setState((prev) => ({
      ...prev,
      targets: {
        ...(prev.targets || DEFAULT_CLASS_TARGETS),
        [className]: updatedTarget
      }
    }));
  };

  const handleResetTargets = () => {
    setState((prev) => ({
      ...prev,
      targets: JSON.parse(JSON.stringify(DEFAULT_CLASS_TARGETS))
    }));
  };

  // Print triggers
  const handleTriggerSingleRaportPrint = () => {
    setPrintType('raport-single');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleTriggerBatchRaportPrint = () => {
    setPrintType('raport-batch');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handlePrintLeger = () => {
    setPrintType('leger');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handlePrintRekapNilai = () => {
    setPrintType('rekap-nilai');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handlePrintNilaiInput = () => {
    setPrintType('nilai-input');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handlePrintJurnal = (config: JurnalPrintConfig) => {
    setJurnalPrintConfig(config);
    setPrintType('jurnal');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handlePrintAbsensi = (config: AbsensiPrintConfig) => {
    setAbsensiPrintConfig(config);
    if (config.periodType === 'mingguan') {
      setPrintType('absensi-mingguan');
    } else if (config.periodType === 'bulanan') {
      setPrintType('absensi-bulanan');
    } else {
      setPrintType('absensi-harian');
    }
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col">
      {/* Left Slide Navigation Sidebar (Hidden on Print) */}
      <Sidebar
        school={state.school}
        activeClass={activeClass}
        onClassChange={setActiveClass}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        theme={theme}
        onSetTheme={setTheme}
      />

      {/* Content Shell offset when sidebar is open on desktop */}
      <div
        className={`min-h-screen flex flex-col flex-1 ${
          isSidebarOpen ? 'lg:pl-[264px]' : ''
        } print:pl-0`}
      >
        {/* App Header (Hidden on Print) */}
        <Header
          school={state.school}
          onUpdateSchool={handleUpdateSchool}
          activeClass={activeClass}
          onClassChange={setActiveClass}
          activeTab={activeTab}
          savedIndicator={savedIndicator}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          theme={theme}
          onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        />

        {/* Main Content Area (Hidden on Print) */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 no-print">
        {activeTab === 'rekap' && (
          <RekapView
            students={currentClassStudents}
            school={state.school}
            surahList={state.surah}
            activeClass={activeClass}
            allClasses={state.classes}
            target={activeClassTarget}
            onSelectStudent={handleSelectStudentAndTab}
            onSwitchClass={setActiveClass}
            onPrintLeger={handlePrintLeger}
            onPrintRekapNilai={handlePrintRekapNilai}
          />
        )}

        {activeTab === 'nilai' && (
          <NilaiView
            students={currentClassStudents}
            currentStudentId={currentStudentId}
            onSelectStudentId={handleSelectStudentId}
            surahList={state.surah}
            activeClass={activeClass}
            target={activeClassTarget}
            onUpdateStudent={handleUpdateStudent}
            onPrintNilaiInput={handlePrintNilaiInput}
          />
        )}

        {activeTab === 'jurnal' && (
          <JurnalView
            students={currentClassStudents}
            school={state.school}
            activeClass={activeClass}
            journalEntries={state.journal || []}
            surahList={state.surah}
            onAddJournalEntry={handleAddJournalEntry}
            onDeleteJournalEntry={handleDeleteJournalEntry}
            onPrintJurnal={handlePrintJurnal}
          />
        )}

        {activeTab === 'absensi' && (
          <AbsensiView
            students={currentClassStudents}
            school={state.school}
            activeClass={activeClass}
            attendanceDays={state.attendance || []}
            onSaveAttendanceDay={handleSaveAttendanceDay}
            onPrintAbsensi={handlePrintAbsensi}
          />
        )}

        {activeTab === 'siswa' && (
          <SiswaView
            students={currentClassStudents}
            activeClass={activeClass}
            onAddStudent={handleAddStudent}
            onImportStudents={handleImportStudents}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
          />
        )}

        {activeTab === 'raport' && (
          <RaportView
            students={currentClassStudents}
            currentStudentId={currentStudentId}
            onSelectStudentId={handleSelectStudentId}
            school={state.school}
            surahList={state.surah}
            activeClass={activeClass}
            target={activeClassTarget}
            onTriggerBatchPrint={handleTriggerBatchRaportPrint}
            onTriggerSinglePrint={handleTriggerSingleRaportPrint}
          />
        )}

        {activeTab === 'setelan' && (
          <SetelanView
            school={state.school}
            onUpdateSchool={handleUpdateSchool}
            fullState={state}
            onRestoreState={handleRestoreState}
            onResetSeedData={handleResetSeedData}
            targets={state.targets || DEFAULT_CLASS_TARGETS}
            onUpdateTarget={handleUpdateTarget}
            onResetTargets={handleResetTargets}
            surahList={state.surah}
          />
        )}
      </main>

      {/* PRINT-ONLY AREA:
          Renders based on printType:
          - 'raport-batch': all students' report cards
          - 'raport-single': current student report card
          - 'leger': class grade ledger
          - 'jurnal': daily mutaba'ah memorization log
          - 'absensi': daily attendance roster
      */}
      <div className="hidden print-only">
        {printType === 'raport-batch' &&
          currentClassStudents.map((s) => (
            <RaportDocument
              key={s.id}
              student={s}
              school={state.school}
              surahList={state.surah}
              className={activeClass}
              target={activeClassTarget}
            />
          ))}

        {printType === 'raport-single' && currentStudent && (
          <RaportDocument
            student={currentStudent}
            school={state.school}
            surahList={state.surah}
            className={activeClass}
            target={activeClassTarget}
          />
        )}

        {printType === 'leger' && (
          <LegerPrintDocument
            students={currentClassStudents}
            school={state.school}
            className={activeClass}
          />
        )}

        {printType === 'rekap-nilai' && (
          <RekapNilaiPrintDocument
            students={currentClassStudents}
            school={state.school}
            className={activeClass}
            target={activeClassTarget}
            surahList={state.surah}
          />
        )}

        {printType === 'nilai-input' && (
          <NilaiInputPrintDocument
            students={currentClassStudents}
            school={state.school}
            className={activeClass}
            target={activeClassTarget}
          />
        )}

        {printType === 'jurnal' && (
          <JurnalPrintDocument
            entries={jurnalPrintConfig.entries}
            school={state.school}
            className={activeClass}
            periodType={jurnalPrintConfig.periodType}
            periodLabel={jurnalPrintConfig.periodLabel}
            filterDate={jurnalPrintConfig.filterDate}
            selectedStudentName={jurnalPrintConfig.selectedStudentName}
          />
        )}

        {printType === 'absensi-harian' && absensiPrintConfig.day && (
          <AbsensiPrintDocument
            students={currentClassStudents}
            school={state.school}
            className={activeClass}
            attendanceDay={absensiPrintConfig.day}
          />
        )}

        {printType === 'absensi-mingguan' && (
          <AbsensiMingguanPrintDocument
            students={currentClassStudents}
            school={state.school}
            className={activeClass}
            baseDate={absensiPrintConfig.baseDate || new Date().toISOString().slice(0, 10)}
            attendanceDays={state.attendance || []}
          />
        )}

        {printType === 'absensi-bulanan' && (
          <AbsensiBulananPrintDocument
            students={currentClassStudents}
            school={state.school}
            className={activeClass}
            monthStr={absensiPrintConfig.monthStr || new Date().toISOString().slice(0, 7)}
            attendanceDays={state.attendance || []}
          />
        )}
      </div>

      {/* Footer (Hidden on Print) */}
      <footer className="border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 py-4 text-center text-xs text-stone-500 dark:text-stone-400 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {state.school.yayasan} · {state.school.nama} (NSM: {state.school.nsm})
          </span>
          <span className="text-stone-400 dark:text-stone-500">
            Aplikasi Raport & Jurnal Tahassus Al-Qur'an & Fashohati · Kelas 1 – 6
          </span>
        </div>
      </footer>
      </div>
    </div>
  );
}
