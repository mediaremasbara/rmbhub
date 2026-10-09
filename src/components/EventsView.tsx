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
  TrendingUp,
  Receipt,
  Wallet,
  PiggyBank,
  History,
  AlertCircle,
  PlusCircle,
  Edit2,
  X
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
    updateEvent,
    deleteEvent, 
    assignEventParticipant, 
    removeEventParticipant 
  } = useApp();

  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [isAssigningMember, setIsAssigningMember] = useState(false);
  const [isUpdatingFunds, setIsUpdatingFunds] = useState(false);
  const [isEditingEvent, setIsEditingEvent] = useState(false);

  // New Event Form State
  const [newEventData, setNewEventData] = useState({
    title: '',
    category: 'Syiar & Dakwah' as MosqueEvent['category'],
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    status: 'Akan Datang' as EventStatus,
    budget: 5000000,
    collectedFunds: 0,
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

  // Funds Update Form State
  const [fundUpdateMode, setFundUpdateMode] = useState<'add' | 'set'>('add');
  const [fundAmountInput, setFundAmountInput] = useState<number>(500000);
  const [fundDateInput, setFundDateInput] = useState<string>(new Date().toISOString().slice(0, 10));
  const [fundNoteInput, setFundNoteInput] = useState<string>('Infaq & Donasi Jamaah');

  // Edit Event State
  const [editFormData, setEditFormData] = useState<MosqueEvent | null>(null);

  const activeEvent = events.find(e => e.id === selectedEventId) || events[0];

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventData.title.trim()) return;

    const initialHistory = newEventData.collectedFunds > 0 ? [
      {
        id: `fh-${Date.now()}`,
        date: newEventData.startDate,
        amount: newEventData.collectedFunds,
        type: 'add' as const,
        note: 'Saldo Awal Kas / Kas Kegiatan',
        newTotal: newEventData.collectedFunds,
      }
    ] : [];

    const created = addEvent({
      ...newEventData,
      fundHistory: initialHistory,
    });

    setSelectedEventId(created.id);
    setIsCreatingEvent(false);
    setNewEventData({
      title: '',
      category: 'Syiar & Dakwah',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date().toISOString().slice(0, 10),
      status: 'Akan Datang',
      budget: 5000000,
      collectedFunds: 0,
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

  const handleOpenFundModal = () => {
    if (!activeEvent) return;
    setFundUpdateMode('add');
    setFundAmountInput(1000000);
    setFundDateInput(new Date().toISOString().slice(0, 10));
    setFundNoteInput('Infaq Kotak Amal / Donatur Jamaah');
    setIsUpdatingFunds(true);
  };

  const handleSaveFundUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent) return;

    const currentTotal = activeEvent.collectedFunds || 0;
    let newTotal = currentTotal;

    if (fundUpdateMode === 'add') {
      newTotal = currentTotal + Number(fundAmountInput);
    } else {
      newTotal = Math.max(0, Number(fundAmountInput));
    }

    const newHistoryEntry = {
      id: `fh-${Date.now()}`,
      date: fundDateInput,
      amount: Number(fundAmountInput),
      type: fundUpdateMode,
      note: fundNoteInput || (fundUpdateMode === 'add' ? 'Pemasukan Kas' : 'Penyesuaian Saldo'),
      newTotal: newTotal,
    };

    const updatedHistory = [newHistoryEntry, ...(activeEvent.fundHistory || [])];

    updateEvent({
      ...activeEvent,
      collectedFunds: newTotal,
      fundHistory: updatedHistory,
    });

    setIsUpdatingFunds(false);
  };

  const handleDeleteHistoryEntry = (entryId: string) => {
    if (!activeEvent || !activeEvent.fundHistory) return;
    const filtered = activeEvent.fundHistory.filter(h => h.id !== entryId);
    
    // Recalculate latest total from remaining entries
    let recalcTotal = 0;
    if (filtered.length > 0) {
      recalcTotal = filtered[0].newTotal;
    }

    updateEvent({
      ...activeEvent,
      collectedFunds: recalcTotal,
      fundHistory: filtered,
    });
  };

  const handleStartEdit = () => {
    if (!activeEvent) return;
    setEditFormData({ ...activeEvent });
    setIsEditingEvent(true);
  };

  const handleSaveEditEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData) return;
    updateEvent(editFormData);
    setIsEditingEvent(false);
  };

  const collected = activeEvent?.collectedFunds || 0;
  const budget = activeEvent?.budget || 1;
  const progressPercent = Math.min(100, Math.round((collected / budget) * 100));
  const sisaKekurangan = Math.max(0, budget - collected);
  const isTargetAchieved = collected >= budget;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Partisipasi & Manajemen Kegiatan Masjid</span>
              <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                {events.length} Program
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola program kerja tahunan, penugasan panitia pelaksana, dan update berkala realisasi pengumpulan dana kegiatan.
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
            const evtCollected = evt.collectedFunds || 0;
            const evtPercent = Math.round((evtCollected / (evt.budget || 1)) * 100);

            return (
              <button
                key={evt.id}
                onClick={() => setSelectedEventId(evt.id)}
                className={`px-3 py-2 text-xs font-medium rounded-xl transition-all flex items-center gap-2.5 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-sm ring-2 ring-emerald-600/30'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <div className="text-left">
                  <span className="font-semibold block truncate max-w-[200px]">
                    {evt.title}
                  </span>
                  <span className={`text-[10px] block font-mono ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`}>
                    Dana: {evtPercent}% ({formatRupiah(evtCollected)})
                  </span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-normal shrink-0 ${
                  evt.status === 'Selesai'
                    ? (isSelected ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-700')
                    : (isSelected ? 'bg-emerald-700 text-emerald-100' : 'bg-emerald-100 text-emerald-800')
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
          {/* Left Column: Event Overview & Financial Progress Card */}
          <div className="lg:col-span-5 space-y-4">
            {/* General Info Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    {activeEvent.category}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mt-2 leading-snug">
                    {activeEvent.title}
                  </h3>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={handleStartEdit}
                    title="Ubah Detail Program"
                    className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Hapus kegiatan ini beserta seluruh data kepanitiaan dan catatannya?')) {
                        deleteEvent(activeEvent.id);
                      }
                    }}
                    title="Hapus Event"
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
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
                  <Clock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Status: <strong className="text-emerald-800 font-semibold">{activeEvent.status}</strong></span>
                </div>
              </div>

              {activeEvent.description && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-600">
                  <p className="font-semibold text-slate-700 mb-0.5">Deskripsi Program:</p>
                  <p>{activeEvent.description}</p>
                </div>
              )}
            </div>

            {/* FINANCIAL MONITORING & BUDGET COLLECTION CARD (DANA TERKUMPUL) */}
            <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white rounded-xl border border-emerald-700/50 p-5 shadow-sm space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm tracking-tight text-white">
                      Dana & Anggaran Kegiatan
                    </h4>
                    <p className="text-[10px] text-emerald-300/80">
                      Realisasi pengumpulan infaq & donasi
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleOpenFundModal}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Update Dana</span>
                </button>
              </div>

              {/* Fund Numbers Grid */}
              <div className="grid grid-cols-2 gap-3 relative z-10 pt-1">
                <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                  <span className="text-[10px] text-emerald-200 block">Dana Terkumpul Saat Ini:</span>
                  <p className="text-base sm:text-lg font-extrabold text-amber-300 tabular-nums leading-tight mt-0.5">
                    {formatRupiah(collected)}
                  </p>
                  <span className="text-[9px] text-emerald-300/90 font-medium">
                    {progressPercent}% dari target
                  </span>
                </div>

                <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                  <span className="text-[10px] text-slate-300 block">Target Anggaran (Budget):</span>
                  <p className="text-base sm:text-lg font-bold text-white tabular-nums leading-tight mt-0.5">
                    {formatRupiah(activeEvent.budget)}
                  </p>
                  <span className="text-[9px] text-slate-300/80 font-medium">
                    {isTargetAchieved ? (
                      <span className="text-emerald-300 font-semibold">✓ Target Terpenuhi</span>
                    ) : (
                      <span>Kekurangan: {formatRupiah(sisaKekurangan)}</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 relative z-10">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-emerald-200">Realisasi Pengumpulan</span>
                  <span className="font-bold text-white font-mono">{progressPercent}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden border border-white/10 p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      progressPercent >= 100
                        ? 'bg-gradient-to-r from-emerald-400 to-teal-300'
                        : progressPercent >= 60
                        ? 'bg-gradient-to-r from-amber-400 to-emerald-400'
                        : 'bg-gradient-to-r from-rose-400 to-amber-400'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, progressPercent))}%` }}
                  />
                </div>
              </div>

              {/* Recent Periodic Fund Updates Log Preview */}
              <div className="pt-2 border-t border-white/10 relative z-10 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-emerald-200 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" />
                    <span>Catatan Update Berkala Terakhir</span>
                  </span>
                  <button
                    onClick={handleOpenFundModal}
                    className="text-[10px] text-amber-300 hover:underline"
                  >
                    Kelola Riwayat
                  </button>
                </div>

                {(!activeEvent.fundHistory || activeEvent.fundHistory.length === 0) ? (
                  <p className="text-[11px] text-slate-400 italic">
                    Belum ada riwayat update. Klik "Update Dana" untuk mencatat pemasukan berkala.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {activeEvent.fundHistory.slice(0, 3).map(entry => (
                      <div
                        key={entry.id}
                        className="bg-white/5 border border-white/10 rounded-lg p-2 flex items-center justify-between gap-2 text-[11px]"
                      >
                        <div className="truncate">
                          <p className="font-medium text-white truncate">{entry.note}</p>
                          <p className="text-[9.5px] text-slate-400 font-mono">{formatIndoDate(entry.date)}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-amber-300 font-mono">
                            +{formatRupiah(entry.amount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                  Daftar anggota yang bertugas dan berpartisipasi pada program {activeEvent.title}.
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
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
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

      {/* ============================================================== */}
      {/* MODAL: UPDATE DANA TERKUMPUL BERKALA */}
      {/* ============================================================== */}
      {isUpdatingFunds && activeEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold">
                  Update Dana Kegiatan: {activeEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setIsUpdatingFunds(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              {/* Current Overview Banner */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-emerald-800 text-[11px] font-medium block">Total Dana Terkumpul Saat Ini:</span>
                  <span className="text-lg font-extrabold text-emerald-950 font-mono">
                    {formatRupiah(activeEvent.collectedFunds || 0)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-[11px] block">Target Anggaran:</span>
                  <span className="text-xs font-bold text-slate-700 font-mono">
                    {formatRupiah(activeEvent.budget)}
                  </span>
                </div>
              </div>

              {/* Form Input */}
              <form onSubmit={handleSaveFundUpdate} className="space-y-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Metode Pembaruan Saldo:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFundUpdateMode('add')}
                      className={`p-2.5 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                        fundUpdateMode === 'add'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <PlusCircle className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                      <span>+ Tambah Pemasukan / Donasi Baru</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFundUpdateMode('set')}
                      className={`p-2.5 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                        fundUpdateMode === 'set'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Receipt className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                      <span>Koreksi Total Kas Langsung</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {fundUpdateMode === 'add' ? 'Nominal Pemasukan Baru (Rp) *' : 'Total Saldo Baru (Rp) *'}
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={50000}
                      value={fundAmountInput}
                      onChange={(e) => setFundAmountInput(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:bg-white focus:outline-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Tanggal Penerimaan *
                    </label>
                    <input
                      type="date"
                      required
                      value={fundDateInput}
                      onChange={(e) => setFundDateInput(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Sumber Dana / Keterangan Donasi *
                  </label>
                  <input
                    type="text"
                    required
                    value={fundNoteInput}
                    onChange={(e) => setFundNoteInput(e.target.value)}
                    placeholder="Contoh: Donasi Hamba Allah via QRIS / Kotak Amal Jumat / Sponsor PT XYZ"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Catatan Dana</span>
                </button>
              </form>

              {/* Riwayat Lengkap Update Berkala */}
              <div className="pt-4 border-t border-slate-200">
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  <span>Riwayat Update Berkala ({activeEvent.fundHistory?.length || 0} Catatan)</span>
                </h4>

                {(!activeEvent.fundHistory || activeEvent.fundHistory.length === 0) ? (
                  <p className="text-slate-400 italic py-2">Belum ada riwayat update.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {activeEvent.fundHistory.map(item => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between gap-2"
                      >
                        <div className="truncate">
                          <p className="font-semibold text-slate-800 truncate">{item.note}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {formatIndoDate(item.date)} · Saldo: {formatRupiah(item.newTotal)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono font-bold text-emerald-800 text-xs">
                            +{formatRupiah(item.amount)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteHistoryEntry(item.id)}
                            title="Hapus catatan ini"
                            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ASSIGN MEMBER */}
      {/* ============================================================== */}
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
                  className="px-4 py-2 text-slate-600 font-medium hover:text-slate-900 cursor-pointer"
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

      {/* ============================================================== */}
      {/* MODAL: CREATE EVENT */}
      {/* ============================================================== */}
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
                  <label className="block font-semibold text-slate-700 mb-1">Target Anggaran (Rp)</label>
                  <input
                    type="number"
                    step={100000}
                    value={newEventData.budget}
                    onChange={(e) => setNewEventData({ ...newEventData, budget: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dana Terkumpul Awal (Rp)</label>
                  <input
                    type="number"
                    step={50000}
                    value={newEventData.collectedFunds}
                    onChange={(e) => setNewEventData({ ...newEventData, collectedFunds: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lokasi Kegiatan</label>
                <input
                  type="text"
                  value={newEventData.location}
                  onChange={(e) => setNewEventData({ ...newEventData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
                />
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
                  className="px-4 py-2 text-slate-600 font-medium hover:text-slate-900 cursor-pointer"
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

      {/* ============================================================== */}
      {/* MODAL: EDIT EVENT */}
      {/* ============================================================== */}
      {isEditingEvent && editFormData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Ubah Data Kegiatan: {editFormData.title}
            </h3>

            <form onSubmit={handleSaveEditEvent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Kegiatan *</label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
                  >
                    <option value="Akan Datang">Akan Datang</option>
                    <option value="Sedang Berlangsung">Sedang Berlangsung</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Anggaran (Rp)</label>
                  <input
                    type="number"
                    value={editFormData.budget}
                    onChange={(e) => setEditFormData({ ...editFormData, budget: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={editFormData.startDate}
                    onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={editFormData.endDate}
                    onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lokasi</label>
                <input
                  type="text"
                  value={editFormData.location}
                  onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi</label>
                <textarea
                  rows={2}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingEvent(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:text-slate-900 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
