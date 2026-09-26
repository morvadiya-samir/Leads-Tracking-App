import type { LeadStatus } from '../types';

interface StatusBadgeProps {
  status: LeadStatus;
  onClick?: () => void;
  interactive?: boolean;
}

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New Lead',
  contacted: 'Contacted',
  qualified: 'Qualified',
  lost: 'Lost',
};

export function StatusBadge({ status, onClick, interactive }: StatusBadgeProps) {
  return (
    <span
      className={`status-badge ${status} ${interactive ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      style={{ cursor: interactive ? 'pointer' : 'default' }}
      title={interactive ? 'Click to change status' : undefined}
    >
      <span className="status-dot" />
      {STATUS_LABELS[status] || status}
    </span>
  );
}
