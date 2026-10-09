import React from 'react';
import { useApp, ActiveTab } from '../context/AppContext';
import { UserPlus } from 'lucide-react';

interface NavbarProps {
  onOpenAddMember: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAddMember }) => {
  const { activeTab, setActiveTab } = useApp();

  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'members', label: 'Anggota' },
    { id: 'attendance', label: 'Presensi' },
    { id: 'events', label: 'Kegiatan' },
    { id: 'idcard', label: 'KTA Digital' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title, one line wordmark */}
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="w-8 h-8 rounded-lg bg-emerald-800 text-amber-300 font-bold flex items-center justify-center text-sm shadow-sm">
            🕌
          </span>
          <span className="text-emerald-950 font-extrabold tracking-tight">SIM-REMAS</span>
        </button>

        {/* Zone 2: 4-5 nav links, 1-2 word labels, single line */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`whitespace-nowrap shrink-0 py-1 transition-colors relative ${
                  isActive 
                    ? 'text-emerald-700 font-semibold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenAddMember}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Anggota Baru</span>
          </button>
        </div>
      </div>

      {/* Mobile subnav bar for compact touch screens */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 bg-slate-50 px-2 py-2 overflow-x-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap rounded-md ${
              activeTab === item.id 
                ? 'bg-emerald-700 text-white' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
