import React, { useState } from 'react';
import { Bell, Search, Menu, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CaseRecord } from '../../types';

interface HeaderProps {
  pendingCases?: CaseRecord[];
  onOpenCase: (record: CaseRecord) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSearchSubmit: () => void;
}

export const Header: React.FC<HeaderProps> = ({ pendingCases = [], onOpenCase, searchTerm, onSearchChange, onSearchSubmit }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const handleNotificationClick = (caseRecord: CaseRecord) => {
    setShowNotifications(false);
    onOpenCase(caseRecord);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchSubmit();
    }
  };

  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40 transition-colors duration-300">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-zinc-500 dark:text-zinc-400">
          <Menu size={24} />
        </button>
        <div className="hidden md:flex items-center px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md transition-colors">
          <Search size={14} className="text-zinc-400 dark:text-zinc-500 mr-2" />
          <input 
            type="text" 
            placeholder="Search Case ID or Hash..." 
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent border-none outline-none text-sm text-zinc-800 dark:text-zinc-200 w-64 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
            <span className="text-xs font-mono text-amber-600 dark:text-amber-500 font-medium">SYSTEM ACTIVE</span>
        </div>

        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-800 mx-1"></div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-full transition-colors ${showNotifications ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
          >
            <Bell size={20} />
            {pendingCases.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white dark:border-zinc-950 rounded-full"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 origin-top-right">
              <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">Notifications</h3>
                <span className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">{pendingCases.length} Pending</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {pendingCases.length === 0 ? (
                  <div className="p-8 text-center text-zinc-500 text-sm">
                    <CheckCircle2 className="mx-auto mb-2 text-zinc-300 dark:text-zinc-700" size={24} />
                    All caught up! No cases pending review.
                  </div>
                ) : (
                  <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {pendingCases.map((c) => (
                      <li 
                        key={c.id} 
                        onClick={() => handleNotificationClick(c)}
                        className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-start gap-3">
                          <AlertCircle size={16} className="text-blue-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-emerald-500 transition-colors">Approval Required</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                              Case <span className="font-mono text-emerald-600 dark:text-emerald-400">{c.id}</span> finished analysis.
                            </p>
                            <span className="text-[10px] text-zinc-400 mt-1 block">{new Date(c.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {pendingCases.length > 0 && (
                <div className="p-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                   <button className="w-full text-xs text-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 py-1">
                     View Audit Trail
                   </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};