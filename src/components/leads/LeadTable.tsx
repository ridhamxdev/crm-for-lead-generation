'use client';

import { useState, useRef, useEffect } from 'react';
import { Pencil, Trash2, MessageCircle, ChevronDown, MoreVertical } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  formatCurrency,
  formatDate,
  getRelativeTime,
  getInitials,
  getAvatarColor,
  cn,
} from '@/lib/utils';
import { STATUS_LABELS, SOURCE_LABELS, ALL_STATUSES } from '@/types';
import type { Lead, LeadStatus } from '@/types';

interface LeadTableProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onWhatsApp: (lead: Lead) => void;
  onStatusChange: (id: number, status: LeadStatus) => void;
}

export default function LeadTable({
  leads,
  onEdit,
  onDelete,
  onWhatsApp,
  onStatusChange,
}: LeadTableProps) {
  const [openStatusId, setOpenStatusId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = () => {
      setOpenStatusId(null);
      setOpenMenuId(null);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="th">Lead</th>
            <th className="th">Phone</th>
            <th className="th hidden md:table-cell">Source</th>
            <th className="th">Status</th>
            <th className="th hidden lg:table-cell">Order Value</th>
            <th className="th hidden xl:table-cell">Updated</th>
            <th className="th text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {leads.map((lead) => {
            const initials = getInitials(lead.name);
            const avatarColor = getAvatarColor(lead.name);

            return (
              <tr
                key={lead.id}
                className="hover:bg-slate-50/60 transition-colors group"
              >
                {/* Lead name + email */}
                <td className="td">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold text-white ${avatarColor}`}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate max-w-[140px]">
                        {lead.name}
                      </p>
                      {lead.email && (
                        <p className="text-xs text-slate-400 truncate max-w-[140px]">
                          {lead.email}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Phone */}
                <td className="td">
                  <span className="font-medium text-slate-700">{lead.phone}</span>
                </td>

                {/* Source */}
                <td className="td hidden md:table-cell">
                  <span className="text-slate-500">{SOURCE_LABELS[lead.source]}</span>
                </td>

                {/* Status — dropdown */}
                <td className="td" onClick={stopPropagation}>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenStatusId(openStatusId === lead.id ? null : lead.id)
                      }
                      className="flex items-center gap-1 group/status"
                      aria-label="Change lead status"
                    >
                      <StatusBadge status={lead.status} />
                      <ChevronDown
                        size={12}
                        className="text-slate-400 opacity-0 group-hover/status:opacity-100 transition-opacity"
                      />
                    </button>

                    {openStatusId === lead.id && (
                      <div className="absolute left-0 top-full mt-1 z-30 bg-white border border-slate-200 rounded-xl shadow-xl w-52 py-1 overflow-hidden animate-slide-up">
                        <p className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                          Change status
                        </p>
                        {ALL_STATUSES.map((s) => (
                          <button
                            key={s}
                            onClick={() => {
                              onStatusChange(lead.id, s);
                              setOpenStatusId(null);
                            }}
                            className={cn(
                              'w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors',
                              s === lead.status && 'font-semibold text-indigo-600 bg-indigo-50',
                            )}
                          >
                            {STATUS_LABELS[s]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </td>

                {/* Order value */}
                <td className="td hidden lg:table-cell">
                  {lead.order_value != null ? (
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(lead.order_value)}
                    </span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>

                {/* Updated */}
                <td className="td hidden xl:table-cell">
                  <span
                    className="text-slate-400"
                    title={formatDate(lead.updated_at)}
                  >
                    {getRelativeTime(lead.updated_at)}
                  </span>
                </td>

                {/* Actions */}
                <td className="td text-right" onClick={stopPropagation}>
                  {/* Desktop — inline icons */}
                  <div className="hidden sm:flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onWhatsApp(lead)}
                      className="btn-icon w-8 h-8 text-green-600 hover:bg-green-50"
                      title="Send WhatsApp message"
                    >
                      <MessageCircle size={15} />
                    </button>
                    <button
                      onClick={() => onEdit(lead)}
                      className="btn-icon w-8 h-8 text-slate-500 hover:bg-slate-100"
                      title="Edit lead"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(lead)}
                      className="btn-icon w-8 h-8 text-red-400 hover:bg-red-50"
                      title="Delete lead"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Mobile — kebab menu */}
                  <div className="sm:hidden relative">
                    <button
                      onClick={() =>
                        setOpenMenuId(openMenuId === lead.id ? null : lead.id)
                      }
                      className="btn-icon w-8 h-8 text-slate-400 hover:bg-slate-100"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {openMenuId === lead.id && (
                      <div className="absolute right-0 top-full mt-1 z-30 bg-white border border-slate-200 rounded-xl shadow-xl w-44 py-1 animate-slide-up">
                        {[
                          { label: 'WhatsApp', icon: MessageCircle, action: () => onWhatsApp(lead), color: 'text-green-600' },
                          { label: 'Edit', icon: Pencil, action: () => onEdit(lead), color: 'text-slate-600' },
                          { label: 'Delete', icon: Trash2, action: () => onDelete(lead), color: 'text-red-500' },
                        ].map(({ label, icon: Icon, action, color }) => (
                          <button
                            key={label}
                            onClick={() => { action(); setOpenMenuId(null); }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs hover:bg-slate-50 transition-colors ${color}`}
                          >
                            <Icon size={14} />
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
