'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  TrendingUp,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  Plus,
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  formatCurrency,
  getRelativeTime,
  getInitials,
  getAvatarColor,
} from '@/lib/utils';
import { STATUS_LABELS, SOURCE_LABELS } from '@/types';
import type { DashboardStats, Lead, LeadStatus } from '@/types';

interface DashboardProps {
  onNavigateToLeads: () => void;
}

const PIPELINE_COLORS: Record<string, string> = {
  new: 'bg-indigo-500',
  follow_up: 'bg-amber-400',
  orders_convert: 'bg-blue-500',
  design_phase: 'bg-purple-500',
  hold_order: 'bg-slate-400',
  payment_50: 'bg-teal-500',
  order_complete: 'bg-emerald-500',
};

const PIPELINE_DOTS: Record<string, string> = {
  new: 'bg-indigo-500',
  follow_up: 'bg-amber-400',
  orders_convert: 'bg-blue-500',
  design_phase: 'bg-purple-500',
  hold_order: 'bg-slate-400',
  payment_50: 'bg-teal-500',
  order_complete: 'bg-emerald-500',
};

export default function Dashboard({ onNavigateToLeads }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoadingStats(true);
    setLoadingLeads(true);
    setError(null);

    try {
      const [statsRes, leadsRes] = await Promise.all([
        fetch('/api/leads?stats=1'),
        fetch('/api/leads'),
      ]);

      const [statsData, leadsData] = await Promise.all([
        statsRes.json(),
        leadsRes.json(),
      ]);

      if (!statsRes.ok) throw new Error(statsData.error || 'Failed to load stats.');
      if (!leadsRes.ok) throw new Error(leadsData.error || 'Failed to load leads.');

      setStats(statsData.data);
      setRecentLeads((leadsData.data ?? []).slice(0, 8));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data.');
    } finally {
      setLoadingStats(false);
      setLoadingLeads(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (error) {
    return (
      <div className="p-6">
        <div className="card p-6 text-center">
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <button onClick={fetchData} className="btn-secondary gap-2 mx-auto">
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Status pipeline breakdown
  const pipelineStatuses: LeadStatus[] = [
    'new',
    'follow_up',
    'orders_convert',
    'design_phase',
    'hold_order',
    'payment_50',
    'order_complete',
  ];

  return (
    <div className="p-4 sm:p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <button
          onClick={onNavigateToLeads}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Add Lead</span>
        </button>
      </div>

      {/* Stats grid — 2 cols mobile, 4 cols desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {loadingStats ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse h-24">
              <div className="h-3 bg-slate-100 rounded w-20 mb-3" />
              <div className="h-7 bg-slate-100 rounded w-12" />
            </div>
          ))
        ) : stats ? (
          <>
            {/* Total */}
            <div className="card p-4 border-l-4 border-indigo-500">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-slate-500">Total Leads</p>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Users size={15} className="text-indigo-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-[11px] text-slate-400 mt-1">All time</p>
            </div>

            {/* Active */}
            <div className="card p-4 border-l-4 border-amber-400">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-slate-500">Active Pipeline</p>
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                  <TrendingUp size={15} className="text-amber-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.active}</p>
              <p className="text-[11px] text-slate-400 mt-1">{formatCurrency(stats.pipeline_value)}</p>
            </div>

            {/* Closed */}
            <div className="card p-4 border-l-4 border-emerald-500">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-slate-500">Closed Deals</p>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.closed}</p>
              <p className="text-[11px] text-slate-400 mt-1">{formatCurrency(stats.closed_value)}</p>
            </div>

            {/* Rejected */}
            <div className="card p-4 border-l-4 border-red-400">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-slate-500">Rejected</p>
                <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                  <XCircle size={15} className="text-red-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.rejected}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                {stats.total > 0 ? `${Math.round((stats.rejected / stats.total) * 100)}% loss rate` : '—'}
              </p>
            </div>
          </>
        ) : null}
      </div>

      {/* Value summary cards — pipeline + closed */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Total Pipeline Value */}
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-5 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold text-indigo-200 uppercase tracking-wider">Active Pipeline</p>
                <p className="text-2xl font-bold mt-1.5 tracking-tight">
                  {formatCurrency(stats.pipeline_value)}
                </p>
                <p className="text-xs text-indigo-200 mt-1">
                  {stats.active} active lead{stats.active !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="shrink-0 w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <TrendingUp size={18} className="text-white" />
              </div>
            </div>
          </div>

          {/* Closed Deal Value */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold text-emerald-100 uppercase tracking-wider">Closed Revenue</p>
                <p className="text-2xl font-bold mt-1.5 tracking-tight">
                  {formatCurrency(stats.closed_value)}
                </p>
                <p className="text-xs text-emerald-100 mt-1">
                  {stats.closed} deal{stats.closed !== 1 ? 's' : ''} closed
                </p>
              </div>
              <div className="shrink-0 w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <CheckCircle2 size={18} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom two columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Pipeline stages — 2 cols on desktop */}
        {stats && stats.total > 0 && (
          <div className="card p-5 lg:col-span-2">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Pipeline Stages</h3>
            <div className="space-y-3">
              {pipelineStatuses.map((s) => {
                const count = stats.by_status[s] ?? 0;
                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                const barColor = PIPELINE_COLORS[s] ?? 'bg-slate-400';
                const dotColor = PIPELINE_DOTS[s] ?? 'bg-slate-400';
                return (
                  <div key={s}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                        <span className="text-xs text-slate-600 truncate">{STATUS_LABELS[s]}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-700 ml-2 shrink-0">{count}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent leads */}
        <div className={`card overflow-hidden ${stats && stats.total > 0 ? 'lg:col-span-3' : 'lg:col-span-5'}`}>
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Recent Leads</h3>
            <button
              onClick={onNavigateToLeads}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
            >
              View all
              <ArrowRight size={13} />
            </button>
          </div>

          {loadingLeads ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-9 h-9 bg-slate-100 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-slate-100 rounded w-32" />
                    <div className="h-3 bg-slate-100 rounded w-24" />
                  </div>
                  <div className="h-5 bg-slate-100 rounded-full w-20" />
                </div>
              ))}
            </div>
          ) : recentLeads.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Users size={22} className="text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-500">No leads yet</p>
              <p className="text-xs text-slate-400 mt-1">Start by adding your first lead</p>
              <button onClick={onNavigateToLeads} className="btn-primary mt-4 mx-auto">
                <Plus size={14} />
                Add First Lead
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {recentLeads.map((lead) => {
                const initials = getInitials(lead.name);
                const avatarColor = getAvatarColor(lead.name);
                return (
                  <li
                    key={lead.id}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer"
                    onClick={onNavigateToLeads}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold text-white ${avatarColor}`}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{lead.name}</p>
                      <p className="text-xs text-slate-400 truncate">
                        {SOURCE_LABELS[lead.source]} · {getRelativeTime(lead.updated_at)}
                      </p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <StatusBadge status={lead.status} />
                      {lead.order_value != null && (
                        <span className="text-[10px] font-semibold text-slate-500">
                          {formatCurrency(lead.order_value)}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}
