'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import {
  ALL_STATUSES,
  ALL_SOURCES,
  STATUS_LABELS,
  SOURCE_LABELS,
} from '@/types';
import type { Lead, CreateLeadInput, UpdateLeadInput } from '@/types';

interface LeadFormModalProps {
  mode: 'add' | 'edit';
  lead?: Lead;
  onClose: () => void;
  onSuccess: (lead: Lead) => void;
}

type FormData = {
  name: string;
  phone: string;
  email: string;
  source: string;
  status: string;
  order_value: string;
  address: string;
  notes: string;
};

const EMPTY_FORM: FormData = {
  name: '',
  phone: '',
  email: '',
  source: 'other',
  status: 'new',
  order_value: '',
  address: '',
  notes: '',
};

export default function LeadFormModal({ mode, lead, onClose, onSuccess }: LeadFormModalProps) {
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Pre-fill for edit mode
  useEffect(() => {
    if (mode === 'edit' && lead) {
      setForm({
        name: lead.name,
        phone: lead.phone,
        email: lead.email ?? '',
        source: lead.source,
        status: lead.status,
        order_value: lead.order_value != null ? String(lead.order_value) : '',
        address: lead.address ?? '',
        notes: lead.notes ?? '',
      });
    }
  }, [mode, lead]);

  const set = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setApiError(null);
  };

  const validate = (): boolean => {
    const errs: Partial<FormData> = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.phone.trim()) {
      errs.phone = 'Phone number is required.';
    } else {
      const digits = form.phone.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 13) errs.phone = 'Must be 10–13 digits.';
    }
    if (form.order_value && isNaN(Number(form.order_value))) {
      errs.order_value = 'Must be a valid number.';
    }
    if (form.order_value && Number(form.order_value) < 0) {
      errs.order_value = 'Must be a positive number.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError(null);

    try {
      const payload: CreateLeadInput | UpdateLeadInput = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        source: form.source as Lead['source'],
        status: form.status as Lead['status'],
        order_value: form.order_value ? Number(form.order_value) : null,
        address: form.address.trim() || undefined,
        notes: form.notes.trim() || undefined,
      };

      const url = mode === 'add' ? '/api/leads' : `/api/leads/${lead!.id}`;
      const method = mode === 'add' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');

      onSuccess(data.data);
      onClose();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to save lead.');
    } finally {
      setLoading(false);
    }
  };

  const title = mode === 'add' ? 'Add New Lead' : 'Edit Lead';

  return (
    <Modal isOpen onClose={onClose} title={title} size="lg">
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Name */}
          <div className="sm:col-span-2">
            <label className="form-label">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. Priya Sharma"
              className={`form-input ${errors.name ? 'ring-2 ring-red-400 border-red-300' : ''}`}
              autoComplete="off"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="form-label">
              WhatsApp Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={set('phone')}
              placeholder="9876543210"
              className={`form-input ${errors.phone ? 'ring-2 ring-red-400 border-red-300' : ''}`}
              autoComplete="off"
            />
            {errors.phone ? (
              <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
            ) : (
              <p className="text-[10px] text-slate-400 mt-1">Used for WhatsApp follow-ups</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="form-label">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="priya@example.com"
              className="form-input"
              autoComplete="off"
            />
          </div>

          {/* Source */}
          <div>
            <label className="form-label">Lead Source</label>
            <select value={form.source} onChange={set('source')} className="form-input">
              {ALL_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {SOURCE_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="form-label">Status</label>
            <select value={form.status} onChange={set('status')} className="form-input">
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          {/* Order value */}
          <div>
            <label className="form-label">Order Value (₹)</label>
            <input
              type="number"
              value={form.order_value}
              onChange={set('order_value')}
              placeholder="e.g. 85000"
              className={`form-input ${errors.order_value ? 'ring-2 ring-red-400 border-red-300' : ''}`}
              min="0"
              step="1"
            />
            {errors.order_value && (
              <p className="text-xs text-red-500 mt-1">{errors.order_value}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="form-label">Address / Location</label>
            <input
              type="text"
              value={form.address}
              onChange={set('address')}
              placeholder="e.g. Andheri West, Mumbai"
              className="form-input"
              autoComplete="off"
            />
          </div>

          {/* Notes */}
          <div className="sm:col-span-2">
            <label className="form-label">Notes</label>
            <textarea
              value={form.notes}
              onChange={set('notes')}
              placeholder="Any additional info about this lead..."
              className="form-input resize-none"
              rows={3}
            />
          </div>
        </div>

        {apiError && (
          <div className="mt-4 text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2.5 rounded-lg">
            {apiError}
          </div>
        )}

        <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-slate-100">
          <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" />
                {mode === 'add' ? 'Adding…' : 'Saving…'}
              </>
            ) : mode === 'add' ? (
              'Add Lead'
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
