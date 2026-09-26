import { Users, Plus, Mail, Phone, MessageSquare, ExternalLink, Lock } from 'lucide-react';
import type { Lead } from '../types';
import { StatusBadge } from './StatusBadge';

interface LeadsTableProps {
  leads: Lead[];
  loading: boolean;
  isAuthenticated: boolean;
  debouncedSearch: string;
  statusFilter: string;
  onSelectLead: (id: number) => void;
  onOpenCreateModal: () => void;
  onOpenAuthModal: () => void;
}

export function LeadsTable({
  leads,
  loading,
  isAuthenticated,
  debouncedSearch,
  statusFilter,
  onSelectLead,
  onOpenCreateModal,
  onOpenAuthModal,
}: LeadsTableProps) {
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <section className="table-container" aria-label="Leads Management Table">
      {!isAuthenticated && !loading ? (
        <div className="state-container">
          <div className="state-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Lock size={32} />
          </div>
          <div className="state-title">Authentication Required</div>
          <div className="state-description">
            Sign in with valid API credentials to access, view, and manage leads.
          </div>
          <button
            className="btn btn-primary"
            style={{ marginTop: 8 }}
            onClick={onOpenAuthModal}
          >
            <Lock size={16} />
            Sign In Now
          </button>
        </div>
      ) : loading && leads.length === 0 ? (
        <div className="state-container">
          <div className="spinner" />
          <div className="state-title">Loading Leads</div>
          <div className="state-description">Connecting to REST API and retrieving latest records...</div>
        </div>
      ) : leads.length === 0 ? (
        <div className="state-container">
          <div className="state-icon-box">
            <Users size={32} />
          </div>
          <div className="state-title">No Leads Found</div>
          <div className="state-description">
            {debouncedSearch || statusFilter !== 'all'
              ? 'Try adjusting your search criteria or status filter.'
              : 'Get started by creating your very first lead.'}
          </div>
          <button
            className="btn btn-primary"
            style={{ marginTop: 8 }}
            onClick={onOpenCreateModal}
          >
            <Plus size={16} />
            Create First Lead
          </button>
        </div>
      ) : (
        <table className="leads-table">
          <thead>
            <tr>
              <th>Lead Name</th>
              <th>Status</th>
              <th>Contact Information</th>
              <th>Notes</th>
              <th>Created</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(lead => (
              <tr
                key={lead.id}
                onClick={() => onSelectLead(lead.id)}
                style={{ cursor: 'pointer' }}
              >
                <td>
                  <div className="lead-name-cell">
                    <span className="lead-name-text">{lead.name}</span>
                    <span className="lead-id-badge">ID #{lead.id}</span>
                  </div>
                </td>

                <td>
                  <StatusBadge status={lead.status} />
                </td>

                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <a
                      href={`mailto:${lead.email}`}
                      className="lead-contact-item"
                      onClick={e => e.stopPropagation()}
                    >
                      <Mail size={13} />
                      {lead.email}
                    </a>
                    <a
                      href={`tel:${lead.phone}`}
                      className="lead-contact-item"
                      onClick={e => e.stopPropagation()}
                    >
                      <Phone size={13} />
                      {lead.phone}
                    </a>
                  </div>
                </td>

                <td>
                  <span className="notes-badge">
                    <MessageSquare size={13} />
                    {lead._count?.notes ?? (lead.notes?.length || 0)}
                  </span>
                </td>

                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {formatDate(lead.createdAt)}
                </td>

                <td style={{ textAlign: 'right' }}>
                  <div className="row-actions">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={e => {
                        e.stopPropagation();
                        onSelectLead(lead.id);
                      }}
                    >
                      Details
                      <ExternalLink size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
