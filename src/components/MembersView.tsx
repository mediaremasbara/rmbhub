import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Member, Division, Gender, MemberStatus } from '../types';
import { formatIndoDate, calculateAge, formatWhatsAppNumber } from '../utils/helpers';
import { 
  Search, 
  Filter, 
  Download, 
  Upload,
  CreditCard, 
  Phone, 
  Edit, 
  Trash2, 
  Eye, 
  LayoutGrid, 
  List, 
  UserPlus, 
  FileSpreadsheet
} from 'lucide-react';
import { MemberDetailModal } from './MemberDetailModal';
import { ImportCsvModal } from './ImportCsvModal';

interface MembersViewProps {
  onOpenAddMember: () => void;
  onEditMember: (member: Member) => void;
}

export const MembersView: React.FC<MembersViewProps> = ({
  onOpenAddMember,
  onEditMember,
}) => {
  const { 
    members, 
    deleteMember, 
    importMembers,
    setSelectedMemberForCard, 
    setActiveTab, 
    attendanceSessions, 
    events, 
    profile 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [inspectMember, setInspectMember] = useState<Member | null>(null);
  const [isImportCsvOpen, setIsImportCsvOpen] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // Filter members
  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.nia.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery) ||
      m.skillsInterest.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDivision = selectedDivision === 'all' || m.division === selectedDivision;
    const matchesGender = selectedGender === 'all' || m.gender === selectedGender;
    const matchesStatus = selectedStatus === 'all' || m.status === selectedStatus;

    return matchesSearch && matchesDivision && matchesGender && matchesStatus;
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Yakin ingin menghapus data anggota "${name}"?`)) {
      deleteMember(id);
    }
  };

  const handlePrintCard = (m: Member) => {
    setSelectedMemberForCard(m);
    setActiveTab('idcard');
  };

  const exportMembersCsv = () => {
    const headers = [
      'NIA',
      'Nama Lengkap',
      'Panggilan',
      'Jenis Kelamin',
      'Tempat Lahir',
      'Tanggal Lahir',
      'Usia',
      'No WhatsApp',
      'Email',
      'Divisi',
      'Jabatan',
      'Status',
      'Alamat',
      'Pekerjaan/Sekolah',
      'Tanggal Bergabung'
    ];

    const rows = filteredMembers.map(m => [
      m.nia,
      `"${m.name}"`,
      `"${m.nickname}"`,
      m.gender,
      m.pob,
      m.dob,
      calculateAge(m.dob),
      `'${m.phone}`,
      m.email || '-',
      `"${m.division}"`,
      `"${m.role}"`,
      m.status,
      `"${m.address}"`,
      `"${m.educationJob}"`,
      m.joinedDate
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `data-anggota-remaja-masjid-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Database Anggota Remaja Masjid
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md tabular-nums">
                {filteredMembers.length} dari {members.length} Anggota
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola biodata, pembagian divisi, nomor induk anggota (NIA), dan akses cepat pembuatan KTA.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsImportCsvOpen(true)}
              className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Unggah spreadsheet CSV untuk impor massal anggota"
            >
              <Upload className="w-3.5 h-3.5 text-blue-700" />
              <span>Impor CSV</span>
            </button>
            <button
              onClick={exportMembersCsv}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Unduh format spreadsheet untuk takmir masjid"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Ekspor CSV</span>
            </button>
            <button
              onClick={onOpenAddMember}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Tambah Anggota</span>
            </button>
          </div>
        </div>

        {importSuccessMsg && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center justify-between animate-in fade-in">
            <span>✓ {importSuccessMsg}</span>
            <button
              onClick={() => setImportSuccessMsg(null)}
              className="text-emerald-600 hover:text-emerald-900 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-5 pt-4 border-t border-slate-100 text-xs">
          {/* Search bar */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, NIA, panggilan, atau keahlian..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-emerald-600 focus:bg-white transition-colors"
            />
          </div>

          {/* Division Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-emerald-600 focus:bg-white"
            >
              <option value="all">Semua Divisi / Bidang ({members.length})</option>
              <option value="BPH">BPH</option>
              <option value="Media & Humas">Media & Humas</option>
              <option value="Ekraf & Event">Ekraf & Event</option>
            </select>
          </div>

          {/* Gender Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-emerald-600 focus:bg-white"
            >
              <option value="all">Semua Gender</option>
              <option value="Ikhwan">Ikhwan (L)</option>
              <option value="Akhwat">Akhwat (P)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-emerald-600 focus:bg-white"
            >
              <option value="all">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Non-aktif">Non-aktif</option>
              <option value="Alumni">Alumni</option>
              <option value="Merantau/Studi">Merantau / Studi</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="md:col-span-1 flex items-center justify-end">
            <div className="flex items-center bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('table')}
                title="Tampilan Tabel Data"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'table' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500'
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title="Tampilan Kartu Grid"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TABLE VIEW (High density tabular format) */}
      {/* ============================================================== */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Anggota</th>
                  <th className="py-3 px-4">Nomor Induk (NIA)</th>
                  <th className="py-3 px-4">Divisi & Jabatan</th>
                  <th className="py-3 px-4">Gender / Usia</th>
                  <th className="py-3 px-4">No WhatsApp</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                      Tidak ditemukan anggota sesuai kata kunci atau filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((m) => {
                    let statusBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    if (m.status === 'Non-aktif') statusBg = 'bg-slate-100 text-slate-700 border-slate-200';
                    if (m.status === 'Alumni') statusBg = 'bg-amber-50 text-amber-800 border-amber-200';
                    if (m.status === 'Merantau/Studi') statusBg = 'bg-blue-50 text-blue-700 border-blue-200';

                    return (
                      <tr 
                        key={m.id} 
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => setInspectMember(m)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={m.photoUrl}
                              alt={m.name}
                              referrerPolicy="no-referrer"
                              className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            <div>
                              <p className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                                {m.name}
                              </p>
                              <p className="text-[11px] text-slate-500">{m.educationJob}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono font-semibold text-slate-700 tabular-nums">
                          {m.nia}
                        </td>

                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-800">{m.role}</p>
                          <p className="text-[11px] text-slate-500">{m.division}</p>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              m.gender === 'Ikhwan' ? 'bg-sky-100 text-sky-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {m.gender}
                            </span>
                            <span className="text-slate-600 tabular-nums">
                              {calculateAge(m.dob)} thn
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <a
                            href={`https://wa.me/${formatWhatsAppNumber(m.phone)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-medium"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{m.phone}</span>
                          </a>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${statusBg}`}>
                            {m.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handlePrintCard(m)}
                              title="Buka & Cetak KTA Digital"
                              className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setInspectMember(m)}
                              title="Lihat Detail Riwayat"
                              className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onEditMember(m)}
                              title="Edit Data"
                              className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(m.id, m.name)}
                              title="Hapus Anggota"
                              className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* GRID CARDS VIEW */}
      {/* ============================================================== */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMembers.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="relative">
                    <img
                      src={m.photoUrl}
                      alt={m.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-16 rounded-lg object-cover border border-slate-200 shadow-xs"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-bold px-1 py-0.2 rounded ${
                      m.gender === 'Ikhwan' ? 'bg-sky-600 text-white' : 'bg-rose-600 text-white'
                    }`}>
                      {m.gender}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                      {m.nia}
                    </span>
                    <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                      {m.status}
                    </p>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1">
                  {m.name}
                </h3>
                <p className="text-xs font-semibold text-emerald-800">
                  {m.role}
                </p>
                <p className="text-[11px] text-slate-500 line-clamp-1">
                  {m.division}
                </p>

                <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                  <p className="truncate">📍 {m.address}</p>
                  <p>🎂 {calculateAge(m.dob)} tahun ({formatIndoDate(m.dob)})</p>
                </div>
              </div>

              {/* Card Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handlePrintCard(m)}
                  className="flex-1 py-1.5 px-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-xs font-bold shadow-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>KTA</span>
                </button>
                <button
                  onClick={() => setInspectMember(m)}
                  className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  title="Lihat Profil Lengkap"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <a
                  href={`https://wa.me/${formatWhatsAppNumber(m.phone)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-1.5 px-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center"
                  title="Chat WhatsApp"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Member Details Modal */}
      {inspectMember && (
        <MemberDetailModal
          member={inspectMember}
          attendanceSessions={attendanceSessions}
          events={events}
          profile={profile}
          onClose={() => setInspectMember(null)}
          onEdit={(m) => {
            setInspectMember(null);
            onEditMember(m);
          }}
          onPrintCard={(m) => {
            setInspectMember(null);
            handlePrintCard(m);
          }}
        />
      )}

      {/* Import CSV Modal */}
      <ImportCsvModal
        isOpen={isImportCsvOpen}
        onClose={() => setIsImportCsvOpen(false)}
        onImport={(imported, mode) => {
          importMembers(imported, mode);
          setImportSuccessMsg(`Berhasil mengimpor ${imported.length} data anggota (${mode === 'replace' ? 'Database Diperbarui' : 'Data Ditambahkan'})!`);
          setTimeout(() => setImportSuccessMsg(null), 5000);
        }}
        currentTotalMembers={members.length}
      />
    </div>
  );
};
