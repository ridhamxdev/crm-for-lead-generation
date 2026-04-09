// ─── App Views ───────────────────────────────────────────────────────────────

export type View = 'dashboard' | 'leads';

// ─── Lead Status ────────────────────────────────────────────────────────────

export type LeadStatus =
  | 'new'
  | 'follow_up'
  | 'orders_convert'
  | 'design_phase'
  | 'hold_order'
  | 'payment_50'
  | 'order_complete'
  | 'closed'
  | 'rejected';

export type LeadSource =
  | 'google_ads'
  | 'meta_ads'
  | 'referral'
  | 'walk_in'
  | 'other';

// ─── DB Model ────────────────────────────────────────────────────────────────

export interface Lead {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  source: LeadSource;
  status: LeadStatus;
  order_value: number | null;
  notes: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

// ─── API Inputs ──────────────────────────────────────────────────────────────

export interface CreateLeadInput {
  name: string;
  phone: string;
  email?: string;
  source?: LeadSource;
  status?: LeadStatus;
  order_value?: number | null;
  notes?: string;
  address?: string;
}

export interface UpdateLeadInput {
  name?: string;
  phone?: string;
  email?: string | null;
  source?: LeadSource;
  status?: LeadStatus;
  order_value?: number | null;
  notes?: string | null;
  address?: string | null;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// ─── Display Metadata ────────────────────────────────────────────────────────

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New Lead',
  follow_up: 'Follow Up',
  orders_convert: 'Orders Convert',
  design_phase: 'Design Phase',
  hold_order: 'Hold Order',
  payment_50: '50% Payment Done',
  order_complete: 'Order Complete',
  closed: 'Successfully Closed',
  rejected: 'Rejected',
};

export const STATUS_COLORS: Record<LeadStatus, { bg: string; text: string; dot: string }> = {
  new: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  follow_up: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  orders_convert: { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500' },
  design_phase: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  hold_order: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  payment_50: { bg: 'bg-teal-50', text: 'text-teal-700', dot: 'bg-teal-500' },
  order_complete: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  closed: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  rejected: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
};

export const SOURCE_LABELS: Record<LeadSource, string> = {
  google_ads: 'Google Ads',
  meta_ads: 'Meta Ads',
  referral: 'Referral',
  walk_in: 'Walk In',
  other: 'Other',
};

export const SOURCE_COLORS: Record<LeadSource, string> = {
  google_ads: 'text-blue-600',
  meta_ads: 'text-indigo-600',
  referral: 'text-green-600',
  walk_in: 'text-purple-600',
  other: 'text-gray-600',
};

export const ALL_STATUSES: LeadStatus[] = [
  'new',
  'follow_up',
  'orders_convert',
  'design_phase',
  'hold_order',
  'payment_50',
  'order_complete',
  'closed',
  'rejected',
];

export const ALL_SOURCES: LeadSource[] = [
  'google_ads',
  'meta_ads',
  'referral',
  'walk_in',
  'other',
];

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export interface DashboardStats {
  total: number;
  active: number;
  closed: number;
  rejected: number;
  pipeline_value: number;
  closed_value: number;
  by_status: Record<string, number>;
}
