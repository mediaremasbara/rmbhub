import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Member, MosqueProfile } from '../types';
import { generateQrCodeUrl } from '../utils/helpers';
import { 
  Printer, 
  Layers, 
  RotateCw, 
  Check, 
  Sparkles,
  QrCode,
  Download,
  Users
} from 'lucide-react';

interface IdCardTheme {
  id: string;
  name: string;
  primaryBg: string;
  headerBg: string;
  accentColor: string;
  borderClass: string;
  textColor: string;
  subTextColor: string;
}

const THEMES: Record<string, IdCardTheme> = {
  emerald: {
    id: 'emerald',
    name: 'Hijau Zamrud (Islami)',
    primaryBg: 'bg-emerald-950',
    headerBg: 'bg-emerald-900',
    accentColor: 'text-amber-300',
    borderClass: 'border-amber-400/40',
    textColor: 'text-white',
    subTextColor: 'text-emerald-200',
  },
  navy: {
    id: 'navy',
    name: 'Biru Navy Elegan',
    primaryBg: 'bg-slate-950',
    headerBg: 'bg-sky-950',
    accentColor: 'text-sky-300',
    borderClass: 'border-sky-400/40',
    textColor: 'text-white',
    subTextColor: 'text-sky-200',
  },
  maroon: {
    id: 'maroon',
    name: 'Merah Marun Royal',
    primaryBg: 'bg-stone-950',
    headerBg: 'bg-rose-950',
    accentColor: 'text-amber-200',
    borderClass: 'border-amber-300/40',
    textColor: 'text-white',
    subTextColor: 'text-rose-200',
  },
  gold: {
    id: 'gold',
    name: 'Hitam Emas Khidmat',
    primaryBg: 'bg-neutral-950',
    headerBg: 'bg-zinc-900',
    accentColor: 'text-yellow-400',
    borderClass: 'border-yellow-500/50',
    textColor: 'text-white',
    subTextColor: 'text-neutral-300',
  },
};

