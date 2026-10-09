import React from 'react';
import { Member, AttendanceSession, MosqueEvent, MosqueProfile } from '../types';
import { formatIndoDate, calculateAge, formatWhatsAppNumber } from '../utils/helpers';
import { 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Edit, 
  Award, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

interface MemberDetailModalProps {
  member: Member | null;
  attendanceSessions: AttendanceSession[];
  events: MosqueEvent[];
  profile: MosqueProfile;
  onClose: () => void;
  onEdit: (member: Member) => void;
  onPrintCard: (member: Member) => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  member,
  attendanceSessions,
  events,
  profile,
  onClose,
  onEdit,
  onPrintCard,
}) => {
  if (!member) return null;

  // Calculate attendance statistics for this member
  let hadirCount = 0;
  let izinCount = 0;
  let sakitCount = 0;
  let alpaCount = 0;
  let totalTracked = 0;

  const attendanceHistory = attendanceSessions.map(session => {
    const record = session.records.find(r => r.memberId === member.id);
    const status = record ? record.status : 'Alpa';
    totalTracked++;
    if (status === 'Hadir') hadirCount++;
    else if (status === 'Izin') izinCount++;
    else if (status === 'Sakit') sakitCount++;
    else alpaCount++;

    return {
      sessionTitle: session.title,
      sessionDate: session.date,
      sessionCategory: session.category,
      status,
      note: record?.note,
      timestamp: record?.timestamp,
    };
  });

  const attendanceRate = totalTracked > 0 
    ? Math.round((hadirCount / totalTracked) * 100) 
    : 0;

  // Find events where this member participated
  const memberEvents = events.filter(e => 
    e.participants.some(p => p.memberId === member.id)
  ).map(e => {
    const part = e.participants.find(p => p.memberId === member.id)!;
    return {
      eventTitle: e.title,
      category: e.category,
      startDate: e.startDate,
      status: e.status,
      roleInEvent: part.roleInEvent,
      divisionSie: part.divisionSie,
      note: part.note,
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-emerald-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="relative">
              <img
                src={member.photoUrl}
                alt={member.name}
                referrerPolicy="no-referrer"
                className="w-20 h-24 rounded-xl object-cover border-2 border-amber-400 shadow-md bg-slate-800"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-bold px-2 py-0.5 bg-amber-400 text-slate-950 rounded-sm uppercase tracking-wider">
                {member.gender}
              </span>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs">
                <span className="font-mono text-amber-300 font-bold">{member.nia}</span>
                <span className="text-white/40">·</span>
                <span className="text-emerald-300 font-medium">Status: {member.status}</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white mt-1">
                {member.name}
              </h2>
              <p className="text-xs text-emerald-100 font-medium">
                {member.role} · {member.division}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4">
                <button
                  onClick={() => onPrintCard(member)}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Cetak KTA Digital</span>
                </button>
                <button
                  onClick={() => onEdit(member)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Data</span>
                </button>
                <a
                  href={`https://wa.me/${formatWhatsAppNumber(member.phone)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Kirim WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs">
          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
            <div>
              <p className="text-slate-500 text-[11px]">Tingkat Kehadiran</p>
              <p className="text-lg font-extrabold text-emerald-700 tabular-nums">
                {attendanceRate}%
              </p>
            </div>
            <div>
              <p className="text-slate-500 text-[11px]">Hadir / Pertemuan</p>
              <p className="text-lg font-bold text-slate-900 tabular-nums">
                {hadirCount} <span className="text-xs text-slate-400">/ {totalTracked}</span>
              </p>
            </div>
            <div>
              <p className="text-slate-500 text-[11px]">Partisipasi Event</p>
              <p className="text-lg font-bold text-slate-900 tabular-nums">
                {memberEvents.length} Kegiatan
              </p>
            </div>
            <div>
              <p className="text-slate-500 text-[11px]">Lama Bergabung</p>
              <p className="text-sm font-bold text-slate-800 mt-1">
                {formatIndoDate(member.joinedDate)}
              </p>
            </div>
          </div>

          {/* Detailed Biodata */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2.5">
              Biodata & Informasi Personal
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 border-t border-slate-100 pt-2.5">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Tempat, Tanggal Lahir</span>
                <span className="font-medium text-slate-900">
                  {member.pob}, {formatIndoDate(member.dob)} ({calculateAge(member.dob)} thn)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Pendidikan / Profesi</span>
                <span className="font-medium text-slate-900">{member.educationJob}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Golongan Darah</span>
                <span className="font-medium text-slate-900">{member.bloodType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Email</span>
                <span className="font-medium text-slate-900">{member.email || '-'}</span>
              </div>
              <div className="sm:col-span-2 flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Alamat Domisili</span>
                <span className="font-medium text-slate-900 text-right max-w-xs">{member.address} (RT/RW {member.rtRw})</span>
              </div>
              <div className="sm:col-span-2 flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Kontak Darurat</span>
                <span className="font-medium text-slate-900">
                  {member.emergencyContact?.name} ({member.emergencyContact?.relation}) - {member.emergencyContact?.phone}
                </span>
              </div>
            </div>

            {/* Skills & Interests */}
            <div className="mt-3">
              <p className="text-slate-500 text-[11px] mb-1.5">Minat & Keahlian:</p>
              <div className="flex flex-wrap gap-1.5">
                {member.skillsInterest.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Event Participation History */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2.5 flex items-center justify-between">
              <span>Riwayat Partisipasi & Kepanitiaan Event</span>
              <span className="text-slate-400 font-normal">{memberEvents.length} Terdata</span>
            </h4>
            {memberEvents.length === 0 ? (
              <p className="text-slate-400 italic py-2">Belum ada riwayat kepanitiaan kegiatan.</p>
            ) : (
              <div className="space-y-2 border-t border-slate-100 pt-2">
                {memberEvents.map((evt, idx) => (
                  <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{evt.eventTitle}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span>{formatIndoDate(evt.startDate)}</span>
                        <span>·</span>
                        <span>{evt.category}</span>
                      </div>
                      {evt.note && <p className="text-[11px] text-slate-600 italic mt-1">"{evt.note}"</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                        {evt.roleInEvent}
                      </span>
                      {evt.divisionSie && (
                        <p className="text-[10px] text-slate-500 mt-0.5">{evt.divisionSie}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attendance History */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2.5 flex items-center justify-between">
              <span>Riwayat Presensi Agenda & Pengajian</span>
              <span className="text-slate-400 font-normal">{attendanceHistory.length} Pertemuan</span>
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto border-t border-slate-100 pt-2 pr-1">
              {attendanceHistory.map((att, idx) => {
                let badgeBg = 'bg-emerald-100 text-emerald-800';
                if (att.status === 'Izin') badgeBg = 'bg-amber-100 text-amber-800';
                if (att.status === 'Sakit') badgeBg = 'bg-sky-100 text-sky-800';
                if (att.status === 'Alpa') badgeBg = 'bg-rose-100 text-rose-800';

                return (
                  <div key={idx} className="flex items-center justify-between py-1.5 px-2 hover:bg-slate-50 rounded text-slate-700">
                    <div className="min-w-0 pr-2">
                      <p className="font-medium text-slate-800 truncate">{att.sessionTitle}</p>
                      <p className="text-[10px] text-slate-400">
                        {formatIndoDate(att.sessionDate)} · {att.sessionCategory}
                        {att.note ? ` (${att.note})` : ''}
                      </p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${badgeBg} shrink-0`}>
                      {att.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
