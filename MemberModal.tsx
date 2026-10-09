import React, { useState, useEffect } from 'react';
import { Member, Gender, MemberStatus, Division, RoleInOrg } from '../types';
import { X, Upload, User, Phone, MapPin, Calendar, Heart, Shield } from 'lucide-react';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memberData: any) => void;
  memberToEdit?: Member | null;
  totalMembersCount: number;
}

const DIVISIONS: Division[] = [
  'BPH (Badan Pengurus Harian)',
  'Dakwah & Kajian',
  'Humas & Kemitraan',
  'Media, IT & Publikasi',
  'Kepemudaan & Olahraga',
  'Keputrian & Pemberdayaan',
  'Logistik & Sarpras',
  'Anggota Aktif',
];

const ROLES: RoleInOrg[] = [
  'Ketua Umum',
  'Wakil Ketua',
  'Sekretaris',
  'Bendahara',
  'Koordinator Divisi',
  'Staff Divisi',
  'Anggota',
];

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  onSave,
  memberToEdit,
  totalMembersCount,
}) => {
  const currentYear = new Date().getFullYear();
  const defaultNia = `RM-${currentYear}-${String(totalMembersCount + 1).padStart(3, '0')}`;

  const [formData, setFormData] = useState({
    nia: defaultNia,
    name: '',
    nickname: '',
    gender: 'Ikhwan' as Gender,
    pob: 'Jakarta',
    dob: '2004-01-01',
    phone: '',
    email: '',
    address: '',
    rtRw: '01/04',
    educationJob: 'Pelajar / Mahasiswa',
    division: 'Dakwah & Kajian' as Division,
    role: 'Anggota' as RoleInOrg,
    joinedDate: new Date().toISOString().slice(0, 10),
    status: 'Aktif' as MemberStatus,
    bloodType: '-' as 'A' | 'B' | 'AB' | 'O' | '-',
    skillsInterest: 'Kajian, Gotong Royong',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    emergencyName: '',
    emergencyRelation: 'Orang Tua',
    emergencyPhone: '',
  });

  useEffect(() => {
    if (memberToEdit) {
      setFormData({
        nia: memberToEdit.nia,
        name: memberToEdit.name,
        nickname: memberToEdit.nickname,
        gender: memberToEdit.gender,
        pob: memberToEdit.pob,
        dob: memberToEdit.dob,
        phone: memberToEdit.phone,
        email: memberToEdit.email,
        address: memberToEdit.address,
        rtRw: memberToEdit.rtRw,
        educationJob: memberToEdit.educationJob,
        division: memberToEdit.division,
        role: memberToEdit.role,
        joinedDate: memberToEdit.joinedDate,
        status: memberToEdit.status,
        bloodType: memberToEdit.bloodType,
        skillsInterest: memberToEdit.skillsInterest.join(', '),
        photoUrl: memberToEdit.photoUrl,
        emergencyName: memberToEdit.emergencyContact?.name || '',
        emergencyRelation: memberToEdit.emergencyContact?.relation || 'Orang Tua',
        emergencyPhone: memberToEdit.emergencyContact?.phone || '',
      });
    } else {
      setFormData({
        nia: defaultNia,
        name: '',
        nickname: '',
        gender: 'Ikhwan',
        pob: 'Jakarta',
        dob: '2004-01-01',
        phone: '',
        email: '',
        address: '',
        rtRw: '01/04',
        educationJob: 'Pelajar / Mahasiswa',
        division: 'Dakwah & Kajian',
        role: 'Anggota',
        joinedDate: new Date().toISOString().slice(0, 10),
        status: 'Aktif',
        bloodType: '-',
        skillsInterest: 'Kajian, Gotong Royong',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        emergencyName: '',
        emergencyRelation: 'Orang Tua',
        emergencyPhone: '',
      });
    }
  }, [memberToEdit, isOpen, defaultNia]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Nama lengkap wajib diisi');
      return;
    }

    const payload = {
      ...(memberToEdit ? { id: memberToEdit.id } : {}),
      customNia: formData.nia,
      name: formData.name.trim(),
      nickname: formData.nickname.trim() || formData.name.trim().split(' ')[0],
      gender: formData.gender,
      pob: formData.pob.trim(),
      dob: formData.dob,
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      rtRw: formData.rtRw.trim(),
      educationJob: formData.educationJob.trim(),
      division: formData.division,
      role: formData.role,
      joinedDate: formData.joinedDate,
      status: formData.status,
      bloodType: formData.bloodType,
      skillsInterest: formData.skillsInterest
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      photoUrl: formData.photoUrl,
      emergencyContact: {
        name: formData.emergencyName,
        relation: formData.emergencyRelation,
        phone: formData.emergencyPhone,
      },
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">
              {memberToEdit ? 'Perbarui Biodata Anggota' : 'Pendaftaran Anggota Remaja Masjid Baru'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Kelola data nomor induk (NIA), jabatan organisasi, dan kontak anggota.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {/* Top Section: Photo and Basic IDs */}
          <div className="flex flex-col sm:flex-row gap-5 items-start bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="w-24 h-28 rounded-xl overflow-hidden border-2 border-slate-300 bg-slate-200 shadow-sm relative group">
                <img
                  src={formData.photoUrl}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <label className="cursor-pointer text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
                <Upload className="w-3 h-3" />
                <span>Unggah Foto</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nomor Induk Anggota (NIA)
                </label>
                <input
                  type="text"
                  value={formData.nia}
                  onChange={(e) => setFormData({ ...formData, nia: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  placeholder="RM-2024-001"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Jenis Kelamin
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                >
                  <option value="Ikhwan">Ikhwan (Laki-laki)</option>
                  <option value="Akhwat">Akhwat (Perempuan)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  placeholder="Contoh: Muhammad Fadhil"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Panggilan
                </label>
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  placeholder="Contoh: Fadhil"
                />
              </div>
            </div>
          </div>

          {/* Section: Organization Details */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-700" />
              <span>Jabatan & Penugasan Organisasi</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Divisi / Bidang</label>
                <select
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value as Division })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                >
                  {DIVISIONS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jabatan</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as RoleInOrg })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                >
                  {ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status Keanggotaan</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as MemberStatus })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Non-aktif">Non-aktif</option>
                  <option value="Alumni">Alumni</option>
                  <option value="Merantau/Studi">Merantau / Studi</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Contacts & Demographics */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              <span>Kontak & Data Pribadi</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp / HP</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="081234567890"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="nama@email.com"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pekerjaan / Sekolah</label>
                <input
                  type="text"
                  value={formData.educationJob}
                  onChange={(e) => setFormData({ ...formData, educationJob: e.target.value })}
                  placeholder="Mahasiswa / Karyawan"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tempat Lahir</label>
                <input
                  type="text"
                  value={formData.pob}
                  onChange={(e) => setFormData({ ...formData, pob: e.target.value })}
                  placeholder="Jakarta"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tanggal Lahir</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Golongan Darah</label>
                <select
                  value={formData.bloodType}
                  onChange={(e) => setFormData({ ...formData, bloodType: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                >
                  <option value="-">- Tidak Tahu -</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                </select>
              </div>
            </div>
          </div>

          {/* Address & Skills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Alamat Domisili & RT/RW</label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Jl. Kebagusan No. 22 RT 03/RW 04"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Minat & Keahlian Khusus</label>
              <textarea
                rows={2}
                value={formData.skillsInterest}
                onChange={(e) => setFormData({ ...formData, skillsInterest: e.target.value })}
                placeholder="Tilawah, Desain Grafis, Video Editing, Sound System, Futsal (pisahkan dengan koma)"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
            >
              {memberToEdit ? 'Simpan Perubahan' : 'Tambahkan Anggota'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
