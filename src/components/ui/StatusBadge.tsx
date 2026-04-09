'use client';

import { STATUS_COLORS, STATUS_LABELS } from '@/types';
import type { LeadStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const { bg, text, dot } = STATUS_COLORS[status] ?? {
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    dot: 'bg-gray-400',
  };

  return (
    <span className={cn('status-badge', bg, text, className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dot)} />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
