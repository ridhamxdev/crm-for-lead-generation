'use client';

import { useState } from 'react';
import {
  Pencil,
  Trash2,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Phone,
  MapPin,
  StickyNote,
  IndianRupee,
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  formatCurrency,
  getRelativeTime,
  getInitials,
  getAvatarColor,
  cn,
} from '@/lib/utils';
import { SOURCE_LABELS, STATUS_LABELS, ALL_STATUSES } from '@/types';
import type { Lead, LeadStatus } from '@/types';

interface LeadCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onWhatsApp: (lead: Lead) => void;
  onStatusChange: (id: number, status: LeadStatus) => void;
}

export default function LeadCard({
  lead,
  onEdit,
  onDelete,
  onWhatsApp,
  onStatusChange,
}: LeadCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const initials = getInitials(lead.name);
  const avatarColor = getAvatarColor(lead.name);

  return (
    <div className="card overflow-hidden transition-shadow hover:shadow-md active:shadow-sm">
      {/* Top section */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div
            className={`w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-bold text-white ${avatarColor}`}
          >
            {initials}
          </div>

          {/* Name + source */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 text-sm leading-tight truncate">{lead.name}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{SOURCE_LABELS[lead.source]}</p>
            {/* Phone — prominent */}
            <div className="flex items-center gap-1 mt-1">
              <Phone size={11} className="text-slate-400 flex-shrink-0" />
              <span className="text-xs text-slate-600 font-medium tracking-wide">{lead.phone}</span>
            </div>
          </div>

          {/* Status badge — tappable to change */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setStatusOpen((v) => !v)}
              className="flex items-center gap-1"
              aria-label="Change status"
            >
              <StatusBadge status={lead.status} />
              <ChevronDown size={12} className="text-slate-400" />
            </button>

            {statusOpen && (
              <div className="absolute right-0 top-full mt-1 z-30 bg-white border border-slate-200 rounded-xl shadow-xl w-52 py-1 overflow-hidden">
                <p className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                  Change status
                </p>
                {ALL_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      onStatusChange(lead.id, s);
                      setStatusOpen(false);
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2.5 text-sm hover:bg-slate-50 transition-colors',
                      s === lead.status && 'font-semibold text-indigo-600 bg-indigo-50',
                    )}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Order value pill + date */}
        <div className="flex items-center justify-between mt-3">
          {lead.order_value != null ? (
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg px-2.5 py-1">
              <IndianRupee size={11} className="text-slate-500" />
              <span className="text-xs font-semibold text-slate-700">
                {formatCurrency(lead.order_value)}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400">No order value</span>
          )}
          <span className="text-[10px] text-slate-400">{getRelativeTime(lead.created_at)}</span>
        </div>

        {/* Expandable details */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
            {lead.address && (
              <div className="flex items-start gap-2 text-xs text-slate-600">
                <MapPin size={12} className="text-slate-400 mt-0.5 flex-shrink-0" />
                {lead.address}
              </div>
            )}
            {lead.notes && (
              <div className="flex items-start gap-2 text-xs text-slate-600">
                <StickyNote size={12} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">{lead.notes}</span>
              </div>
            )}
            <p className="text-[10px] text-slate-400">
              Updated {getRelativeTime(lead.updated_at)}
            </p>
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="flex items-stretch border-t border-slate-100">
        {/* WhatsApp — primary CTA */}
        <button
          onClick={() => onWhatsApp(lead)}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[#25d366] hover:bg-green-50 active:bg-green-100 transition-colors text-xs font-semibold"
          aria-label="Send WhatsApp message"
        >
          <MessageCircle size={15} />
          WhatsApp
        </button>

        <div className="w-px bg-slate-100" />

        {/* Edit */}
        <button
          onClick={() => onEdit(lead)}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors text-xs font-medium"
          aria-label="Edit lead"
        >
          <Pencil size={14} />
          Edit
        </button>

        <div className="w-px bg-slate-100" />

        {/* More / Delete */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="px-4 flex items-center justify-center text-slate-400 hover:bg-slate-50 active:bg-slate-100 transition-colors"
          aria-label={expanded ? 'Show less' : 'Show more'}
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <div className="w-px bg-slate-100" />

        <button
          onClick={() => onDelete(lead)}
          className="px-4 flex items-center justify-center text-red-400 hover:bg-red-50 active:bg-red-100 transition-colors"
          aria-label="Delete lead"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
