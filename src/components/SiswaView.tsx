import React, { useState } from 'react';
import { Student } from '../types';
import { JILID_OPTIONS } from '../data/seedData';
import { exportClassToCsv } from '../utils/storage';
import { UploadSiswaModal } from './UploadSiswaModal';
import { UserPlus, Trash2, Download, Search, Users, Upload } from 'lucide-react';

interface SiswaViewProps {
  students: Student[];
  activeClass: string;
  onAddStudent: (newStudent: Omit<Student, 'id' | 's'>) => void;
  onImportStudents: (imported: Omit<Student, 'id' | 's'>[], mode: 'append' | 'replace') => void;
  onUpdateStudent: (updated: Student) => void;
  onDeleteStudent: (id: string) => void;
}

export const SiswaView: React.FC<SiswaViewProps> = ({
  students,
  activeClass,
  onAddStudent,
  onImportStudents,
  onUpdateStudent,
  onDeleteStudent
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [armedDeleteId, setArmedDeleteId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // New Student form state
  const [newNama, setNewNama] = useState('');
  const [newNisn, setNewNisn] = useState('');
  const [newJk, setNewJk] = useState<'L' | 'P'>('L');
  const [newOrtu, setNewOrtu] = useState('');
  const [newJilid, setNewJilid] = useState('');
  const [newHafalan, setNewHafalan] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  const maleCount = students.filter((s) => s.jk === 'L').length;
  const femaleCount = students.filter((s) => s.jk === 'P').length;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama.trim()) return;

    onAddStudent({
      nama: newNama.trim().toUpperCase(),
      nisn: newNisn.trim() || '-',
      jk: newJk,
      ortu: newOrtu.trim() || '-',
      jilid: newJilid,
      hafalan: newHafalan.trim() || '-'
    });

    setNewNama('');
    setNewNisn('');
    setNewOrtu('');
    setNewJilid('');
    setNewHafalan('');
    setFormOpen(false);
  };

  const handleDeleteClick = (id: string) => {
    if (armedDeleteId === id) {
      onDeleteStudent(id);
      setArmedDeleteId(null);
    } else {
      setArmedDeleteId(id);
      setTimeout(() => {
        setArmedDeleteId((cur) => (cur === id ? null : cur));
      }, 4000);
    }
  };

  const q = (searchQuery || '').toLowerCase().trim();
  const filteredStudents = students.filter((s) => {
    const nama = (s.nama || '').toLowerCase();
    const nisn = (s.nisn || '').toLowerCase();
    return nama.includes(q) || nisn.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Upload Siswa Modal */}
      <UploadSiswaModal
        className={activeClass}
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onImport={onImportStudents}
      />

      {/* Top action & stat strip */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Gender summary stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-stone-900 px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs text-xs font-semibold text-stone-800 dark:text-stone-200">
            <Users className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Total: {students.length} Siswa</span>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-stone-900 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs text-xs text-stone-600 dark:text-stone-400">
            <span>Laki-laki: <b className="text-stone-900 dark:text-stone-100">{maleCount}</b></span>
            <span>·</span>
            <span>Perempuan: <b className="text-stone-900 dark:text-stone-100">{femaleCount}</b></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800 rounded-xl transition-colors cursor-pointer shadow-2xs"
            title="Import daftar siswa dari file CSV atau Excel"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Siswa (Excel/CSV)</span>
          </button>

          <button
            type="button"
            onClick={() => setFormOpen(!formOpen)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>{formOpen ? 'Tutup Formulir' : 'Tambah Manual'}</span>
          </button>

          <button
            type="button"
            onClick={() => exportClassToCsv(students, activeClass)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Add Student Card (Collapsible) */}
      {formOpen && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-emerald-300 dark:border-emerald-800 shadow-sm">
          <div className="mb-4">
            <h2 className="font-display font-bold text-base text-stone-900 dark:text-stone-100">
              Tambah Siswa Baru ke Kelas {activeClass}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Lengkapi data identitas siswa. Data akan langsung terhubung ke raport dan lembar penilaian.
            </p>
          </div>

          <form onSubmit={handleAddSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label htmlFor="new-nama" className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                Nama Lengkap Siswa *
              </label>
              <input
                id="new-nama"
                type="text"
                required
                placeholder="mis. AHMAD FAUZI"
                value={newNama}
                onChange={(e) => setNewNama(e.target.value)}
                className="w-full py-2 px-3 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 rounded-xl focus:outline-emerald-700 dark:focus:outline-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="new-nisn" className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                NISN (10 Digit)
              </label>
              <input
                id="new-nisn"
                type="text"
                placeholder="mis. 3160788180"
                value={newNisn}
                onChange={(e) => setNewNisn(e.target.value)}
                className="w-full py-2 px-3 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 rounded-xl focus:outline-emerald-700 dark:focus:outline-emerald-500 font-mono"
              />
            </div>

            <div>
              <label htmlFor="new-jk" className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                Jenis Kelamin
              </label>
              <select
                id="new-jk"
                value={newJk}
                onChange={(e) => setNewJk(e.target.value as 'L' | 'P')}
                className="w-full py-2 px-3 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:outline-emerald-700 dark:focus:outline-emerald-500"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>

            <div>
              <label htmlFor="new-ortu" className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                Nama Orang Tua / Wali
              </label>
              <input
                id="new-ortu"
                type="text"
                placeholder="mis. ABDUL AZIZ"
                value={newOrtu}
                onChange={(e) => setNewOrtu(e.target.value)}
                className="w-full py-2 px-3 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 rounded-xl focus:outline-emerald-700 dark:focus:outline-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="new-jilid" className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                Jilid Fashohati/Qiroati
              </label>
              <select
                id="new-jilid"
                value={newJilid}
                onChange={(e) => setNewJilid(e.target.value)}
                className="w-full py-2 px-3 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:outline-emerald-700 dark:focus:outline-emerald-500"
              >
                {JILID_OPTIONS.map((j) => (
                  <option key={j} value={j}>
                    {j || '– Pilih Jilid –'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="new-hafalan" className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                Hafalan Terakhir
              </label>
              <input
                id="new-hafalan"
                type="text"
                placeholder="mis. Al-A'la"
                value={newHafalan}
                onChange={(e) => setNewHafalan(e.target.value)}
                className="w-full py-2 px-3 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 rounded-xl focus:outline-emerald-700 dark:focus:outline-emerald-500"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 rounded-xl cursor-pointer shadow-xs"
              >
                Simpan Siswa
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Student List Table with Inline Edit */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="font-display font-bold text-base text-stone-900 dark:text-stone-100">
              Daftar Siswa Kelas {activeClass} ({students.length} Siswa)
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Kolom nama, NISN, orang tua, dan jilid dapat diedit langsung di tabel ini.
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari siswa atau NISN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 rounded-xl focus:outline-emerald-700 dark:focus:outline-emerald-500 w-52 sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 dark:bg-stone-800/80 text-stone-600 dark:text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-200 dark:border-stone-800 font-semibold">
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3 min-w-[200px]">Nama Siswa</th>
                <th className="py-2.5 px-3 w-32">NISN</th>
                <th className="py-2.5 px-3 w-28">Jenis Kelamin</th>
                <th className="py-2.5 px-3 min-w-[160px]">Nama Orang Tua</th>
                <th className="py-2.5 px-3 w-32">Jilid</th>
                <th className="py-2.5 px-3 min-w-[130px]">Hafalan Terakhir</th>
                <th className="py-2.5 px-3 w-20 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s, idx) => {
                  const isArmed = armedDeleteId === s.id;
                  return (
                    <tr key={s.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/50 transition-colors">
                      <td className="py-2 px-3 text-center text-stone-400 dark:text-stone-500 font-mono">
                        {idx + 1}
                      </td>

                      {/* Nama Siswa */}
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={s.nama}
                          onChange={(e) =>
                            onUpdateStudent({
                              ...s,
                              nama: e.target.value.toUpperCase()
                            })
                          }
                          className="w-full py-1 px-2 font-semibold text-stone-900 dark:text-stone-100 bg-transparent hover:bg-stone-100 dark:hover:bg-stone-800 focus:bg-white dark:focus:bg-stone-950 rounded border border-transparent hover:border-stone-200 dark:hover:border-stone-700 focus:border-emerald-600 dark:focus:border-emerald-500 focus:outline-none transition-colors"
                        />
                      </td>

                      {/* NISN */}
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={s.nisn}
                          onChange={(e) =>
                            onUpdateStudent({
                              ...s,
                              nisn: e.target.value
                            })
                          }
                          className="w-full py-1 px-2 font-mono text-stone-600 dark:text-stone-300 bg-transparent hover:bg-stone-100 dark:hover:bg-stone-800 focus:bg-white dark:focus:bg-stone-950 rounded border border-transparent hover:border-stone-200 dark:hover:border-stone-700 focus:border-emerald-600 dark:focus:border-emerald-500 focus:outline-none transition-colors"
                        />
                      </td>

                      {/* JK */}
                      <td className="py-2 px-3">
                        <select
                          value={s.jk}
                          onChange={(e) =>
                            onUpdateStudent({
                              ...s,
                              jk: e.target.value as 'L' | 'P'
                            })
                          }
                          className="py-1 px-2 text-xs rounded border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 focus:outline-emerald-700 dark:focus:outline-emerald-500"
                        >
                          <option value="L">Laki-laki (L)</option>
                          <option value="P">Perempuan (P)</option>
                        </select>
                      </td>

                      {/* Orang Tua */}
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={s.ortu}
                          onChange={(e) =>
                            onUpdateStudent({
                              ...s,
                              ortu: e.target.value
                            })
                          }
                          className="w-full py-1 px-2 text-stone-700 dark:text-stone-300 bg-transparent hover:bg-stone-100 dark:hover:bg-stone-800 focus:bg-white dark:focus:bg-stone-950 rounded border border-transparent hover:border-stone-200 dark:hover:border-stone-700 focus:border-emerald-600 dark:focus:border-emerald-500 focus:outline-none transition-colors"
                        />
                      </td>

                      {/* Jilid */}
                      <td className="py-2 px-3">
                        <select
                          value={s.jilid || ''}
                          onChange={(e) =>
                            onUpdateStudent({
                              ...s,
                              jilid: e.target.value
                            })
                          }
                          className="w-full py-1 px-2 text-xs rounded border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 focus:outline-emerald-700 dark:focus:outline-emerald-500"
                        >
                          {JILID_OPTIONS.map((j) => (
                            <option key={j} value={j}>
                              {j || '–'}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Hafalan Terakhir */}
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={s.hafalan || ''}
                          onChange={(e) =>
                            onUpdateStudent({
                              ...s,
                              hafalan: e.target.value
                            })
                          }
                          placeholder="mis. Al-A'la"
                          className="w-full py-1 px-2 text-stone-700 dark:text-stone-300 placeholder:text-stone-400 dark:placeholder:text-stone-600 bg-transparent hover:bg-stone-100 dark:hover:bg-stone-800 focus:bg-white dark:focus:bg-stone-950 rounded border border-transparent hover:border-stone-200 dark:hover:border-stone-700 focus:border-emerald-600 dark:focus:border-emerald-500 focus:outline-none transition-colors"
                        />
                      </td>

                      {/* Delete Action */}
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(s.id)}
                          className={`px-2 py-1 text-[11px] rounded font-semibold transition-all cursor-pointer ${
                            isArmed
                              ? 'bg-rose-600 text-white animate-pulse'
                              : 'text-stone-400 dark:text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50'
                          }`}
                          title={isArmed ? 'Klik sekali lagi untuk menghapus' : 'Hapus Siswa'}
                        >
                          {isArmed ? (
                            'Yakin?'
                          ) : (
                            <Trash2 className="w-4 h-4 inline-block" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400 dark:text-stone-500 italic">
                    Belum ada siswa yang cocok dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
