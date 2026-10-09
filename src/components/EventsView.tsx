import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MosqueEvent, EventRole, EventStatus } from '../types';
import { formatIndoDate, formatRupiah } from '../utils/helpers';
import { 
  Calendar, 
  Plus, 
  Users, 
  MapPin, 
  Trash2, 
  UserPlus, 
  Tag, 
  CheckCircle2, 
  Clock, 
  DollarSign,
  Award
} from 'lucide-react';

const EVENT_ROLES: EventRole[] = [
  'Ketua Panitia',
  'Sekretaris',
  'Bendahara',
  'Koordinator Sie',
  'Anggota Panitia',
  'Peserta',
  'Relawan',
  'Pengisi Acara / Qari'
];

export const EventsView: React.FC = () => {
  const { 
    events, 
    members, 
    addEvent, 
    deleteEvent, 
    assignEventParticipant, 
    removeEventParticipant 
  } = useApp();

  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [isAssigningMember, setIsAssigningMember] = useState(false);

  // New Event Form State
  const [newEventData, setNewEventData] = useState({
    title: '',
    category: 'Syiar & Dakwah' as MosqueEvent['category'],
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    status: 'Akan Datang' as EventStatus,
    budget: 5000000,
    description: '',
    location: 'Masjid Raya Baiturrahman',
  });

  // Assign Member Form State
  const [assignData, setAssignData] = useState({
    memberId: members[0]?.id || '',
    roleInEvent: 'Anggota Panitia' as EventRole,
    divisionSie: 'Sie Acara',
    note: '',
  });

  const activeEvent = events.find(e => e.id === selectedEventId) || events[0];

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventData.title.trim()) return;

    const created = addEvent(newEventData);
    setSelectedEventId(created.id);
    setIsCreatingEvent(false);
    setNewEventData({
      title: '',
      category: 'Syiar & Dakwah',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date().toISOString().slice(0, 10),
      status: 'Akan Datang',
      budget: 5000000,
      description: '',
      location: 'Masjid Raya Baiturrahman',
    });
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent || !assignData.memberId) return;

    assignEventParticipant(activeEvent.id, {
      memberId: assignData.memberId,
      roleInEvent: assignData.roleInEvent,
      divisionSie: assignData.divisionSie,
      note: assignData.note,
    });

    setIsAssigningMember(false);
    setAssignData({
      memberId: members[0]?.id || '',
      roleInEvent: 'Anggota Panitia',
      divisionSie: 'Sie Acara',
      note: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Partisipasi & Manajemen Kegiatan Masjid
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola program kerja tahunan, penugasan panitia pelaksana, dan rekam jejak kontribusi anggota.
            </p>
          </div>

          <button
            onClick={() => setIsCreatingEvent(true)}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Program / Event</span>
          </button>
        </div>

        {/* Event Tabs */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
          {events.map(evt => {
            const isSelected = activeEvent?.id === evt.id;
            return (
              <button
                key={evt.id}
                onClick={() => setSelectedEventId(evt.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{evt.title.length > 28 ? evt.title.slice(0, 28) + '...' : evt.title}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                  evt.status === 'Selesai' ? 'bg-slate-700 text-slate-200' : 'bg-emerald-700 text-emerald-100'
                }`}>
                  {evt.status}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {activeEvent ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Event Overview Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    {activeEvent.category}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mt-2">
                    {activeEvent.title}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('Hapus kegiatan ini?')) {
                      deleteEvent(activeEvent.id);
                    }
                  }}
                  title="Hapus Event"
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-600 space-y-2 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>
                    {formatIndoDate(activeEvent.startDate)}
                    {activeEvent.endDate !== activeEvent.startDate && ` s/d ${formatIndoDate(activeEvent.endDate)}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>{activeEvent.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 text-emerald-700 font-bold shrink-0">💵</span>
                  <span>Anggaran: <strong className="text-slate-900">{formatRupiah(activeEvent.budget)}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 text-emerald-700 font-bold shrink-0">📌</span>
                  <span>Status: <strong className="text-emerald-800">{activeEvent.status}</strong></span>
                </div>
              </div>

              {activeEvent.description && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-600">
                  <p className="font-semibold text-slate-700 mb-0.5">Deskripsi Program:</p>
                  <p>{activeEvent.description}</p>
                </div>
              )}

              <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Panitia & Peserta Terdaftar:</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {activeEvent.participants.length} Orang
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Committee & Participants List */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Struktur Kepanitiaan & Kontributor
                </h3>
                <p className="text-xs text-slate-500">
                  Daftar anggota yang bertugas dan berpartisipasi pada kegiatan ini.
                </p>
              </div>

              <button
                onClick={() => setIsAssigningMember(true)}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Tugaskan Anggota</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                    <th className="py-2.5 px-4">Nama Anggota</th>
                    <th className="py-2.5 px-3">Peran / Amanah</th>
                    <th className="py-2.5 px-3">Seksi / Divisi</th>
                    <th className="py-2.5 px-3">Catatan</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeEvent.participants.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                        Belum ada anggota yang ditugaskan ke kegiatan ini. Klik "+ Tugaskan Anggota".
                      </td>
                    </tr>
                  ) : (
                    activeEvent.participants.map(part => {
                      const memberObj = members.find(m => m.id === part.memberId);
                      if (!memberObj) return null;

                      return (
                        <tr key={part.memberId} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={memberObj.photoUrl}
                                alt={memberObj.name}
                                referrerPolicy="no-referrer"
                                className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                              <div>
                                <p className="font-semibold text-slate-900 leading-tight">
                                  {memberObj.name}
                                </p>
                                <span className="font-mono text-[10px] text-slate-400">
                                  {memberObj.nia}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                              {part.roleInEvent}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-slate-700">
                            {part.divisionSie || '-'}
                          </td>

                          <td className="py-3 px-3 text-slate-500 italic max-w-xs truncate">
                            {part.note || '-'}
                          </td>

                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => removeEventParticipant(activeEvent.id, part.memberId)}
                              title="Hapus dari kepanitiaan"
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
          Belum ada data kegiatan tersimpan.
        </div>
      )}

      {/* Assign Member Modal */}
      {isAssigningMember && activeEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Tugaskan Anggota ke "{activeEvent.title}"
            </h3>

            <form onSubmit={handleAssignSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Anggota *
                </label>
                <select
                  value={assignData.memberId}
                  onChange={(e) => setAssignData({ ...assignData, memberId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.nia} - {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Peran / Amanah dalam Acara *
                </label>
                <select
                  value={assignData.roleInEvent}
                  onChange={(e) => setAssignData({ ...assignData, roleInEvent: e.target.value as EventRole })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
                >
                  {EVENT_ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Sie / Divisi Kepanitiaan
                </label>
                <input
                  type="text"
                  value={assignData.divisionSie}
                  onChange={(e) => setAssignData({ ...assignData, divisionSie: e.target.value })}
                  placeholder="Contoh: Sie Acara / Sie Konsumsi / Sie Logistik"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan Tugas / Tanggung Jawab
                </label>
                <input
                  type="text"
                  value={assignData.note}
                  onChange={(e) => setAssignData({ ...assignData, note: e.target.value })}
                  placeholder="Contoh: Koordinator pemesanan konsumsi & snack"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssigningMember(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                >
                  Simpan Penugasan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {isCreatingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Tambah Kegiatan / Program Kerja Baru
            </h3>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Kegiatan / Event *
                </label>
                <input
                  type="text"
                  required
                  value={newEventData.title}
                  onChange={(e) => setNewEventData({ ...newEventData, title: e.target.value })}
                  placeholder="Contoh: Peringatan Isra Mi'raj & Khitanan Massal"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={newEventData.category}
                    onChange={(e) => setNewEventData({ ...newEventData, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
                  >
                    <option value="Syiar & Dakwah">Syiar & Dakwah</option>
                    <option value="Sosial Kemasyarakatan">Sosial Kemasyarakatan</option>
                    <option value="Kaderisasi & Pelatihan">Kaderisasi & Pelatihan</option>
                    <option value="Hari Besar Islam">Hari Besar Islam</option>
                    <option value="Rihlah & Kebersamaan">Rihlah & Kebersamaan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Kegiatan</label>
                  <select
                    value={newEventData.status}
                    onChange={(e) => setNewEventData({ ...newEventData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
                  >
                    <option value="Akan Datang">Akan Datang</option>
                    <option value="Sedang Berlangsung">Sedang Berlangsung</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={newEventData.startDate}
                    onChange={(e) => setNewEventData({ ...newEventData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={newEventData.endDate}
                    onChange={(e) => setNewEventData({ ...newEventData, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimasi Anggaran (Rp)</label>
                  <input
                    type="number"
                    value={newEventData.budget}
                    onChange={(e) => setNewEventData({ ...newEventData, budget: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lokasi</label>
                  <input
                    type="text"
                    value={newEventData.location}
                    onChange={(e) => setNewEventData({ ...newEventData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi Kegiatan</label>
                <textarea
                  rows={2}
                  value={newEventData.description}
                  onChange={(e) => setNewEventData({ ...newEventData, description: e.target.value })}
                  placeholder="Keterangan tujuan, sasaran peserta, dan rencana teknis..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingEvent(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                >
                  Simpan Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
