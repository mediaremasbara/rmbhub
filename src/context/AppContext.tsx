import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Member, 
  Division,
  AttendanceSession, 
  MosqueEvent, 
  MosqueProfile, 
  AttendanceStatus 
} from '../types';
import { 
  initialMembers, 
  initialAttendanceSessions, 
  initialMosqueEvents, 
  initialMosqueProfile 
} from '../data/initialData';

export type ActiveTab = 'dashboard' | 'members' | 'attendance' | 'events' | 'idcard';

interface AppContextType {
  members: Member[];
  attendanceSessions: AttendanceSession[];
  events: MosqueEvent[];
  profile: MosqueProfile;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedMemberForCard: Member | null;
  setSelectedMemberForCard: (member: Member | null) => void;
  verifyMemberModal: Member | null;
  setVerifyMemberModal: (member: Member | null) => void;

  // Member CRUD
  addMember: (memberData: Omit<Member, 'id' | 'nia'> & { customNia?: string }) => Member;
  updateMember: (member: Member) => void;
  deleteMember: (id: string) => void;
  importMembers: (newMembers: Member[], mode: 'append' | 'replace') => void;
  getMemberById: (id: string) => Member | undefined;
  getMemberByNia: (nia: string) => Member | undefined;

  // Attendance CRUD
  addAttendanceSession: (sessionData: Omit<AttendanceSession, 'id' | 'records'>) => AttendanceSession;
  updateAttendanceSession: (session: AttendanceSession) => void;
  deleteAttendanceSession: (id: string) => void;
  setMemberAttendance: (sessionId: string, memberId: string, status: AttendanceStatus, note?: string) => void;
  batchSetAttendance: (sessionId: string, status: AttendanceStatus) => void;

  // Events CRUD
  addEvent: (eventData: Omit<MosqueEvent, 'id' | 'participants'>) => MosqueEvent;
  updateEvent: (event: MosqueEvent) => void;
  deleteEvent: (id: string) => void;
  assignEventParticipant: (eventId: string, participant: { memberId: string; roleInEvent: any; divisionSie?: string; note?: string }) => void;
  removeEventParticipant: (eventId: string, memberId: string) => void;

  // Profile
  updateMosqueProfile: (newProfile: MosqueProfile) => void;

  // Data management
  resetToDefaultData: () => void;
  exportDatabaseJson: () => void;
  importDatabaseJson: (jsonString: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  MEMBERS: 'sim_remas_members_v1',
  SESSIONS: 'sim_remas_sessions_v1',
  EVENTS: 'sim_remas_events_v1',
  PROFILE: 'sim_remas_profile_v1',
};

export const normalizeDivision = (div: any): Division => {
  if (!div) return 'Ekraf & Event';
  const s = String(div).toLowerCase().trim();
  if (s.includes('bph')) return 'BPH';
  if (s.includes('media') || s.includes('humas') || s.includes('it') || s.includes('publikasi') || s.includes('kemitraan')) return 'Media & Humas';
  return 'Ekraf & Event';
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedMemberForCard, setSelectedMemberForCard] = useState<Member | null>(null);
  const [verifyMemberModal, setVerifyMemberModal] = useState<Member | null>(null);

