import React, { useState } from 'react';
import { Student, SchoolInfo, ClassTarget } from '../types';
import { RaportDocument } from './RaportDocument';
import { generateAndDownloadPdf } from '../utils/pdfGenerator';
import {
  Printer,
  Download,
  ChevronLeft,
  ChevronRight,
  Layers,
  FileCheck
} from 'lucide-react';

interface RaportViewProps {
  students: Student[];
  currentStudentId: string;
  onSelectStudentId: (id: string) => void;
  school: SchoolInfo;
  surahList: string[];
  activeClass: string;
  target?: ClassTarget;
  onTriggerBatchPrint: () => void;
}

export const RaportView: React.FC<RaportViewProps> = ({
  students,
  currentStudentId,
  onSelectStudentId,
  school,
  surahList,
  activeClass,
  target,
  onTriggerBatchPrint
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const currentIndex = students.findIndex((s) => s.id === currentStudentId);
  const currentStudent = students[currentIndex] || students[0];

  if (!currentStudent) {
    return (
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-12 text-center text-stone-500 dark:text-stone-400">
        Kelas {activeClass} belum memiliki siswa.
      </div>
    );
  }

  const handlePrev = () => {
    const prevIdx = (currentIndex - 1 + students.length) % students.length;
    onSelectStudentId(students[prevIdx].id);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % students.length;
    onSelectStudentId(students[nextIdx].id);
  };

  const handlePrintSingle = () => {
    window.print();
  };

  const handleDownloadSinglePdf = async () => {
    try {
      setIsGeneratingPdf(true);
      setStatusMessage('Menyiapkan file PDF...');
      await generateAndDownloadPdf(
        [currentStudent],
        school,
        surahList,
        activeClass,
        `Raport_${currentStudent.nama.replace(/[^A-Za-z0-9]+/g, '_')}.pdf`,
        target
      );
      setStatusMessage('PDF berhasil diunduh.');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setStatusMessage('Gagal membuat PDF. Silakan gunakan tombol Cetak.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadClassPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      setStatusMessage(`Menyiapkan PDF seluruh Kelas ${activeClass} (${students.length} halaman)...`);
      await generateAndDownloadPdf(
        students,
        school,
        surahList,
        activeClass,
        `Raport_Tahassus_Kelas_${activeClass}_Lengkap.pdf`,
        target
      );
      setStatusMessage(`PDF ${students.length} siswa siap dicetak.`);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setStatusMessage('Gagal membuat PDF gabungan.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Control bar */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 sm:p-5 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 no-print">
        {/* Student picker */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            title="Siswa Sebelumnya"
            className="p-2 border border-stone-200 dark:border-stone-700 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer text-stone-700 dark:text-stone-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <select
            value={currentStudent.id}
            onChange={(e) => onSelectStudentId(e.target.value)}
            className="py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-semibold text-xs sm:text-sm focus:outline-emerald-700 min-w-[220px] max-w-sm"
          >
            {students.map((s, idx) => (
              <option key={s.id} value={s.id}>
                {idx + 1}. {s.nama}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleNext}
            title="Siswa Berikutnya"
            className="p-2 border border-stone-200 dark:border-stone-700 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer text-stone-700 dark:text-stone-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Print Single */}
          <button
            type="button"
            onClick={handlePrintSingle}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Raport Ini</span>
          </button>

          {/* Download Single PDF */}
          <button
            type="button"
            disabled={isGeneratingPdf}
            onClick={handleDownloadSinglePdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded-xl transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
            <span>Unduh PDF (.pdf)</span>
          </button>

          {/* Batch Print All */}
          <button
            type="button"
            onClick={onTriggerBatchPrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition-colors cursor-pointer"
            title="Cetak seluruh siswa kelas ini sekaligus"
          >
            <Layers className="w-4 h-4" />
            <span>Cetak Seluruh Kelas</span>
          </button>

          {/* Download Class PDF */}
          <button
            type="button"
            disabled={isGeneratingPdf}
            onClick={handleDownloadClassPdf}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            title="Unduh seluruh raport kelas ini dalam 1 berkas PDF"
          >
            <FileCheck className="w-4 h-4" />
            <span>Unduh PDF Kelas</span>
          </button>
        </div>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 no-print">
          <span className="font-semibold">{statusMessage}</span>
        </div>
      )}

      {/* Document Viewport Wrapper */}
      <div className="overflow-x-auto pb-8 pt-2">
        <div className="min-w-[760px] flex justify-center">
          <RaportDocument
            student={currentStudent}
            school={school}
            surahList={surahList}
            className={activeClass}
            target={target}
          />
        </div>
      </div>
    </div>
  );
};
