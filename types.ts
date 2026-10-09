export type Gender = 'Ikhwan' | 'Akhwat';

export type MemberStatus = 'Aktif' | 'Non-aktif' | 'Alumni' | 'Merantau/Studi';

export type Division = 
  | 'BPH (Badan Pengurus Harian)'
  | 'Dakwah & Kajian'
  | 'Humas & Kemitraan'
  | 'Media, IT & Publikasi'
  | 'Kepemudaan & Olahraga'
  | 'Keputrian & Pemberdayaan'
  | 'Logistik & Sarpras'
  | 'Anggota Aktif';

export type RoleInOrg =
  | 'Ketua Umum'
  | 'Wakil Ketua'
  | 'Sekretaris'
  | 'Bendahara'
  | 'Koordinator Divisi'
  | 'Staff Divisi'
  | 'Anggota';

export interface Member {
  id: string;
  nia: string; // Nomor Induk Anggota (e.g. RM-2024-001)
  name: string;
  nickname: string;
  gender: Gender;
  pob: string; // Tempat Lahir
  dob: string; // Tanggal Lahir (YYYY-MM-DD)
  phone: string; // WhatsApp
  email: string;
  address: string;
  rtRw: string;
  educationJob: string;
  division: Division;
  role: RoleInOrg;
  joinedDate: string;
  status: MemberStatus;
  bloodType: 'A' | 'B' | 'AB' | 'O' | '-';
  skillsInterest: string[];
  photoUrl: string;
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
}

export type AttendanceStatus = 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';

export interface AttendanceRecord {
  memberId: string;
  status: AttendanceStatus;
  timestamp?: string;
  note?: string;
}

export type AttendanceCategory = 
  | 'Kajian Rutin'
  | 'Rapat Pengurus'
  | 'Gotong Royong'
  | 'Tadarus & Tahsin'
  | 'Olahraga / Rihlah'
  | 'Kepanitiaan Event';

export interface AttendanceSession {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "19:30 - 21:30 WIB"
  category: AttendanceCategory;
  location: string;
  description: string;
  records: AttendanceRecord[];
}

export type EventStatus = 'Akan Datang' | 'Sedang Berlangsung' | 'Selesai';

export type EventRole =
  | 'Ketua Panitia'
  | 'Sekretaris'
  | 'Bendahara'
  | 'Koordinator Sie'
  | 'Anggota Panitia'
  | 'Peserta'
  | 'Relawan'
  | 'Pengisi Acara / Qari';

export interface EventParticipant {
  memberId: string;
  roleInEvent: EventRole;
  divisionSie?: string;
  note?: string;
}

export interface MosqueEvent {
  id: string;
  title: string;
  category: 'Syiar & Dakwah' | 'Sosial Kemasyarakatan' | 'Kaderisasi & Pelatihan' | 'Hari Besar Islam' | 'Rihlah & Kebersamaan';
  startDate: string;
  endDate: string;
  status: EventStatus;
  budget: number;
  description: string;
  location: string;
  participants: EventParticipant[];
}

export interface MosqueProfile {
  mosqueName: string;
  orgName: string;
  address: string;
  city: string;
  leaderName: string;
  secretaryName: string;
  motto: string;
  cardTheme: 'emerald' | 'navy' | 'maroon' | 'gold' | 'black';
  cardValidUntil: string;
  contactNumber: string;
  emblemUrl: string;
}
