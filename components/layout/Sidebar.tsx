
import React, { useState, useRef, useEffect } from 'react';
import { Shield, LayoutDashboard, Microscope, Settings, User, FileClock, LogOut, ChevronUp, ExternalLink } from 'lucide-react';
import { AuthUser } from '../../types';

interface SidebarProps {
  currentView: 'dashboard' | 'audit' | 'lab' | 'settings';
  onNavigate: (view: 'dashboard' | 'audit' | 'lab' | 'settings') => void;
  onLogout: () => void;
  user: AuthUser | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onLogout, user }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-64 h-screen bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col fixed left-0 top-0 z-50 hidden md:flex transition-colors duration-300">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
        <Shield className="w-6 h-6 text-emerald-500 mr-3" />
        <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-white">TrustLayer</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={currentView === 'dashboard'} 
            onClick={() => onNavigate('dashboard')}
        />
        <NavItem 
            icon={<Microscope size={20} />} 
            label="Forensic Lab" 
            active={currentView === 'lab'} 
            onClick={() => onNavigate('lab')}
        />
        <NavItem 
            icon={<FileClock size={20} />} 
            label="Audit Trail" 
            active={currentView === 'audit'} 
            onClick={() => onNavigate('audit')}
        />
        <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-800">
          <NavItem 
              icon={<Settings size={20} />} 
              label="Settings" 
              active={currentView === 'settings'}
              onClick={() => onNavigate('settings')}
          />
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 relative" ref={profileRef}>
        
        {showProfileMenu && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2">
            <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex flex-col gap-1">
               <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Node</span>
               <span className="text-xs text-zinc-300 font-mono">us-east-4.trustlayer.io</span>
            </div>
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left font-medium"
            >
              <LogOut size={16} />
              Sign Out Session
            </button>
          </div>
        )}

        <button 
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="flex items-center gap-3 w-full p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 hover:border-emerald-500/30 transition-all group overflow-hidden"
        >
          {user?.avatar ? (
            <img src={user.avatar} className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm" alt="User" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <User size={16} />
            </div>
          )}
          
          <div className="flex flex-col items-start flex-1 min-w-0">
            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-100 truncate w-full">{user?.name || 'Agent Unknown'}</span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono truncate w-full">{user?.email || 'unauthorized'}</span>
          </div>
          <ChevronUp size={14} className={`text-zinc-500 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
    active 
      ? 'bg-emerald-500/10 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm' 
      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900/50'
  }`}>
    <span className="mr-3">{icon}</span>
    {label}
  </button>
);
