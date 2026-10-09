import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Member, MosqueProfile } from '../types';
import { generateQrCodeUrl } from '../utils/helpers';
import { 
  Printer, 
  RotateCw, 
  Check, 
  Sparkles,
  QrCode, 
  Users,
  Palette,
  ShieldCheck,
  Eye
} from 'lucide-react';

export interface IdCardTheme {
  id: string;
  name: string;
  colorSwatch: string;
  primaryBg: string;
  headerBg: string;
  accentColor: string;
  secondaryAccent: string;
  borderClass: string;
  borderAccent: string;
  textColor: string;
  subTextColor: string;
  badgeClass: string;
  glowColor: string;
  patternStroke: string;
  patternFill: string;
}

export const THEMES: Record<string, IdCardTheme> = {
  emerald: {
    id: 'emerald',
    name: 'Hijau Zamrud (Islami)',
    colorSwatch: 'bg-emerald-700',
    primaryBg: 'bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#022c22]',
    headerBg: 'bg-[#064e3b]/90',
    accentColor: 'text-amber-300',
    secondaryAccent: 'text-amber-200',
    borderClass: 'border-amber-400/50',
    borderAccent: 'border-amber-400',
    textColor: 'text-white',
    subTextColor: 'text-emerald-100',
    badgeClass: 'bg-amber-400 text-slate-950 font-bold',
    glowColor: 'bg-amber-400/20',
    patternStroke: '#fbbf24',
    patternFill: '#10b981',
  },
  navy: {
    id: 'navy',
    name: 'Biru Navy Elegan',
    colorSwatch: 'bg-blue-800',
    primaryBg: 'bg-gradient-to-br from-[#0a2540] via-[#103b6e] to-[#07192c]',
    headerBg: 'bg-[#0e315d]/90',
    accentColor: 'text-sky-300',
    secondaryAccent: 'text-cyan-200',
    borderClass: 'border-sky-400/60',
    borderAccent: 'border-sky-400',
    textColor: 'text-white',
    subTextColor: 'text-sky-100',
    badgeClass: 'bg-sky-400 text-slate-950 font-bold',
    glowColor: 'bg-sky-400/25',
    patternStroke: '#38bdf8',
    patternFill: '#0284c7',
  },
  maroon: {
    id: 'maroon',
    name: 'Merah Marun Royal',
    colorSwatch: 'bg-rose-900',
    primaryBg: 'bg-gradient-to-br from-[#500714] via-[#750e20] to-[#34040c]',
    headerBg: 'bg-[#630b1b]/90',
    accentColor: 'text-rose-200',
    secondaryAccent: 'text-amber-200',
    borderClass: 'border-rose-400/60',
    borderAccent: 'border-rose-300',
    textColor: 'text-white',
    subTextColor: 'text-rose-100',
    badgeClass: 'bg-rose-500 text-white font-bold',
    glowColor: 'bg-rose-500/25',
    patternStroke: '#fb7185',
    patternFill: '#be123c',
  },
  gold: {
    id: 'gold',
    name: 'Hitam Emas Khidmat',
    colorSwatch: 'bg-zinc-900',
    primaryBg: 'bg-gradient-to-br from-[#141416] via-[#24242a] to-[#0a0a0c]',
    headerBg: 'bg-[#24242a]/90',
    accentColor: 'text-yellow-400',
    secondaryAccent: 'text-amber-300',
    borderClass: 'border-yellow-500/60',
    borderAccent: 'border-yellow-400',
    textColor: 'text-white',
    subTextColor: 'text-zinc-200',
    badgeClass: 'bg-yellow-400 text-slate-950 font-bold',
    glowColor: 'bg-yellow-400/25',
    patternStroke: '#facc15',
    patternFill: '#ca8a04',
  },
};

