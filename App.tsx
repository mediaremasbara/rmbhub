import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { MembersView } from './components/MembersView';
import { AttendanceView } from './components/AttendanceView';
import { EventsView } from './components/EventsView';
import { IdCardStudio } from './components/IdCardStudio';
import { MemberModal } from './components/MemberModal';
import { MosqueSettingsModal } from './components/MosqueSettingsModal';
import { QrVerifyModal } from './components/QrVerifyModal';
import { Member } from './types';
import { Settings, ShieldCheck, Database, Printer } from 'lucide-react';

const AppContent: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    members, 
    addMember, 
    updateMember, 
    profile, 
    verifyMemberModal, 
    setVerifyMemberModal 
  } = useApp();

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleOpenAddMember = () => {
    setMemberToEdit(null);
    setIsMemberModalOpen(true);
  };

  const handleEditMember = (member: Member) => {
    setMemberToEdit(member);
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = (memberData: any) => {
    if (memberData.id) {
      updateMember(memberData);
    } else {
      addMember(memberData);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Bar Navigation */}
      <Navbar onOpenAddMember={handleOpenAddMember} />

      {/* Breadcrumb / Context Bar (Hidden in print) */}
      <div className="no-print bg-white/70 border-b border-slate-200/80 backdrop-blur-xs py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-700">{profile.orgName}</span>
            <span aria-hidden="true">/</span>
            <span className="text-emerald-700 font-semibold capitalize">
              {activeTab === 'dashboard' && 'Dashboard Utama'}
              {activeTab === 'members' && 'Database Anggota'}
              {activeTab === 'attendance' && 'Presensi & Kehadiran'}
              {activeTab === 'events' && 'Kegiatan & Program Kerja'}
              {activeTab === 'idcard' && 'Studio KTA Digital'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Pengaturan Masjid</span>
            </button>
            <span className="text-slate-300">·</span>
            <span className="font-mono text-slate-400 tabular-nums">
              {members.length} Anggota Terdata
            </span>
          </div>
        </div>
      </div>

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            onOpenAddMember={handleOpenAddMember}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {activeTab === 'members' && (
          <MembersView
            onOpenAddMember={handleOpenAddMember}
            onEditMember={handleEditMember}
          />
        )}

        {activeTab === 'attendance' && <AttendanceView />}

        {activeTab === 'events' && <EventsView />}

        {activeTab === 'idcard' && <IdCardStudio />}
      </main>

      {/* Footer (No print) */}
      <footer className="no-print border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="font-semibold text-slate-700">{profile.orgName}</span>
            <span>·</span>
            <span>{profile.city}</span>
          </div>

          <p className="text-slate-400">
            Sistem Informasi Remaja Masjid & Generator KTA Digital Resmi
          </p>
        </div>
      </footer>

      {/* Modals */}
      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => {
          setIsMemberModalOpen(false);
          setMemberToEdit(null);
        }}
        onSave={handleSaveMember}
        memberToEdit={memberToEdit}
        totalMembersCount={members.length}
      />

      <MosqueSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <QrVerifyModal
        member={verifyMemberModal}
        profile={profile}
        onClose={() => setVerifyMemberModal(null)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
