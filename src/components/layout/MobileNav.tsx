'use client';

import { LayoutDashboard, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { View } from '@/types';

interface MobileNavProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const NAV = [
  { view: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
  { view: 'leads' as View, label: 'Leads', icon: Users },
];

export default function MobileNav({ currentView, onViewChange }: MobileNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-20 bg-white border-t border-slate-100 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
      <div className="flex">
        {NAV.map(({ view, label, icon: Icon }) => {
          const active = currentView === view;
          return (
            <button
              key={view}
              onClick={() => onViewChange(view)}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold',
                'transition-colors duration-150',
                active ? 'text-indigo-600' : 'text-slate-400',
              )}
            >
              <Icon
                size={20}
                strokeWidth={active ? 2.5 : 2}
                className={active ? 'text-indigo-600' : 'text-slate-400'}
              />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
