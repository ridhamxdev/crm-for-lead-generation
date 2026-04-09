'use client';

import { LayoutDashboard, Users, X, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/lib/useUser';
import type { View } from '@/types';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { view: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
  { view: 'leads' as View, label: 'All Leads', icon: Users },
];

export default function Sidebar({ currentView, onViewChange, isOpen, onClose }: SidebarProps) {
  const user = useUser();
  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '…';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 overlay lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 flex flex-col',
          'bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl',
          'transition-transform duration-300 ease-in-out',
          'lg:relative lg:translate-x-0 lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo / Brand */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Lead Gen CRM</p>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                CRM
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden btn-icon text-slate-400 hover:text-white hover:bg-white/10"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Menu
          </p>
          {NAV_ITEMS.map(({ view, label, icon: Icon }) => (
            <button
              key={view}
              onClick={() => onViewChange(view)}
              className={cn('nav-link w-full text-left', currentView === view && 'active')}
            >
              <Icon size={17} strokeWidth={currentView === view ? 2.5 : 2} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Footer — user info */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name ?? '—'}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email ?? ''}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