export const IdCardStudio: React.FC = () => {
  const { 
    members, 
    profile, 
    selectedMemberForCard, 
    setSelectedMemberForCard, 
    setVerifyMemberModal 
  } = useApp();

  const [activeTheme, setActiveTheme] = useState<string>(profile.cardTheme || 'emerald');
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [cardSide, setCardSide] = useState<'both' | 'front' | 'back'>('both');
  const [printMode, setPrintMode] = useState<'single' | 'batch'>('single');
  const [selectedBatchMembers, setSelectedBatchMembers] = useState<string[]>(
    members.slice(0, 8).map(m => m.id)
  );
  const [qrCodeUrls, setQrCodeUrls] = useState<Record<string, string>>({});

  const currentMember = selectedMemberForCard || members[0];
  const theme = THEMES[activeTheme] || THEMES.emerald;

  // Generate QR code URLs for active members
  useEffect(() => {
    const generateQrs = async () => {
      const qrs: Record<string, string> = {};
      for (const m of members) {
        const verifyData = `SIM-REMAS:${m.nia}:${m.name}:${m.status}`;
        const url = await generateQrCodeUrl(verifyData);
        qrs[m.id] = url;
      }
      setQrCodeUrls(qrs);
    };

    if (members.length > 0) {
      generateQrs();
    }
  }, [members]);

  const handlePrint = () => {
    window.print();
  };

  const toggleBatchMember = (id: string) => {
    setSelectedBatchMembers(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectAllBatch = () => {
    setSelectedBatchMembers(members.map(m => m.id));
  };

  const deselectAllBatch = () => {
    setSelectedBatchMembers([]);
  };

  if (!currentMember) {
    return (
      <div className="p-8 text-center text-slate-500">
        Belum ada data anggota untuk membuat KTA. Tambahkan anggota terlebih dahulu.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Control Toolbar (Hidden in print) */}
      <div className="no-print bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Studio Kartu Tanda Anggota (KTA) Digital
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Desain kartu anggota resmi berstandar CR80 siap cetak presisi untuk {profile.orgName}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Print Mode Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setPrintMode('single')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  printMode === 'single'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cetak Kartu Tunggal
              </button>
              <button
                onClick={() => setPrintMode('batch')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  printMode === 'batch'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cetak Massal (Lembar A4)
              </button>
            </div>

            {/* Direct Print Button */}
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang (Print)</span>
            </button>
          </div>
        </div>

        {/* Options Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5 pt-4 border-t border-slate-100 text-xs">
          {/* Member selector (for single mode) */}
          {printMode === 'single' ? (
            <div>
              <label className="block text-slate-500 font-medium mb-1.5">Pilih Anggota:</label>
              <select
                value={currentMember.id}
                onChange={(e) => {
                  const m = members.find(item => item.id === e.target.value);
                  if (m) setSelectedMemberForCard(m);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-emerald-600 focus:bg-white"
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.nia} - {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-slate-500 font-medium mb-1.5">Pilihan Anggota Batch:</label>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 tabular-nums">
                  {selectedBatchMembers.length} terpilih
                </span>
                <button
                  onClick={selectAllBatch}
                  className="text-emerald-700 hover:underline font-medium ml-1"
                >
                  Semua
                </button>
                <span className="text-slate-300">·</span>
                <button
                  onClick={deselectAllBatch}
                  className="text-slate-500 hover:underline"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* Theme selector */}
          <div>
            <label className="block text-slate-500 font-medium mb-1.5">Tema Warna KTA:</label>
            <div className="flex items-center gap-1.5">
              {Object.values(THEMES).map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTheme(t.id)}
                  title={t.name}
                  className={`w-7 h-7 rounded-lg transition-transform ${t.primaryBg} ${
                    activeTheme === t.id ? 'ring-2 ring-emerald-600 scale-110 shadow-xs' : 'opacity-80 hover:opacity-100'
                  }`}
                />
              ))}
              <span className="text-slate-600 ml-1.5 font-medium">{theme.name}</span>
            </div>
          </div>

          {/* Layout Orientation */}
          <div>
            <label className="block text-slate-500 font-medium mb-1.5">Format Kartu:</label>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setOrientation('landscape')}
                className={`flex-1 py-1 px-2 text-center rounded-md font-medium transition-colors ${
                  orientation === 'landscape' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Lanskap (KTA)
              </button>
              <button
                onClick={() => setOrientation('portrait')}
                className={`flex-1 py-1 px-2 text-center rounded-md font-medium transition-colors ${
                  orientation === 'portrait' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Potret (Lanyard)
              </button>
            </div>
          </div>

          {/* Side preview (single mode) */}
          {printMode === 'single' && (
            <div>
              <label className="block text-slate-500 font-medium mb-1.5">Sisi Ditampilkan:</label>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setCardSide('both')}
                  className={`flex-1 py-1 px-2 text-center rounded-md font-medium transition-colors ${
                    cardSide === 'both' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Depan & Belakang
                </button>
                <button
                  onClick={() => setCardSide('front')}
                  className={`flex-1 py-1 px-2 text-center rounded-md font-medium transition-colors ${
                    cardSide === 'front' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Depan
                </button>
                <button
                  onClick={() => setCardSide('back')}
                  className={`flex-1 py-1 px-2 text-center rounded-md font-medium transition-colors ${
                    cardSide === 'back' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Belakang
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* SINGLE CARD PREVIEW / PRINT AREA */}
      {/* ============================================================== */}
      {printMode === 'single' && (
        <div className="print-container">
          {/* Card Preview Container */}
          <div className="flex flex-wrap items-center justify-center gap-8 py-6">
            {(cardSide === 'both' || cardSide === 'front') && (
              <div className="flex flex-col items-center">
                <span className="no-print text-xs font-semibold text-slate-500 mb-2">
                  MUKA DEPAN (FRONT)
                </span>
                <CardFront
                  member={currentMember}
                  profile={profile}
                  theme={theme}
                  orientation={orientation}
                  qrCodeUrl={qrCodeUrls[currentMember.id] || ''}
                  onQrClick={() => setVerifyMemberModal(currentMember)}
                />
              </div>
            )}

            {(cardSide === 'both' || cardSide === 'back') && (
              <div className="flex flex-col items-center">
                <span className="no-print text-xs font-semibold text-slate-500 mb-2">
                  MUKA BELAKANG (BACK)
                </span>
                <CardBack
                  member={currentMember}
                  profile={profile}
                  theme={theme}
                  orientation={orientation}
                />
              </div>
            )}
          </div>

          {/* Single Print Guide Tip */}
          <div className="no-print max-w-xl mx-auto bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
            <span className="text-amber-600 font-bold text-sm">💡</span>
            <div>
              <p className="font-semibold text-amber-950">Petunjuk Cetak Presisi:</p>
              <p className="text-amber-800 mt-0.5">
                Gunakan pengaturan kertas standar A4 atau kertas foto/kartu PVC ukuran 85.6mm x 53.98mm (CR80 standard).
                Pastikan mencentang opsi <strong>"Background Graphics" (Grafik Latar Belakang)</strong> di jendela dialog printer browser agar warna dan logo tercetak sempurna.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* BATCH PRINT / A4 SHEET VIEW */}
      {/* ============================================================== */}
      {printMode === 'batch' && (
        <div className="space-y-6">
          {/* Selection checklist for batch */}
          <div className="no-print bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Pilih Anggota yang Ingin Dicetak di Lembar A4
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {members.map(m => {
                const isSelected = selectedBatchMembers.includes(m.id);
                return (
                  <button
                    key={m.id}
                    onClick={() => toggleBatchMember(m.id)}
                    className={`p-2 rounded-lg text-left border text-xs transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950'
                        : 'border-slate-200 bg-slate-50 text-slate-600 opacity-60'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <div className="truncate">
                      <p className="font-semibold truncate">{m.nickname || m.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{m.nia}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Batch Print Preview Grid (Formatted for A4 sheets) */}
          <div className="print-container bg-slate-100/60 p-6 rounded-2xl border border-slate-200">
            <div className="no-print text-center mb-4">
              <span className="text-xs text-slate-500">
                Tampilan Pratinjau Lembar Cetak ({selectedBatchMembers.length} Kartu Siap Cetak)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center">
              {members
                .filter(m => selectedBatchMembers.includes(m.id))
                .map(m => (
                  <div key={m.id} className="print-card-break flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                    <CardFront
                      member={m}
                      profile={profile}
                      theme={theme}
                      orientation={orientation}
                      qrCodeUrl={qrCodeUrls[m.id] || ''}
                      onQrClick={() => setVerifyMemberModal(m)}
                    />
                    <CardBack
                      member={m}
                      profile={profile}
                      theme={theme}
                      orientation={orientation}
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// CARD FRONT COMPONENT (High-Definition Layout)
// ============================================================================
interface CardProps {
  member: Member;
  profile: MosqueProfile;
  theme: IdCardTheme;
  orientation: 'landscape' | 'portrait';
  qrCodeUrl?: string;
  onQrClick?: () => void;
}

export const CardFront: React.FC<CardProps> = ({
  member,
  profile,
  theme,
  orientation,
  qrCodeUrl,
  onQrClick,
}) => {
  const isLandscape = orientation === 'landscape';

  if (isLandscape) {
    return (
      <div 
        className={`w-[420px] h-[265px] ${theme.primaryBg} ${theme.textColor} rounded-2xl p-4 shadow-xl relative overflow-hidden border ${theme.borderClass} flex flex-col justify-between shrink-0 select-none print:shadow-none print:m-2`}
        style={{ aspectRatio: '85.6 / 53.98' }}
      >
        {/* Subtle Islamic Geometric Watermark Lattice */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />
        
        {/* Golden decorative accent curve */}
        <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-amber-400/10 blur-xl pointer-events-none" />

        {/* Card Header: Mosque Emblem & Titles */}
        <div className="flex items-center gap-3 relative z-10 border-b border-white/10 pb-2">
          <img
            src={profile.emblemUrl}
            alt="Emblem"
            className="w-10 h-10 object-contain rounded-full bg-white p-0.5 border border-amber-400 shrink-0 shadow-xs"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300 leading-tight truncate">
              {profile.orgName}
            </h4>
            <p className="text-[10px] text-white/90 font-medium truncate">
              {profile.mosqueName}
            </p>
            <p className="text-[8px] text-white/60 tracking-tight truncate">
              KARTU TANDA ANGGOTA (KTA) RESMI
            </p>
          </div>
        </div>

        {/* Card Body: Photo, Info, QR Code */}
        <div className="flex items-center gap-3.5 relative z-10 py-1">
          {/* Member Photo Frame */}
          <div className="relative shrink-0">
            <div className="w-20 h-24 rounded-lg overflow-hidden border-2 border-amber-300 shadow-md bg-slate-800">
              <img
                src={member.photoUrl}
                alt={member.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            {/* Gender Badge */}
            <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[8px] font-bold px-1.5 py-0.5 bg-amber-400 text-slate-950 rounded-sm uppercase tracking-tight shadow-xs whitespace-nowrap">
              {member.gender}
            </span>
          </div>

          {/* Member Identification Details */}
          <div className="flex-1 min-w-0 space-y-1">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-amber-300 font-semibold font-mono">
                {member.nia}
              </p>
              <h3 className="text-sm font-extrabold text-white leading-tight truncate">
                {member.name}
              </h3>
            </div>

            <div className="text-[10px] text-white/80 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-white/50 text-[9px] w-12 shrink-0">Jabatan:</span>
                <span className="font-semibold text-amber-200 truncate">{member.role}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-white/50 text-[9px] w-12 shrink-0">Divisi:</span>
                <span className="font-medium text-white/90 truncate">{member.division}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-white/50 text-[9px] w-12 shrink-0">Status:</span>
                <span className="font-medium text-emerald-300 truncate">
                  Terdaftar {member.status}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code with Scan hint */}
          <div className="shrink-0 flex flex-col items-center">
            <button
              onClick={onQrClick}
              title="Klik untuk verifikasi digital"
              className="p-1 bg-white rounded-lg shadow-sm border border-amber-400/40 hover:scale-105 transition-transform cursor-pointer"
            >
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="QR Code" className="w-16 h-16 rounded" />
              ) : (
                <div className="w-16 h-16 bg-slate-100 flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-slate-400" />
                </div>
              )}
            </button>
            <span className="text-[7px] text-amber-300/80 mt-1 uppercase tracking-tight font-medium">
              Scan Verifikasi
            </span>
          </div>
        </div>

        {/* Card Footer: Validity & Chip Motif */}
        <div className="flex items-center justify-between text-[8px] text-white/60 border-t border-white/10 pt-1.5 relative z-10">
          <span className="tracking-tight">
            Berlaku s/d: <strong className="text-white/90">{profile.cardValidUntil}</strong>
          </span>
          <span className="font-mono text-amber-300/80 tracking-widest uppercase">
            SIM-REMAS ID
          </span>
        </div>
      </div>
    );
  }

  // Portrait Lanyard Badge Layout (54mm x 85.6mm)
  return (
    <div 
      className={`w-[270px] h-[425px] ${theme.primaryBg} ${theme.textColor} rounded-2xl p-4 shadow-xl relative overflow-hidden border ${theme.borderClass} flex flex-col justify-between shrink-0 select-none print:shadow-none print:m-2 text-center`}
    >
      {/* Lanyard punch hole simulation */}
      <div className="no-print mx-auto w-12 h-2.5 rounded-full bg-slate-800/80 border border-white/20 mb-1" />

      {/* Subtle lattice watermark */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />

      {/* Header */}
      <div className="flex flex-col items-center border-b border-white/10 pb-2.5">
        <img
          src={profile.emblemUrl}
          alt="Emblem"
          className="w-12 h-12 object-contain rounded-full bg-white p-0.5 border border-amber-400 shadow-xs mb-1.5"
        />
        <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300 leading-tight">
          {profile.orgName}
        </h4>
        <p className="text-[9px] text-white/80 font-medium">
          {profile.mosqueName}
        </p>
      </div>

      {/* Photo */}
      <div className="my-auto py-2 flex flex-col items-center">
        <div className="w-24 h-28 rounded-xl overflow-hidden border-2 border-amber-300 shadow-md bg-slate-800 mb-2">
          <img
            src={member.photoUrl}
            alt={member.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        <p className="text-[9px] font-mono font-bold text-amber-300 tracking-wider">
          {member.nia}
        </p>
        <h3 className="text-sm font-extrabold text-white leading-snug px-1">
          {member.name}
        </h3>
        <p className="text-[10px] text-amber-200 font-semibold mt-0.5">
          {member.role}
        </p>
        <p className="text-[9px] text-white/70">
          {member.division}
        </p>
      </div>

      {/* QR Code and Validity */}
      <div className="border-t border-white/10 pt-2 flex items-center justify-between px-2">
        <div className="text-left text-[8px] text-white/70">
          <p>Masa Berlaku:</p>
          <p className="font-semibold text-white">{profile.cardValidUntil}</p>
          <p className="text-emerald-300 font-medium mt-0.5">{member.status}</p>
        </div>

        <button
          onClick={onQrClick}
          className="p-1 bg-white rounded-md border border-amber-300 shadow-xs"
        >
          {qrCodeUrl ? (
            <img src={qrCodeUrl} alt="QR Code" className="w-12 h-12" />
          ) : (
            <QrCode className="w-12 h-12 text-slate-800" />
          )}
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// CARD BACK COMPONENT (Terms, Signature & Barcode)
// ============================================================================
export const CardBack: React.FC<{
  member: Member;
  profile: MosqueProfile;
  theme: IdCardTheme;
  orientation: 'landscape' | 'portrait';
}> = ({ member, profile, theme, orientation }) => {
  const isLandscape = orientation === 'landscape';

  if (isLandscape) {
    return (
      <div 
        className={`w-[420px] h-[265px] ${theme.primaryBg} ${theme.textColor} rounded-2xl p-4 shadow-xl relative overflow-hidden border ${theme.borderClass} flex flex-col justify-between shrink-0 select-none print:shadow-none print:m-2`}
        style={{ aspectRatio: '85.6 / 53.98' }}
      >
        {/* Subtle watermark */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />

        {/* Magnetic stripe simulation */}
        <div className="absolute top-3 left-0 right-0 h-7 bg-slate-900 border-y border-white/10" />

        <div className="pt-8 space-y-1 relative z-10">
          <h4 className="text-[9px] font-bold text-amber-300 uppercase tracking-wider">
            KETENTUAN KARTU TANDA ANGGOTA (KTA)
          </h4>
          <ol className="text-[7.5px] text-white/80 space-y-0.5 list-decimal pl-3 leading-tight">
            <li>Kartu ini adalah identitas resmi anggota {profile.orgName}.</li>
            <li>Wajib dibawa saat menghadiri kajian, rapat, dan kegiatan operasional masjid.</li>
            <li>Pemegang kartu wajib menjaga nama baik masjid dan berakhlakul karimah.</li>
            <li>Bila kartu ini hilang atau ditemukan, mohon hubungi sekretariat di {profile.contactNumber}.</li>
          </ol>
        </div>

        {/* Motto banner */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-1.5 text-center relative z-10">
          <p className="text-[7.5px] italic text-amber-200">
            "{profile.motto}"
          </p>
        </div>

        {/* Signatures & Official Stamp */}
        <div className="flex items-end justify-between px-2 pt-1 border-t border-white/10 relative z-10 text-[8px]">
          {/* Barcode representation */}
          <div className="space-y-0.5">
            <div className="flex gap-[1.5px] h-5 items-end">
              {[4, 2, 5, 3, 6, 2, 4, 3, 5, 2, 6, 4, 3, 2, 5, 4, 6, 3, 2].map((h, i) => (
                <div
                  key={i}
                  className="bg-white w-[2px]"
                  style={{ height: `${h * 3}px` }}
                />
              ))}
            </div>
            <p className="font-mono text-[7px] text-white/60 tracking-wider">
              {member.nia}
            </p>
          </div>

          {/* Digital Signature & Seal */}
          <div className="text-right space-y-0.5 relative">
            {/* Stamp simulation */}
            <div className="absolute -top-3 right-12 w-10 h-10 rounded-full border border-emerald-400/50 bg-emerald-500/10 flex items-center justify-center rotate-12 pointer-events-none">
              <span className="text-[6px] font-extrabold text-emerald-300 uppercase text-center leading-[7px]">
                CAP RESMI<br/>REMAS
              </span>
            </div>

            <p className="text-[7px] text-white/60">{profile.city}</p>
            <p className="text-[7px] text-amber-300 font-semibold">Ketua Umum</p>
            <p className="font-serif italic text-[8.5px] text-white/90 pt-1 underline decoration-amber-400">
              {profile.leaderName}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Portrait Back Layout
  return (
    <div 
      className={`w-[270px] h-[425px] ${theme.primaryBg} ${theme.textColor} rounded-2xl p-4 shadow-xl relative overflow-hidden border ${theme.borderClass} flex flex-col justify-between shrink-0 select-none print:shadow-none print:m-2`}
    >
      {/* Lanyard punch hole simulation */}
      <div className="no-print mx-auto w-12 h-2.5 rounded-full bg-slate-800/80 border border-white/20 mb-1" />

      <div>
        <h4 className="text-[10px] font-bold text-amber-300 uppercase tracking-wider text-center border-b border-white/10 pb-1.5 mb-2">
          TATA TERTIB ANGGOTA
        </h4>
        <ol className="text-[8px] text-white/80 space-y-1 list-decimal pl-3 leading-relaxed">
          <li>Kartu ini adalah identitas resmi anggota {profile.orgName}.</li>
          <li>Wajib dibawa saat kegiatan kajian, musyawarah, dan gotong royong.</li>
          <li>Menjunjung tinggi ukhuwah Islamiyah dan syariat Islam.</li>
          <li>Apabila menemukan kartu ini, harap dikembalikan ke sekretariat {profile.mosqueName}.</li>
        </ol>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center my-2">
        <p className="text-[8px] italic text-amber-200">
          "{profile.motto}"
        </p>
        <p className="text-[7px] text-white/50 mt-1">
          Sekretariat: {profile.address}
        </p>
      </div>

      {/* Signature & Barcode */}
      <div className="border-t border-white/10 pt-2 space-y-2">
        <div className="flex justify-between items-end text-[8px]">
          <div>
            <p className="text-[7px] text-white/60">Kontak Sekretariat</p>
            <p className="font-mono text-white/90">{profile.contactNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-[7px] text-amber-300">Ketua Umum</p>
            <p className="italic font-serif text-[9px] text-white underline decoration-amber-400">
              {profile.leaderName}
            </p>
          </div>
        </div>

        {/* Barcode bottom */}
        <div className="flex flex-col items-center pt-1">
          <div className="flex gap-[1.5px] h-5 items-end">
            {[4, 2, 5, 3, 6, 2, 4, 3, 5, 2, 6, 4, 3, 2, 5, 4, 6, 3, 2, 4, 3].map((h, i) => (
              <div
                key={i}
                className="bg-white w-[2px]"
                style={{ height: `${h * 3}px` }}
              />
            ))}
          </div>
          <p className="font-mono text-[7px] text-white/60 tracking-wider mt-0.5">
            {member.nia}
          </p>
        </div>
      </div>
    </div>
  );
};
