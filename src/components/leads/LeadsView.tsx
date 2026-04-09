'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, LayoutGrid, List, X, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import LeadTable from './LeadTable';
import LeadCard from './LeadCard';
import LeadFormModal from './LeadFormModal';
import WhatsAppModal from './WhatsAppModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { ALL_STATUSES, STATUS_LABELS, ALL_SOURCES, SOURCE_LABELS } from '@/types';
import type { Lead, LeadStatus } from '@/types';
import { cn } from '@/lib/utils';

type ViewMode = 'table' | 'grid';

function toYearMonth(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function monthLabel(ym: string) {
  const [y, m] = ym.split('-');
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });
}
function addMonths(ym: string, delta: number) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return toYearMonth(d);
}
const THIS_MONTH = toYearMonth(new Date());

export default function LeadsView() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all'); // 'all' or 'YYYY-MM'
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showFilters, setShowFilters] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [whatsAppLead, setWhatsAppLead] = useState<Lead | null>(null);
  const [deleteLead, setDeleteLead] = useState<Lead | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (sourceFilter !== 'all') params.set('source', sourceFilter);
      if (monthFilter !== 'all') params.set('month', monthFilter);

      const res = await fetch(`/api/leads?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load leads.');
      setLeads(data.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sourceFilter, monthFilter]);

  // Debounced fetch on filter changes
  useEffect(() => {
    const t = setTimeout(fetchLeads, 300);
    return () => clearTimeout(t);
  }, [fetchLeads]);

  const handleStatusChange = async (id: number, status: LeadStatus) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLeads((prev) => prev.map((l) => (l.id === id ? data.data : l)));
    } catch {
      // Silently refetch to sync state
      fetchLeads();
    }
  };

  const handleDelete = async () => {
    if (!deleteLead) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/leads/${deleteLead.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      setLeads((prev) => prev.filter((l) => l.id !== deleteLead.id));
      setDeleteLead(null);
    } catch {
      fetchLeads();
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleLeadSaved = (saved: Lead) => {
    setLeads((prev) => {
      const idx = prev.findIndex((l) => l.id === saved.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = saved;
        return updated;
      }
      return [saved, ...prev];
    });
  };

  const activeFilters = [statusFilter !== 'all', sourceFilter !== 'all', monthFilter !== 'all'].filter(Boolean).length;

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, email…"
            className="form-input pl-9 pr-9"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Month navigator */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-1.5 shadow-sm">
          <button
            onClick={() => setMonthFilter((m) => addMonths(m === 'all' ? THIS_MONTH : m, -1))}
            className="btn-icon w-7 h-7 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            aria-label="Previous month"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="text-xs font-semibold text-slate-700 min-w-[90px] text-center">
            {monthFilter === 'all' ? 'All Time' : monthLabel(monthFilter)}
          </span>
          <button
            onClick={() => setMonthFilter((m) => {
              if (m === 'all') return THIS_MONTH;
              const next = addMonths(m, 1);
              return next > THIS_MONTH ? 'all' : next;
            })}
            className="btn-icon w-7 h-7 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            aria-label="Next month"
          >
            <ChevronRight size={15} />
          </button>
          {monthFilter !== 'all' && (
            <button
              onClick={() => setMonthFilter('all')}
              className="ml-1 text-[10px] font-semibold text-indigo-600 hover:underline"
            >
              All
            </button>
          )}
        </div>

        {/* Filter toggle button (mobile) */}
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={cn(
            'btn-secondary gap-2',
            activeFilters > 0 && 'bg-indigo-50 text-indigo-700 border-indigo-200 border',
          )}
        >
          <Filter size={14} />
          Filters
          {activeFilters > 0 && (
            <span className="w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </button>

        {/* View toggle — desktop only */}
        <div className="hidden lg:flex items-center bg-slate-100 rounded-xl p-1 gap-0.5">
          <button
            onClick={() => setViewMode('table')}
            className={cn(
              'btn-icon w-8 h-8 rounded-lg',
              viewMode === 'table'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-400 hover:text-slate-700',
            )}
            aria-label="Table view"
          >
            <List size={15} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'btn-icon w-8 h-8 rounded-lg',
              viewMode === 'grid'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-400 hover:text-slate-700',
            )}
            aria-label="Grid view"
          >
            <LayoutGrid size={15} />
          </button>
        </div>

        {/* Add lead */}
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          <Plus size={16} />
          <span className="hidden sm:inline">Add Lead</span>
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="card p-4 flex flex-wrap gap-4 animate-slide-up">
          <div className="flex-1 min-w-[180px]">
            <label className="form-label text-[11px]">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
            >
              <option value="all">All Statuses</option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="form-label text-[11px]">Source</label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="form-input"
            >
              <option value="all">All Sources</option>
              {ALL_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {SOURCE_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          {activeFilters > 0 && (
            <div className="flex items-end">
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setSourceFilter('all');
                  setMonthFilter('all');
                }}
                className="btn-secondary text-xs h-[42px]"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Status quick-filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setStatusFilter('all')}
          className={cn(
            'flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
            statusFilter === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200',
          )}
        >
          All
        </button>
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
            className={cn(
              'flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
              statusFilter === s
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200',
            )}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Content area */}
      {error ? (
        <div className="card p-6 text-center text-sm text-red-600">{error}</div>
      ) : loading ? (
        <div className="card p-12 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <span className="spinner w-6 h-6 border-slate-300" style={{ borderTopColor: '#6366f1' }} />
            <span className="text-sm">Loading leads…</span>
          </div>
        </div>
      ) : leads.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Search size={28} />}
            title={search || activeFilters > 0 ? 'No leads match your filters' : 'No leads yet'}
            description={
              search || activeFilters > 0
                ? 'Try adjusting your search or filters.'
                : 'Add your first lead to start tracking your pipeline.'
            }
            action={
              !search && activeFilters === 0 ? (
                <button onClick={() => setShowAddModal(true)} className="btn-primary">
                  <Plus size={15} />
                  Add First Lead
                </button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <>
          {/* Mobile: always card grid */}
          <div className="lg:hidden">
            <p className="text-xs font-semibold text-slate-500 mb-3">
              {leads.length} lead{leads.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 gap-3">
              {leads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onEdit={setEditLead}
                  onDelete={setDeleteLead}
                  onWhatsApp={setWhatsAppLead}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          </div>

          {/* Desktop: respect viewMode */}
          <div className="hidden lg:block">
            {viewMode === 'table' ? (
              <div className="card overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-500">
                    {leads.length} lead{leads.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <LeadTable
                  leads={leads}
                  onEdit={setEditLead}
                  onDelete={setDeleteLead}
                  onWhatsApp={setWhatsAppLead}
                  onStatusChange={handleStatusChange}
                />
              </div>
            ) : (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-3">
                  {leads.length} lead{leads.length !== 1 ? 's' : ''}
                </p>
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                  {leads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onEdit={setEditLead}
                      onDelete={setDeleteLead}
                      onWhatsApp={setWhatsAppLead}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Floating add button — always visible on mobile */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-20 right-4 z-10 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl flex items-center justify-center lg:hidden transition-transform active:scale-95"
        aria-label="Add lead"
      >
        <Plus size={24} />
      </button>

      {/* Modals */}
      {showAddModal && (
        <LeadFormModal
          mode="add"
          onClose={() => setShowAddModal(false)}
          onSuccess={handleLeadSaved}
        />
      )}
      {editLead && (
        <LeadFormModal
          mode="edit"
          lead={editLead}
          onClose={() => setEditLead(null)}
          onSuccess={handleLeadSaved}
        />
      )}
      {whatsAppLead && (
        <WhatsAppModal lead={whatsAppLead} onClose={() => setWhatsAppLead(null)} />
      )}
      {deleteLead && (
        <ConfirmDialog
          isOpen
          onClose={() => setDeleteLead(null)}
          onConfirm={handleDelete}
          title="Delete Lead"
          message={`Are you sure you want to delete "${deleteLead.name}"? This action cannot be undone.`}
          confirmLabel="Delete Lead"
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
