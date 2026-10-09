import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  AttendanceSession, 
  AttendanceStatus, 
  AttendanceCategory, 
  Member 
} from '../types';
import { formatIndoDate } from '../utils/helpers';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Users, 
  Plus, 
  Trash2, 
  QrCode, 
  Check, 
  XCircle, 
  AlertCircle,
  FileCheck2,
  Sparkles
} from 'lucide-react';

const CATEGORIES: AttendanceCategory[] = [
  'Kajian Rutin',
  'Rapat Pengurus',
  'Gotong Royong',
  'Tadarus & Tahsin',
  'Olahraga / Rihlah',
  'Kepanitiaan Event'
];

export const AttendanceView: React.FC = () => {
  const { 
    members, 
    attendanceSessions, 
    addAttendanceSession, 
    deleteAttendanceSession, 
    setMemberAttendance, 
    batchSetAttendance 
  } = useApp();

  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    attendanceSessions[0]?.id || ''
  );
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [quickNiaInput, setQuickNiaInput] = useState('');
  const [quickCheckinFeedback, setQuickCheckinFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // New session form state
  const [newSessionData, setNewSessionData] = useState({
    title: '',
    date: new Date().toISOString().slice(0, 10),
    time: '19:30 - 21:00 WIB',
    category: 'Kajian Rutin' as AttendanceCategory,
    location: 'Masjid Raya Baiturrahman',
    description: '',
  });

  const activeSession = attendanceSessions.find(s => s.id === selectedSessionId) || attendanceSessions[0];

  // Calculate attendance counters for active session
  let hadirCount = 0;
  let izinCount = 0;
  let sakitCount = 0;
  let alpaCount = 0;

  if (activeSession) {
    activeSession.records.forEach(r => {
      if (r.status === 'Hadir') hadirCount++;
      else if (r.status === 'Izin') izinCount++;
      else if (r.status === 'Sakit') sakitCount++;
      else if (r.status === 'Alpa') alpaCount++;
    });
  }

  const totalActiveRecorded = hadirCount + izinCount + sakitCount + alpaCount;
  const attendanceRate = totalActiveRecorded > 0 ? Math.round((hadirCount / totalActiveRecorded) * 100) : 0;

  // Handle Quick Scan / NIA Checkin
  const handleQuickCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) return;
    if (!quickNiaInput.trim()) return;

    const query = quickNiaInput.trim().toLowerCase();
    const foundMember = members.find(
      m => m.nia.toLowerCase() === query || 
           m.name.toLowerCase() === query || 
           m.nickname.toLowerCase() === query
    );

    if (foundMember) {
      setMemberAttendance(activeSession.id, foundMember.id, 'Hadir', 'Presensi via Scan/Cepat');
      setQuickCheckinFeedback({
        success: true,
        message: `Berhasil! ${foundMember.name} (${foundMember.nia}) tercatat HADIR.`
      });
      setQuickNiaInput('');
    } else {
      setQuickCheckinFeedback({
        success: false,
        message: `Anggota dengan kode "${quickNiaInput}" tidak ditemukan.`
      });
    }

    setTimeout(() => {
      setQuickCheckinFeedback(null);
    }, 4000);
  };

  const handleCreateSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionData.title.trim()) return;

    const created = addAttendanceSession(newSessionData);
    setSelectedSessionId(created.id);
    setIsCreatingSession(false);
    setNewSessionData({
      title: '',
      date: new Date().toISOString().slice(0, 10),
      time: '19:30 - 21:00 WIB',
      category: 'Kajian Rutin',
      location: 'Masjid Raya Baiturrahman',
      description: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Presensi & Riwayat Kehadiran Remaja Masjid
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pencatatan kehadiran kajian rutin, rapat pleno, dan agenda gotong royong dengan verifikasi presensi kilat.
            </p>
          </div>

          <button
            onClick={() => setIsCreatingSession(true)}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Agenda Presensi Baru</span>
          </button>
        </div>

        {/* Sessions Filter Strip */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500 mr-2">Pilih Pertemuan:</span>
          {attendanceSessions.map(session => (
            <button
              key={session.id}
              onClick={() => setSelectedSessionId(session.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 ${
                selectedSessionId === session.id
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{session.title.length > 25 ? session.title.slice(0, 25) + '...' : session.title}</span>
              <span className="text-[10px] opacity-75 font-mono">({session.date.slice(5)})</span>
            </button>
          ))}
        </div>
      </div>

      {activeSession ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Quick Scanner & Session Details */}
          <div className="lg:col-span-4 space-y-5">
            {/* Session Info Box */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    {activeSession.category}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mt-2">
                    {activeSession.title}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('Hapus sesi presensi ini?')) {
                      deleteAttendanceSession(activeSession.id);
                    }
                  }}
                  title="Hapus Agenda Ini"
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-600 space-y-2 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>{formatIndoDate(activeSession.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>{activeSession.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 text-emerald-700 font-bold shrink-0">📍</span>
                  <span>{activeSession.location}</span>
                </div>
              </div>

              {activeSession.description && (
                <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                  "{activeSession.description}"
                </p>
              )}

              {/* Attendance Breakdown Metrics */}
              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-700">Persentase Hadir</span>
                  <span className="text-sm font-bold text-emerald-700 tabular-nums">{attendanceRate}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                  <div style={{ width: `${attendanceRate}%` }} className="bg-emerald-600 h-full" />
                </div>

                <div className="grid grid-cols-4 gap-2 mt-3 text-center text-[11px]">
                  <div className="bg-emerald-50 text-emerald-800 p-2 rounded-lg font-bold">
                    <p className="text-xs tabular-nums">{hadirCount}</p>
                    <p className="text-[10px] font-normal">Hadir</p>
                  </div>
                  <div className="bg-amber-50 text-amber-800 p-2 rounded-lg font-bold">
                    <p className="text-xs tabular-nums">{izinCount}</p>
                    <p className="text-[10px] font-normal">Izin</p>
                  </div>
                  <div className="bg-sky-50 text-sky-800 p-2 rounded-lg font-bold">
                    <p className="text-xs tabular-nums">{sakitCount}</p>
                    <p className="text-[10px] font-normal">Sakit</p>
                  </div>
                  <div className="bg-rose-50 text-rose-800 p-2 rounded-lg font-bold">
                    <p className="text-xs tabular-nums">{alpaCount}</p>
                    <p className="text-[10px] font-normal">Alpa</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Check-in via Barcode / QR / NIA */}
            <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-300" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-amber-300">
                  Presensi Kilat (Scan / Input NIA)
                </h4>
              </div>
              <p className="text-[11px] text-slate-300">
                Gunakan scanner barcode KTA atau ketikkan nomor NIA anggota (e.g. <code>RM-2024-001</code>) untuk check-in instan.
              </p>

              <form onSubmit={handleQuickCheckin} className="space-y-2">
                <input
                  type="text"
                  value={quickNiaInput}
                  onChange={(e) => setQuickNiaInput(e.target.value)}
                  placeholder="Ketik NIA atau scan QR..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Proses Check-in Hadir
                </button>
              </form>

              {quickCheckinFeedback && (
                <div className={`p-2.5 rounded-lg text-xs ${
                  quickCheckinFeedback.success
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {quickCheckinFeedback.message}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Attendance Records Sheet */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Lembar Daftar Hadir Anggota
                </h3>
                <p className="text-xs text-slate-500">
                  Klik status untuk memperbarui kehadiran anggota secara langsung.
                </p>
              </div>

              {/* Batch shortcuts */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => batchSetAttendance(activeSession.id, 'Hadir')}
                  className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  ✓ Hadir Semua
                </button>
                <button
                  onClick={() => batchSetAttendance(activeSession.id, 'Alpa')}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  Reset Status
                </button>
              </div>
            </div>

            {/* Table of Members */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                    <th className="py-2.5 px-4">Nama Anggota</th>
                    <th className="py-2.5 px-3">NIA & Divisi</th>
                    <th className="py-2.5 px-3 text-center">Status Kehadiran</th>
                    <th className="py-2.5 px-4">Catatan / Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.map(member => {
                    const record = activeSession.records.find(r => r.memberId === member.id);
                    const currentStatus: AttendanceStatus = record ? record.status : 'Alpa';

                    return (
                      <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={member.photoUrl}
                              alt={member.name}
                              referrerPolicy="no-referrer"
                              className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            <div>
                              <p className="font-semibold text-slate-900 leading-tight">
                                {member.name}
                              </p>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {member.role}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-2.5 px-3">
                          <p className="font-mono text-slate-600 font-medium">{member.nia}</p>
                          <p className="text-[10px] text-slate-400">{member.division}</p>
                        </td>

                        <td className="py-2.5 px-3 text-center">
                          {/* Segmented status buttons */}
                          <div className="inline-flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                            {(['Hadir', 'Izin', 'Sakit', 'Alpa'] as AttendanceStatus[]).map(status => {
                              const isSelected = currentStatus === status;
                              let activeClass = '';
                              if (isSelected) {
                                if (status === 'Hadir') activeClass = 'bg-emerald-600 text-white font-bold shadow-xs';
                                else if (status === 'Izin') activeClass = 'bg-amber-500 text-white font-bold shadow-xs';
                                else if (status === 'Sakit') activeClass = 'bg-sky-500 text-white font-bold shadow-xs';
                                else if (status === 'Alpa') activeClass = 'bg-rose-500 text-white font-bold shadow-xs';
                              } else {
                                activeClass = 'text-slate-500 hover:text-slate-900';
                              }

                              return (
                                <button
                                  key={status}
                                  onClick={() => setMemberAttendance(activeSession.id, member.id, status)}
                                  className={`px-2 py-1 text-[11px] rounded transition-all cursor-pointer ${activeClass}`}
                                >
                                  {status}
                                </button>
                              );
                            })}
                          </div>
                        </td>

                        <td className="py-2.5 px-4 text-slate-500">
                          {record?.timestamp && (
                            <span className="font-mono text-[10px] text-slate-400 mr-2">
                              {record.timestamp}
                            </span>
                          )}
                          <input
                            type="text"
                            defaultValue={record?.note || ''}
                            onBlur={(e) => {
                              setMemberAttendance(activeSession.id, member.id, currentStatus, e.target.value);
                            }}
                            placeholder="Tulis keterangan..."
                            className="bg-transparent hover:bg-slate-50 focus:bg-white px-2 py-1 rounded border border-transparent focus:border-slate-300 text-xs w-36 focus:w-48 transition-all"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
          Belum ada sesi presensi tersimpan. Klik tombol di atas untuk membuat agenda kajian/rapat pertama.
        </div>
      )}

      {/* Create New Session Modal */}
      {isCreatingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Buat Agenda Presensi Baru
            </h3>

            <form onSubmit={handleCreateSessionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Judul Pertemuan / Agenda *
                </label>
                <input
                  type="text"
                  required
                  value={newSessionData.title}
                  onChange={(e) => setNewSessionData({ ...newSessionData, title: e.target.value })}
                  placeholder="Contoh: Kajian Rutin Malam Ahad / Rapat Pleno"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={newSessionData.category}
                    onChange={(e) => setNewSessionData({ ...newSessionData, category: e.target.value as AttendanceCategory })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={newSessionData.date}
                    onChange={(e) => setNewSessionData({ ...newSessionData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Waktu</label>
                  <input
                    type="text"
                    value={newSessionData.time}
                    onChange={(e) => setNewSessionData({ ...newSessionData, time: e.target.value })}
                    placeholder="19:30 - 21:00 WIB"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lokasi</label>
                  <input
                    type="text"
                    value={newSessionData.location}
                    onChange={(e) => setNewSessionData({ ...newSessionData, location: e.target.value })}
                    placeholder="Ruang Utama Masjid"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi / Tema Kajian</label>
                <textarea
                  rows={2}
                  value={newSessionData.description}
                  onChange={(e) => setNewSessionData({ ...newSessionData, description: e.target.value })}
                  placeholder="Keterangan singkat materi atau topik rapat..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingSession(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shadow-xs"
                >
                  Simpan & Buka Presensi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