  // Initialize state with LocalStorage or defaults
  const [members, setMembers] = useState<Member[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      if (saved) {
        const parsed: Member[] = JSON.parse(saved);
        return parsed.map(m => ({
          ...m,
          division: normalizeDivision(m.division),
        }));
      }
      return initialMembers;
    } catch {
      return initialMembers;
    }
  });

  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return saved ? JSON.parse(saved) : initialAttendanceSessions;
    } catch {
      return initialAttendanceSessions;
    }
  });

  const [events, setEvents] = useState<MosqueEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
      return saved ? JSON.parse(saved) : initialMosqueEvents;
    } catch {
      return initialMosqueEvents;
    }
  });

  const [profile, setProfile] = useState<MosqueProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : initialMosqueProfile;
    } catch {
      return initialMosqueProfile;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(attendanceSessions));
  }, [attendanceSessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }, [profile]);

  // Set default selected member for ID Card studio
  useEffect(() => {
    if (!selectedMemberForCard && members.length > 0) {
      setSelectedMemberForCard(members[0]);
    }
  }, [members, selectedMemberForCard]);

  // --- MEMBER ACTIONS ---
  const addMember = (data: Omit<Member, 'id' | 'nia'> & { customNia?: string }): Member => {
    const year = new Date().getFullYear();
    const count = members.length + 1;
    const autoNia = data.customNia && data.customNia.trim() 
      ? data.customNia.trim() 
      : `RM-${year}-${String(count).padStart(3, '0')}`;
    
    const newMember: Member = {
      ...data,
      id: `mem-${Date.now()}`,
      nia: autoNia,
    };

    setMembers(prev => [newMember, ...prev]);
    return newMember;
  };

  const updateMember = (updated: Member) => {
    setMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
    if (selectedMemberForCard?.id === updated.id) {
      setSelectedMemberForCard(updated);
    }
    if (verifyMemberModal?.id === updated.id) {
      setVerifyMemberModal(updated);
    }
  };

  const deleteMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    if (selectedMemberForCard?.id === id) {
      setSelectedMemberForCard(members.find(m => m.id !== id) || null);
    }
    if (verifyMemberModal?.id === id) {
      setVerifyMemberModal(null);
    }
  };

  const importMembers = (newMembers: Member[], mode: 'append' | 'replace') => {
    const normalized = newMembers.map(m => ({
      ...m,
      division: normalizeDivision(m.division),
    }));

    if (mode === 'replace') {
      setMembers(normalized);
      if (normalized.length > 0) {
        setSelectedMemberForCard(normalized[0]);
      }
    } else {
      setMembers(prev => {
        const existingNias = new Set(prev.map(m => m.nia.toLowerCase().trim()));
        const toAdd = normalized.filter(m => !existingNias.has(m.nia.toLowerCase().trim()));
        return [...prev, ...toAdd];
      });
    }
  };

  const getMemberById = (id: string) => members.find(m => m.id === id);
  const getMemberByNia = (nia: string) => {
    const clean = nia.trim().toLowerCase();
    return members.find(m => m.nia.toLowerCase() === clean);
  };

  // --- ATTENDANCE ACTIONS ---
  const addAttendanceSession = (data: Omit<AttendanceSession, 'id' | 'records'>): AttendanceSession => {
    // Default all active members as Alpa or unmarked until attendance is taken
    const initialRecords = members
      .filter(m => m.status === 'Aktif')
      .map(m => ({
        memberId: m.id,
        status: 'Hadir' as AttendanceStatus,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      }));

    const newSession: AttendanceSession = {
      ...data,
      id: `att-${Date.now()}`,
      records: initialRecords,
    };

    setAttendanceSessions(prev => [newSession, ...prev]);
    return newSession;
  };

  const updateAttendanceSession = (session: AttendanceSession) => {
    setAttendanceSessions(prev => prev.map(s => s.id === session.id ? session : s));
  };

  const deleteAttendanceSession = (id: string) => {
    setAttendanceSessions(prev => prev.filter(s => s.id !== id));
  };

  const setMemberAttendance = (
    sessionId: string, 
    memberId: string, 
    status: AttendanceStatus, 
    note?: string
  ) => {
    setAttendanceSessions(prev => prev.map(session => {
      if (session.id !== sessionId) return session;

      const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      const existingRecordIndex = session.records.findIndex(r => r.memberId === memberId);

      let newRecords = [...session.records];
      if (existingRecordIndex >= 0) {
        newRecords[existingRecordIndex] = {
          ...newRecords[existingRecordIndex],
          status,
          timestamp: status === 'Hadir' ? (newRecords[existingRecordIndex].timestamp || nowTime) : undefined,
          note: note !== undefined ? note : newRecords[existingRecordIndex].note,
        };
      } else {
        newRecords.push({
          memberId,
          status,
          timestamp: status === 'Hadir' ? nowTime : undefined,
          note,
        });
      }

      return {
        ...session,
        records: newRecords
      };
    }));
  };

  const batchSetAttendance = (sessionId: string, status: AttendanceStatus) => {
    setAttendanceSessions(prev => prev.map(session => {
      if (session.id !== sessionId) return session;
      const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

      // Update all records or create for all active members
      const activeMemberIds = members.map(m => m.id);
      const newRecords = activeMemberIds.map(memberId => ({
        memberId,
        status,
        timestamp: status === 'Hadir' ? nowTime : undefined,
      }));

      return {
        ...session,
        records: newRecords
      };
    }));
  };

  // --- EVENTS ACTIONS ---
  const addEvent = (data: Omit<MosqueEvent, 'id' | 'participants'>): MosqueEvent => {
    const newEvent: MosqueEvent = {
      ...data,
      id: `evt-${Date.now()}`,
      participants: []
    };
    setEvents(prev => [newEvent, ...prev]);
    return newEvent;
  };

  const updateEvent = (updated: MosqueEvent) => {
    setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const assignEventParticipant = (
    eventId: string, 
    participant: { memberId: string; roleInEvent: any; divisionSie?: string; note?: string }
  ) => {
    setEvents(prev => prev.map(evt => {
      if (evt.id !== eventId) return evt;
      const filtered = evt.participants.filter(p => p.memberId !== participant.memberId);
      return {
        ...evt,
        participants: [...filtered, participant]
      };
    }));
  };

  const removeEventParticipant = (eventId: string, memberId: string) => {
    setEvents(prev => prev.map(evt => {
      if (evt.id !== eventId) return evt;
      return {
        ...evt,
        participants: evt.participants.filter(p => p.memberId !== memberId)
      };
    }));
  };

  // --- MOSQUE PROFILE ---
  const updateMosqueProfile = (newProfile: MosqueProfile) => {
    setProfile(newProfile);
  };

  // --- SYSTEM TOOLS ---
  const resetToDefaultData = () => {
    if (window.confirm('Kembalikan semua data ke pengaturan dan contoh data awal? Perubahan yang belum diekspor akan hilang.')) {
      setMembers(initialMembers);
      setAttendanceSessions(initialAttendanceSessions);
      setEvents(initialMosqueEvents);
      setProfile(initialMosqueProfile);
      setSelectedMemberForCard(initialMembers[0]);
    }
  };

  const exportDatabaseJson = () => {
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profile,
      members,
      attendanceSessions,
      events,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-sim-remas-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importDatabaseJson = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.members && Array.isArray(data.members)) {
        setMembers(data.members);
      }
      if (data.attendanceSessions && Array.isArray(data.attendanceSessions)) {
        setAttendanceSessions(data.attendanceSessions);
      }
      if (data.events && Array.isArray(data.events)) {
        setEvents(data.events);
      }
      if (data.profile) {
        setProfile(data.profile);
      }
      return true;
    } catch (err) {
      console.error('Import error:', err);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        members,
        attendanceSessions,
        events,
        profile,
        activeTab,
        setActiveTab,
        selectedMemberForCard,
        setSelectedMemberForCard,
        verifyMemberModal,
        setVerifyMemberModal,

        addMember,
        updateMember,
        deleteMember,
        importMembers,
        getMemberById,
        getMemberByNia,

        addAttendanceSession,
        updateAttendanceSession,
        deleteAttendanceSession,
        setMemberAttendance,
        batchSetAttendance,

        addEvent,
        updateEvent,
        deleteEvent,
        assignEventParticipant,
        removeEventParticipant,

        updateMosqueProfile,
        resetToDefaultData,
        exportDatabaseJson,
        importDatabaseJson,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
