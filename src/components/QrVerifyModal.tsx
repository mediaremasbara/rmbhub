import React from 'react';
import { Member, MosqueProfile } from '../types';
import { formatIndoDate } from '../utils/helpers';
import { CheckCircle2, X, Phone, ShieldCheck } from 'lucide-react';

interface QrVerifyModalProps {
  member: Member | null;
  profile: MosqueProfile;
  onClose: () => void;
}

export const QrVerifyModal: React.FC<QrVerifyModalProps> = ({ member, profile, onClose }) => {
  if (!member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Verification banner */}
        <div className="bg-emerald-800 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-100 hover:text-white p-1 rounded-lg hover:bg-emerald-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-8 rounded-full bg-emerald-700/80 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
              Verifikasi Sistem Remaja Masjid
            </span>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-white">
            Kartu Anggota Terverifikasi
          </h3>
          <p className="text-xs text-emerald-200 mt-0.5">
            {profile.orgName} · {profile.mosqueName}
          </p>
        </div>

        {/* Member Details */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={member.photoUrl}
              alt={member.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-600 shrink-0 shadow-sm"
              onError={(e) => {
                // Fallback avatar
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div>
              <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Status Keanggotaan: {member.status}</span>
              </div>
              <h4 className="text-base font-bold text-slate-900">{member.name}</h4>
              <p className="text-xs text-slate-500 font-mono tabular-nums">{member.nia}</p>
              <p className="text-xs text-slate-600 mt-0.5">
                {member.role} · {member.division}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Jenis Kelamin</span>
              <span className="font-medium text-slate-800">{member.gender}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Tanggal Bergabung</span>
              <span className="font-medium text-slate-800">{formatIndoDate(member.joinedDate)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Masa Berlaku KTA</span>
              <span className="font-medium text-emerald-700">{profile.cardValidUntil}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Kontak WhatsApp</span>
              <a
                href={`https://wa.me/${member.phone}`}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <Phone className="w-3 h-3" />
                {member.phone}
              </a>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200">
            <p className="text-[11px] text-slate-500 italic">
              "{profile.motto}"
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Tutup Informasi
          </button>
        </div>
      </div>
    </div>
  );
};
