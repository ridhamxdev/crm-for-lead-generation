'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import Dashboard from '@/components/dashboard/Dashboard';
import LeadsView from '@/components/leads/LeadsView';
import type { View } from '@/types';

export default function DashboardPage() {
  const [view, setView] = useState<View>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-slate-50">
      {/* Sidebar — desktop persistent, mobile overlay */}
      <Sidebar
        currentView={view}
        onViewChange={(v) => {
          setView(v);
          setSidebarOpen(false);
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header currentView={view} onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20 lg:pb-0">
          {view === 'dashboard' ? (
            <Dashboard onNavigateToLeads={() => setView('leads')} />
          ) : (
            <LeadsView />
          )}
        </main>

        {/* Bottom nav — mobile only */}
        <MobileNav currentView={view} onViewChange={setView} />
      </div>
    </div>
  );
}
