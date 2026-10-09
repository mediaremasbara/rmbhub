import React from 'react';
import { useApp } from '../context/AppContext';
import { formatIndoDate, formatRupiah } from '../utils/helpers';
import { 
  Users, 
  CalendarCheck, 
  CreditCard, 
  Calendar, 
  Award, 
  UserPlus, 
  Settings, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock
} from 'lucide-react';

interface DashboardViewProps {
  onOpenAddMember: () => void;
  onOpenSettings: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddMember,
  onOpenSettings,
}) => {
  const { 
    members, 
    attendanceSessions, 
    events, 
    profile, 
    setActiveTab, 
    setSelectedMemberForCard 
  } = useApp();

  // Metrics calculations
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'Aktif').length;
  const ikhwanCount = members.filter(m => m.gender === 'Ikhwan').length;
  const akhwatCount = members.filter(m => m.gender === 'Akhwat').length;

  // Average attendance rate across sessions
  let totalRecords = 0;
  let totalHadir = 0;
  attendanceSessions.forEach(s => {
    s.records.forEach(r => {
      totalRecords++;
      if (r.status === 'Hadir') totalHadir++;
    });
  });
  const avgAttendance = totalRecords > 0 ? Math.round((totalHadir / totalRecords) * 100) : 0;

  // Division breakdown
  const divisionCounts: Record<string, number> = {};
  members.forEach(m => {
    divisionCounts[m.division] = (divisionCounts[m.division] || 0) + 1;
  });

  // Most active contributors (based on committee participation and attendance)
  const memberScores = members.map(m => {
    const eventsParticipated = events.filter(e => 
      e.participants.some(p => p.memberId === m.id)
    ).length;
    
    let hadirCount = 0;
    attendanceSessions.forEach(s => {
      const r = s.records.find(rec => rec.memberId === m.id);
      if (r && r.status === 'Hadir') hadirCount++;
    });

    return {
      member: m,
      score: eventsParticipated * 2 + hadirCount,
      eventsCount: eventsParticipated,
      hadirCount,
    };
  }).sort((a, b) => b.score - a.score).slice(0, 5);

  const upcomingEvents = events.filter(e => e.status !== 'Selesai');
  const recentSession = attendanceSessions[0];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-6 sm:p-7 shadow-sm border border-emerald-700/50 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-emerald-600/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-amber-400/10 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-amber-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-amber-300/30">
                Pusat Kendali Pengurus
              </span>
              <span className="text-xs text-emerald-200">
                {profile.mosqueName}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              {profile.orgName}
            </h1>
            <p className="text-xs text-emerald-100/90 leading-relaxed">
              "{profile.motto}"
            </p>
          </div>

          {/* Quick CTAs */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab('idcard')}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Studio Cetak KTA</span>
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className="px-4 py-2.5 bg-emerald-700/90 hover:bg-emerald-700 text-white border border-emerald-500/40 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Presensi Hari Ini</span>
            </button>
            <button
              onClick={onOpenSettings}
              className="p-2.5 bg-emerald-950/60 hover:bg-emerald-950 text-white/90 rounded-xl text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
              title="Pengaturan Profil Masjid & Cadangan Data"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Members */}
        <div 
          onClick={() => setActiveTab('members')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-emerald-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Anggota Terdaftar</span>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 tabular-nums">
            {totalMembers} <span className="text-xs font-semibold text-slate-500">Jiwa</span>
          </p>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>{activeMembers} Berstatus Aktif</span>
            <span className="text-emerald-700 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Lihat Database <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 2: Gender Demographics */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Komposisi Gender</span>
            <span className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              🕌
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <p className="text-2xl font-black text-slate-900 tabular-nums">
              {ikhwanCount} <span className="text-xs font-semibold text-sky-700">Ikhwan</span>
            </p>
            <span className="text-slate-300">/</span>
            <p className="text-2xl font-black text-slate-900 tabular-nums">
              {akhwatCount} <span className="text-xs font-semibold text-rose-700">Akhwat</span>
            </p>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Rasio {Math.round((ikhwanCount / totalMembers) * 100)}% Ikhwan : {Math.round((akhwatCount / totalMembers) * 100)}% Akhwat
          </div>
        </div>

        {/* Metric 3: Average Attendance */}
        <div 
          onClick={() => setActiveTab('attendance')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-emerald-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Rata-Rata Kehadiran</span>
            <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-800 tabular-nums">
            {avgAttendance}%
          </p>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Dari {attendanceSessions.length} Sesi Pertemuan</span>
            <span className="text-emerald-700 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Rekap Presensi <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 4: Mosque Events & Programs */}
        <div 
          onClick={() => setActiveTab('events')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-emerald-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Program Kerja Masjid</span>
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 tabular-nums">
            {events.length} <span className="text-xs font-semibold text-slate-500">Program</span>
          </p>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>{upcomingEvents.length} Agenda Berjalan/Akan Datang</span>
            <span className="text-emerald-700 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Lihat Program <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Agenda & Upcoming Activities */}
        <div className="lg:col-span-7 space-y-6">
          {/* Upcoming Events Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Agenda & Kegiatan Terdekat
                </h3>
                <p className="text-xs text-slate-500">
                  Program syiar dan kegiatan yang sedang disiapkan pengurus.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('events')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Kelola Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {events.slice(0, 3).map(evt => (
                <div
                  key={evt.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded">
                        {evt.category}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {formatIndoDate(evt.startDate)}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                      {evt.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
                      <span>📍 {evt.location}</span>
                      <span>·</span>
                      <span>👥 {evt.participants.length} Panitia</span>
                      <span>·</span>
                      <span className="text-emerald-800 font-semibold font-mono bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                        Dana: {formatRupiah(evt.collectedFunds || 0)} ({Math.round(((evt.collectedFunds || 0) / (evt.budget || 1)) * 100)}%)
                      </span>
                    </p>
                  </div>

                  <span className={`self-start sm:self-auto text-xs font-bold px-2.5 py-1 rounded-lg ${
                    evt.status === 'Akan Datang' ? 'bg-amber-100 text-amber-900' :
                    evt.status === 'Sedang Berlangsung' ? 'bg-emerald-100 text-emerald-900' :
                    'bg-slate-200 text-slate-700'
                  }`}>
                    {evt.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Attendance Session Summary */}
          {recentSession && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Presensi Pertemuan Terakhir
                  </h3>
                  <p className="text-xs text-slate-500">
                    {recentSession.title} · {formatIndoDate(recentSession.date)}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('attendance')}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Buka Presensi
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1">
                <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100 font-bold">
                  <p className="text-lg tabular-nums">
                    {recentSession.records.filter(r => r.status === 'Hadir').length}
                  </p>
                  <p className="text-[11px] font-normal text-emerald-700">Hadir</p>
                </div>
                <div className="bg-amber-50 text-amber-800 p-3 rounded-xl border border-amber-100 font-bold">
                  <p className="text-lg tabular-nums">
                    {recentSession.records.filter(r => r.status === 'Izin').length}
                  </p>
                  <p className="text-[11px] font-normal text-amber-700">Izin</p>
                </div>
                <div className="bg-sky-50 text-sky-800 p-3 rounded-xl border border-sky-100 font-bold">
                  <p className="text-lg tabular-nums">
                    {recentSession.records.filter(r => r.status === 'Sakit').length}
                  </p>
                  <p className="text-[11px] font-normal text-sky-700">Sakit</p>
                </div>
                <div className="bg-rose-50 text-rose-800 p-3 rounded-xl border border-rose-100 font-bold">
                  <p className="text-lg tabular-nums">
                    {recentSession.records.filter(r => r.status === 'Alpa').length}
                  </p>
                  <p className="text-[11px] font-normal text-rose-700">Alpa</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Division Breakdown & Active Contributors */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Contributors Leaderboard (Apresiasi Pemuda) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Anggota Teraktif & Berprestasi
                </h3>
                <p className="text-xs text-slate-500">
                  Apresiasi keaktifan kajian rutin dan partisipasi kegiatan.
                </p>
              </div>
              <span className="text-amber-500 text-base">⭐</span>
            </div>

            <div className="space-y-2.5">
              {memberScores.map((item, idx) => (
                <div
                  key={item.member.id}
                  onClick={() => {
                    setSelectedMemberForCard(item.member);
                    setActiveTab('idcard');
                  }}
                  className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                  title="Klik untuk cetak KTA"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? 'bg-amber-400 text-slate-950 shadow-xs' :
                      idx === 1 ? 'bg-slate-300 text-slate-800' :
                      idx === 2 ? 'bg-amber-700 text-white' :
                      'text-slate-400'
                    }`}>
                      {idx + 1}
                    </span>
                    <img
                      src={item.member.photoUrl}
                      alt={item.member.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div>
                      <p className="font-bold text-slate-900 text-xs group-hover:text-emerald-700 transition-colors">
                        {item.member.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {item.member.role} · {item.member.nia}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-emerald-800 tabular-nums">
                      {item.score} Poin
                    </span>
                    <p className="text-[10px] text-slate-400">
                      {item.hadirCount}x Hadir · {item.eventsCount} Event
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Division Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-1">
              Sebaran Anggota per Divisi
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Pemerataan amanah dalam struktur kepengurusan.
            </p>

            <div className="space-y-2 text-xs">
              {Object.entries(divisionCounts).map(([divName, count]) => {
                const percentage = Math.round((count / totalMembers) * 100);
                return (
                  <div key={divName} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-medium text-slate-700 truncate max-w-[200px]">
                        {divName}
                      </span>
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {count} orang ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percentage}%` }}
                        className="bg-emerald-700 h-full rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