export type PatternType = 'islamic-star' | 'arabesque' | 'guilloche' | 'subtle';

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
  const [patternType, setPatternType] = useState<PatternType>('islamic-star');
  const [patternDensity, setPatternDensity] = useState<'normal' | 'vivid'>('normal');
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
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Studio Kartu Tanda Anggota (KTA) Digital</span>
              <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                CR80 Standar Resmi
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Desain kartu anggota resmi dengan motif ornamen Islami, QR verifikasi, dan cap resmi siap cetak presisi untuk {profile.orgName}.
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-5 pt-4 border-t border-slate-100 text-xs">
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
            <label className="block text-slate-500 font-medium mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-slate-400" />
              <span>Tema Warna KTA:</span>
            </label>
            <div className="flex items-center gap-1.5">
              {Object.values(THEMES).map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTheme(t.id)}
                  title={t.name}
                  className={`w-7 h-7 rounded-lg transition-transform ${t.colorSwatch} ${
                    activeTheme === t.id ? 'ring-2 ring-emerald-600 scale-110 shadow-xs' : 'opacity-85 hover:opacity-100'
                  }`}
                />
              ))}
              <span className="text-slate-700 ml-1 font-semibold text-[11px] truncate">{theme.name}</span>
            </div>
          </div>

          {/* Motif / Pattern selector */}
          <div>
            <label className="block text-slate-500 font-medium mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Motif Ornamen KTA:</span>
            </label>
            <div className="flex items-center gap-1">
              <select
                value={patternType}
                onChange={(e) => setPatternType(e.target.value as PatternType)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-emerald-600 focus:bg-white"
              >
                <option value="islamic-star">Bintang Islami (8-Point Star)</option>
                <option value="arabesque">Ornamen Arabesque & Kubah</option>
                <option value="guilloche">Gelombang Sekuriti (Guilloche)</option>
                <option value="subtle">Mikro Geometris Halus</option>
              </select>
              <button
                type="button"
                onClick={() => setPatternDensity(prev => prev === 'normal' ? 'vivid' : 'normal')}
                title="Tingkat ketegasan motif"
                className={`px-2 py-1.5 rounded-lg border text-[11px] font-semibold shrink-0 cursor-pointer ${
                  patternDensity === 'vivid'
                    ? 'bg-amber-100 border-amber-300 text-amber-900'
                    : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                {patternDensity === 'vivid' ? 'Tegas' : 'Halus'}
              </button>
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
                  className={`flex-1 py-1 px-1.5 text-center rounded-md font-medium transition-colors ${
                    cardSide === 'both' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Dua Sisi
                </button>
                <button
                  onClick={() => setCardSide('front')}
                  className={`flex-1 py-1 px-1.5 text-center rounded-md font-medium transition-colors ${
                    cardSide === 'front' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Depan
                </button>
                <button
                  onClick={() => setCardSide('back')}
                  className={`flex-1 py-1 px-1.5 text-center rounded-md font-medium transition-colors ${
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
                <span className="no-print text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>MUKA DEPAN (FRONT)</span>
                </span>
                <CardFront
                  member={currentMember}
                  profile={profile}
                  theme={theme}
                  orientation={orientation}
                  patternType={patternType}
                  patternDensity={patternDensity}
                  qrCodeUrl={qrCodeUrls[currentMember.id] || ''}
                  onQrClick={() => setVerifyMemberModal(currentMember)}
                />
              </div>
            )}

            {(cardSide === 'both' || cardSide === 'back') && (
              <div className="flex flex-col items-center">
                <span className="no-print text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>MUKA BELAKANG (BACK)</span>
                </span>
                <CardBack
                  member={currentMember}
                  profile={profile}
                  theme={theme}
                  orientation={orientation}
                  patternType={patternType}
                  patternDensity={patternDensity}
                />
              </div>
            )}
          </div>

          {/* Single Print Guide Tip */}
          <div className="no-print max-w-xl mx-auto bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
            <span className="text-amber-600 font-bold text-sm">💡</span>
            <div>
              <p className="font-semibold text-amber-950">Petunjuk Cetak Presisi & Berkualitas:</p>
              <p className="text-amber-800 mt-0.5">
                Format kartu telah disesuaikan dengan rasio kartu ID standar ISO/IEC 7810 CR80 (85.6mm x 53.98mm). 
                Pastikan mencentang opsi <strong>"Background Graphics" (Grafik Latar Belakang)</strong> di pengaturan printer browser agar warna tema ({theme.name}), motif ornamen, dan cap resmi tercetak jelas.
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
                      patternType={patternType}
                      patternDensity={patternDensity}
                      qrCodeUrl={qrCodeUrls[m.id] || ''}
                      onQrClick={() => setVerifyMemberModal(m)}
                    />
                    <CardBack
                      member={m}
                      profile={profile}
                      theme={theme}
                      orientation={orientation}
                      patternType={patternType}
                      patternDensity={patternDensity}
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
// ISLAMIC GEOMETRIC PATTERN & MOTIF OVERLAY
// ============================================================================
const CardPatternOverlay: React.FC<{
  theme: IdCardTheme;
  patternType: PatternType;
  density: 'normal' | 'vivid';
}> = ({ theme, patternType, density }) => {
  const opacity = density === 'vivid' ? 0.22 : 0.12;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* 1. Islamic 8-Point Star Geometric Girih Pattern */}
      {patternType === 'islamic-star' && (
        <>
          <svg className="absolute inset-0 w-full h-full" style={{ opacity }}>
            <defs>
              <pattern id="islamic-star-pattern" width="48" height="48" patternUnits="userSpaceOnUse">
                {/* 8-point star (Rub el Hizb) interlocking geometry */}
                <path
                  d="M24 6 L30 18 L42 24 L30 30 L24 42 L18 30 L6 24 L18 18 Z"
                  fill="none"
                  stroke={theme.patternStroke}
                  strokeWidth="1.2"
                />
                <rect
                  x="12"
                  y="12"
                  width="24"
                  height="24"
                  fill="none"
                  stroke={theme.patternStroke}
                  strokeWidth="0.8"
                  transform="rotate(45 24 24)"
                />
                <circle cx="24" cy="24" r="3.5" fill="none" stroke={theme.patternStroke} strokeWidth="0.8" />
                <circle cx="0" cy="0" r="2.5" fill={theme.patternStroke} />
                <circle cx="48" cy="0" r="2.5" fill={theme.patternStroke} />
                <circle cx="0" cy="48" r="2.5" fill={theme.patternStroke} />
                <circle cx="48" cy="48" r="2.5" fill={theme.patternStroke} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#islamic-star-pattern)" />
          </svg>
          {/* Central Arabesque Rosette Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-white/10 pointer-events-none flex items-center justify-center opacity-25">
            <div className="w-36 h-36 rounded-full border border-dashed border-white/20 flex items-center justify-center rotate-45">
              <div className="w-24 h-24 border border-white/25" />
            </div>
          </div>
        </>
      )}

      {/* 2. Arabesque Kubah & Flora Motif */}
      {patternType === 'arabesque' && (
        <svg className="absolute inset-0 w-full h-full" style={{ opacity }}>
          <defs>
            <pattern id="arabesque-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              {/* Islamic Arch / Mihrab silhouette repeated */}
              <path
                d="M10 40 L10 20 Q20 5 30 20 L30 40 Z"
                fill="none"
                stroke={theme.patternStroke}
                strokeWidth="1.1"
              />
              <path
                d="M20 5 Q20 18 35 20"
                fill="none"
                stroke={theme.patternStroke}
                strokeWidth="0.8"
              />
              <circle cx="20" cy="18" r="2.5" fill={theme.patternStroke} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#arabesque-pattern)" />
        </svg>
      )}

      {/* 3. Guilloche Security Wave Lines (Banknote & Official State ID Style) */}
      {patternType === 'guilloche' && (
        <svg className="absolute inset-0 w-full h-full" style={{ opacity }}>
          <defs>
            <pattern id="guilloche-pattern" width="60" height="30" patternUnits="userSpaceOnUse">
              <path
                d="M0 15 Q15 0 30 15 T60 15"
                fill="none"
                stroke={theme.patternStroke}
                strokeWidth="1.2"
              />
              <path
                d="M0 15 Q15 30 30 15 T60 15"
                fill="none"
                stroke={theme.patternStroke}
                strokeWidth="0.9"
              />
              <path
                d="M0 5 Q15 20 30 5 T60 5"
                fill="none"
                stroke={theme.patternStroke}
                strokeWidth="0.6"
              />
              <path
                d="M0 25 Q15 10 30 25 T60 25"
                fill="none"
                stroke={theme.patternStroke}
                strokeWidth="0.6"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#guilloche-pattern)" />
        </svg>
      )}

      {/* 4. Subtle Micro-Geometric Grid */}
      {patternType === 'subtle' && (
        <div 
          className="absolute inset-0 bg-[radial-gradient(#ffffff_1.2px,transparent_1.2px)] [background-size:10px_10px]"
          style={{ opacity: density === 'vivid' ? 0.16 : 0.08 }}
        />
      )}

      {/* Corner Ornamental Filigree Accents (4 Sudut KTA) */}
      <svg className="absolute top-1.5 left-1.5 w-6 h-6 opacity-35" viewBox="0 0 24 24" fill="none">
        <path d="M2 12 L2 2 L12 2" stroke={theme.patternStroke} strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="5" cy="5" r="1.5" fill={theme.patternStroke} />
      </svg>
      <svg className="absolute top-1.5 right-1.5 w-6 h-6 opacity-35" viewBox="0 0 24 24" fill="none">
        <path d="M22 12 L22 2 L12 2" stroke={theme.patternStroke} strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="19" cy="5" r="1.5" fill={theme.patternStroke} />
      </svg>
      <svg className="absolute bottom-1.5 left-1.5 w-6 h-6 opacity-35" viewBox="0 0 24 24" fill="none">
        <path d="M2 12 L2 22 L12 22" stroke={theme.patternStroke} strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="5" cy="19" r="1.5" fill={theme.patternStroke} />
      </svg>
      <svg className="absolute bottom-1.5 right-1.5 w-6 h-6 opacity-35" viewBox="0 0 24 24" fill="none">
        <path d="M22 12 L22 22 L12 22" stroke={theme.patternStroke} strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="19" cy="19" r="1.5" fill={theme.patternStroke} />
      </svg>

      {/* Ambient Radial Color Glow */}
      <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full ${theme.glowColor} blur-2xl pointer-events-none`} />
      <div className={`absolute -bottom-12 -left-12 w-32 h-32 rounded-full ${theme.glowColor} blur-xl pointer-events-none`} />
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
  patternType: PatternType;
  patternDensity: 'normal' | 'vivid';
  qrCodeUrl?: string;
  onQrClick?: () => void;
}

export const CardFront: React.FC<CardProps> = ({
  member,
  profile,
  theme,
  orientation,
  patternType,
  patternDensity,
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
        {/* Motif Pattern Overlay */}
        <CardPatternOverlay theme={theme} patternType={patternType} density={patternDensity} />

        {/* Card Header: Mosque Emblem & Titles */}
        <div className="flex items-center gap-3 relative z-10 border-b border-white/15 pb-2">
          <div className="w-11 h-11 rounded-full bg-white p-0.5 border-2 border-white/80 shrink-0 shadow-md flex items-center justify-center overflow-hidden">
            <img
              src={profile.emblemUrl}
              alt="Logo Remas"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`text-[11px] font-extrabold uppercase tracking-wider ${theme.accentColor} leading-tight truncate`}>
              {profile.orgName}
            </h4>
            <p className="text-[10px] text-white font-medium truncate">
              {profile.mosqueName}
            </p>
            <p className="text-[8px] text-white/70 tracking-tight truncate font-medium">
              KARTU TANDA ANGGOTA (KTA) RESMI
            </p>
          </div>
        </div>

        {/* Card Body: Photo, Info, QR Code */}
        <div className="flex items-center gap-3.5 relative z-10 py-1">
          {/* Member Photo Frame */}
          <div className="relative shrink-0">
            <div className={`w-20 h-24 rounded-lg overflow-hidden border-2 ${theme.borderAccent} shadow-md bg-slate-900`}>
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
            <span className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[8px] px-1.5 py-0.5 ${theme.badgeClass} rounded-sm uppercase tracking-tight shadow-xs whitespace-nowrap`}>
              {member.gender}
            </span>
          </div>

          {/* Member Identification Details */}
          <div className="flex-1 min-w-0 space-y-1">
            <div>
              <p className={`text-[9.5px] uppercase tracking-wider ${theme.accentColor} font-bold font-mono`}>
                {member.nia}
              </p>
              <h3 className="text-sm font-extrabold text-white leading-tight truncate drop-shadow-xs">
                {member.name}
              </h3>
            </div>

            <div className="text-[10px] text-white/90 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-white/60 text-[9px] w-12 shrink-0">Jabatan:</span>
                <span className={`font-semibold ${theme.secondaryAccent} truncate`}>{member.role}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-white/60 text-[9px] w-12 shrink-0">Divisi:</span>
                <span className="font-medium text-white/95 truncate">{member.division}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-white/60 text-[9px] w-12 shrink-0">Status:</span>
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
              className="p-1 bg-white rounded-lg shadow-sm border border-white/30 hover:scale-105 transition-transform cursor-pointer"
            >
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="QR Code" className="w-16 h-16 rounded" />
              ) : (
                <div className="w-16 h-16 bg-slate-100 flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-slate-400" />
                </div>
              )}
            </button>
            <span className={`text-[7.5px] ${theme.accentColor} mt-1 uppercase tracking-tight font-bold`}>
              Scan Verifikasi
            </span>
          </div>
        </div>

        {/* Card Footer: Validity & Chip Motif */}
        <div className="flex items-center justify-between text-[8px] text-white/70 border-t border-white/15 pt-1.5 relative z-10">
          <span className="tracking-tight">
            Berlaku s/d: <strong className="text-white font-bold">{profile.cardValidUntil}</strong>
          </span>
          <span className={`font-mono ${theme.accentColor} font-bold tracking-widest uppercase`}>
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
      <div className="no-print mx-auto w-12 h-2.5 rounded-full bg-slate-900/90 border border-white/30 mb-1 z-10" />

      {/* Motif Pattern Overlay */}
      <CardPatternOverlay theme={theme} patternType={patternType} density={patternDensity} />

      {/* Header */}
      <div className="flex flex-col items-center border-b border-white/15 pb-2.5 relative z-10">
        <div className="w-12 h-12 rounded-full bg-white p-0.5 border-2 border-white/80 shadow-md flex items-center justify-center overflow-hidden mb-1.5">
          <img
            src={profile.emblemUrl}
            alt="Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <h4 className={`text-[11px] font-extrabold uppercase tracking-wider ${theme.accentColor} leading-tight`}>
          {profile.orgName}
        </h4>
        <p className="text-[9px] text-white/90 font-medium">
          {profile.mosqueName}
        </p>
      </div>

      {/* Photo */}
      <div className="my-auto py-1 flex flex-col items-center relative z-10">
        <div className={`w-24 h-28 rounded-xl overflow-hidden border-2 ${theme.borderAccent} shadow-md bg-slate-900 mb-2 relative`}>
          <img
            src={member.photoUrl}
            alt={member.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <span className={`absolute bottom-0 inset-x-0 text-[8px] py-0.5 ${theme.badgeClass} uppercase tracking-tight text-center`}>
            {member.gender}
          </span>
        </div>

        <p className={`text-[9.5px] font-mono font-bold ${theme.accentColor} tracking-wider`}>
          {member.nia}
        </p>
        <h3 className="text-sm font-extrabold text-white leading-snug px-1">
          {member.name}
        </h3>
        <p className={`text-[10px] ${theme.secondaryAccent} font-semibold mt-0.5`}>
          {member.role}
        </p>
        <p className="text-[9px] text-white/80">
          {member.division}
        </p>
      </div>

      {/* QR Code and Validity */}
      <div className="border-t border-white/15 pt-2 flex items-center justify-between px-2 relative z-10">
        <div className="text-left text-[8px] text-white/80">
          <p>Masa Berlaku:</p>
          <p className="font-semibold text-white">{profile.cardValidUntil}</p>
          <p className="text-emerald-300 font-medium mt-0.5">{member.status}</p>
        </div>

        <button
          onClick={onQrClick}
          className="p-1 bg-white rounded-md border border-white/30 shadow-xs cursor-pointer"
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
// CARD BACK COMPONENT (Terms, Signature & Official Stamp)
// ============================================================================
export const CardBack: React.FC<{
  member: Member;
  profile: MosqueProfile;
  theme: IdCardTheme;
  orientation: 'landscape' | 'portrait';
  patternType: PatternType;
  patternDensity: 'normal' | 'vivid';
}> = ({ member, profile, theme, orientation, patternType, patternDensity }) => {
  const isLandscape = orientation === 'landscape';

  if (isLandscape) {
    return (
      <div 
        className={`w-[420px] h-[265px] ${theme.primaryBg} ${theme.textColor} rounded-2xl p-4 shadow-xl relative overflow-hidden border ${theme.borderClass} flex flex-col justify-between shrink-0 select-none print:shadow-none print:m-2`}
        style={{ aspectRatio: '85.6 / 53.98' }}
      >
        {/* Motif Pattern Overlay */}
        <CardPatternOverlay theme={theme} patternType={patternType} density={patternDensity} />

        {/* Magnetic stripe simulation */}
        <div className="absolute top-3 left-0 right-0 h-6 bg-slate-950/80 border-y border-white/15 z-10" />

        <div className="pt-7 space-y-1 relative z-10">
          <h4 className={`text-[9px] font-bold ${theme.accentColor} uppercase tracking-wider`}>
            KETENTUAN KARTU TANDA ANGGOTA (KTA)
          </h4>
          <ol className="text-[7.5px] text-white/85 space-y-0.5 list-decimal pl-3 leading-tight font-medium">
            <li>Kartu ini adalah identitas resmi keanggotaan {profile.orgName}.</li>
            <li>Wajib dibawa saat menghadiri kajian, rapat, dan kegiatan operasional masjid.</li>
            <li>Pemegang kartu wajib menjaga nama baik masjid dan berakhlakul karimah.</li>
            <li>Bila kartu ini hilang atau ditemukan, mohon hubungi sekretariat di {profile.contactNumber}.</li>
          </ol>
        </div>

        {/* Motto banner */}
        <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-lg p-1.5 text-center relative z-10">
          <p className={`text-[7.5px] italic ${theme.secondaryAccent}`}>
            "{profile.motto}"
          </p>
        </div>

        {/* Signatures & Official Stamp */}
        <div className="flex items-end justify-between px-2 pt-1 border-t border-white/15 relative z-10 text-[8px]">
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
            <p className="font-mono text-[7px] text-white/70 tracking-wider">
              {member.nia}
            </p>
          </div>

          {/* Digital Signature & Official Stamp */}
          <div className="text-right space-y-0.5 relative pr-1">
            {/* Cap / Stempel Resmi Remas */}
            {profile.stampUrl ? (
              <div className="absolute -top-5 right-10 w-14 h-14 pointer-events-none select-none z-20">
                <img
                  src={profile.stampUrl}
                  alt="Cap Resmi Remas"
                  className="w-full h-full object-contain rotate-[-12deg] drop-shadow-md opacity-95"
                />
              </div>
            ) : (
              <div className="absolute -top-4 right-10 w-12 h-12 rounded-full border-2 border-emerald-400/80 bg-emerald-500/15 backdrop-blur-xs flex flex-col items-center justify-center rotate-[-10deg] pointer-events-none shadow-xs">
                <span className="text-[5.5px] font-extrabold text-emerald-300 uppercase text-center leading-[6.5px]">
                  CAP RESMI<br/>REMAJA MASJID
                </span>
                <span className="text-[4.5px] text-emerald-200 font-mono mt-0.5">SAH</span>
              </div>
            )}

            <p className="text-[7px] text-white/70">{profile.city}</p>
            <p className={`text-[7px] ${theme.accentColor} font-bold`}>Ketua Umum</p>
            <p className="font-serif italic text-[8.5px] text-white pt-1 underline decoration-white/60">
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
      <div className="no-print mx-auto w-12 h-2.5 rounded-full bg-slate-900/90 border border-white/30 mb-1 z-10" />

      {/* Motif Pattern Overlay */}
      <CardPatternOverlay theme={theme} patternType={patternType} density={patternDensity} />

      <div className="relative z-10">
        <h4 className={`text-[10px] font-bold ${theme.accentColor} uppercase tracking-wider text-center border-b border-white/15 pb-1.5 mb-2`}>
          TATA TERTIB ANGGOTA
        </h4>
        <ol className="text-[8px] text-white/85 space-y-1 list-decimal pl-3 leading-relaxed font-medium">
          <li>Kartu ini adalah identitas resmi anggota {profile.orgName}.</li>
          <li>Wajib dibawa saat kegiatan kajian, musyawarah, dan gotong royong.</li>
          <li>Menjunjung tinggi ukhuwah Islamiyah dan syariat Islam.</li>
          <li>Apabila menemukan kartu ini, harap dikembalikan ke sekretariat {profile.mosqueName}.</li>
        </ol>
      </div>

      <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-lg p-2 text-center my-2 relative z-10">
        <p className={`text-[8px] italic ${theme.secondaryAccent}`}>
          "{profile.motto}"
        </p>
        <p className="text-[7px] text-white/60 mt-1">
          Sekretariat: {profile.address}
        </p>
      </div>

      {/* Signature & Barcode */}
      <div className="border-t border-white/15 pt-2 space-y-2 relative z-10">
        <div className="flex justify-between items-end text-[8px] relative">
          <div>
            <p className="text-[7px] text-white/70">Kontak Sekretariat</p>
            <p className="font-mono text-white font-semibold">{profile.contactNumber}</p>
          </div>

          <div className="text-right relative pr-1">
            {/* Cap / Stempel Resmi */}
            {profile.stampUrl ? (
              <div className="absolute -top-5 right-12 w-12 h-12 pointer-events-none select-none z-20">
                <img
                  src={profile.stampUrl}
                  alt="Cap Resmi Remas"
                  className="w-full h-full object-contain rotate-[-12deg] drop-shadow-md opacity-95"
                />
              </div>
            ) : (
              <div className="absolute -top-4 right-10 w-11 h-11 rounded-full border-2 border-emerald-400/80 bg-emerald-500/15 flex flex-col items-center justify-center rotate-[-10deg] pointer-events-none">
                <span className="text-[5px] font-extrabold text-emerald-300 uppercase text-center leading-[6px]">
                  CAP RESMI<br/>REMAS
                </span>
              </div>
            )}

            <p className={`text-[7px] ${theme.accentColor} font-bold`}>Ketua Umum</p>
            <p className="italic font-serif text-[9px] text-white underline decoration-white/60">
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
          <p className="font-mono text-[7px] text-white/70 tracking-wider mt-0.5">
            {member.nia}
          </p>
        </div>
      </div>
    </div>
  );
};
