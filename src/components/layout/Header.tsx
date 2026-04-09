'use client';

import { Menu, Bell } from 'lucide-react';
import type { View } from '@/app/page';

const VIEW_TITLES: Record<View, string> = {
  dashboard: 'Dashboard',
  leads: 'All Leads',
};

interface HeaderProps {
  currentView: View;
  onMenuClick: () => void;
}

export default function Header({ currentView, onMenuClick }: HeaderProps) {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-100 shadow-sm">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="lg:hidden btn-icon text-slate-500 hover:text-slate-800 hover:bg-slate-100"
        aria-label="Open navigation menu"
      >
        <Menu size={20} />
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-slate-900 truncate">
          {VIEW_TITLES[currentView]}
        </h1>
        <p className="text-xs text-slate-400 hidden sm:block">{today}</p>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <button
          className="btn-icon text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white select-none">
          VG
        </div>
      </div>
    </header>
  );
}
