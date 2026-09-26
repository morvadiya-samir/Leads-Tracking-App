import { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  Edit2,
  Trash2,
  Send,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import type { Lead, Note, LeadStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { api } from '../services/api';
import { useToast } from '../context';

interface LeadDetailDrawerProps {
  leadId: number | null;
  onClose: () => void;
  onLeadUpdated: (lead: Lead) => void;
  onLeadDeleted: (id: number) => void;
  showToast?: (type: 'success' | 'error' | 'info', message: string) => void;
}

const STATUSES: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'lost', label: 'Lost' },
];

export function LeadDetailDrawer({
  leadId,
  onClose,
  onLeadUpdated,
  onLeadDeleted,
  showToast: propShowToast,
}: LeadDetailDrawerProps) {
  const toastCtx = useToast();
  const showToast = propShowToast ?? toastCtx.showToast;
  const [lead, setLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  // Edit lead info mode
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'new' as LeadStatus,
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete confirmation mode
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!leadId) {
      setLead(null);
      setNotes([]);
      setIsEditing(false);
      setConfirmDelete(false);
      return;
    }

    const fetchLeadDetails = async () => {
      try {
        setLoading(true);
        const data = await api.getLead(leadId);
        setLead(data);
        setNotes(data.notes || []);
        setEditFormData({
          name: data.name,
          email: data.email,
          phone: data.phone,
          status: data.status,
        });
      } catch (err: any) {
        showToast('error', err.message || 'Failed to load lead details');
      } finally {
        setLoading(false);
      }
    };

    fetchLeadDetails();
  }, [leadId, showToast]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && leadId) {
        if (isEditing) {
          setIsEditing(false);
        } else if (confirmDelete) {
          setConfirmDelete(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [leadId, isEditing, confirmDelete, onClose]);

  if (!leadId) return null;

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!lead || lead.status === newStatus) return;

    try {
      const updated = await api.updateLead(lead.id, { status: newStatus });
      setLead({ ...lead, status: updated.status });
      setEditFormData(prev => ({ ...prev, status: updated.status }));
      onLeadUpdated({ ...lead, status: updated.status });
      showToast('success', `Status updated to ${newStatus}`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update status');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;

    if (!editFormData.name.trim() || !editFormData.email.trim() || !editFormData.phone.trim()) {
      showToast('error', 'Please fill in all required fields');
      return;
    }

    try {
      setIsSavingEdit(true);
      const updated = await api.updateLead(lead.id, editFormData);
      setLead({ ...lead, ...updated });
      setIsEditing(false);
      onLeadUpdated({ ...lead, ...updated });
      showToast('success', 'Lead details updated successfully');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save lead edits');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteLead = async () => {
    if (!lead) return;

    try {
      setIsDeleting(true);
      await api.deleteLead(lead.id);
      showToast('success', `Lead "${lead.name}" deleted successfully`);
      onLeadDeleted(lead.id);
      onClose();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete lead');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddNote = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!lead || !newNoteContent.trim() || submittingNote) return;

    try {
      setSubmittingNote(true);
      const note = await api.createNote(lead.id, newNoteContent.trim());
      setNotes([note, ...notes]);
      setNewNoteContent('');
      // update note count
      const updatedLead = {
        ...lead,
        _count: { notes: (lead._count?.notes || notes.length) + 1 },
      };
      setLead(updatedLead);
      onLeadUpdated(updatedLead);
      showToast('success', 'Note added successfully');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to add note');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleNoteTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleAddNote();
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div
        className="drawer-content"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-labelledby="drawer-title"
      >
        {/* Drawer Header */}
        <div className="drawer-header">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="lead-id-badge">LEAD #{lead?.id}</span>
              {lead && <StatusBadge status={lead.status} />}
            </div>
            <h2 id="drawer-title" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {lead ? lead.name : 'Loading...'}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {lead && !isEditing && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsEditing(true)}
                title="Edit lead info"
              >
                <Edit2 size={14} />
                Edit
              </button>
            )}
            <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close details">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body">
          {loading ? (
            <div className="state-container">
              <div className="spinner" />
              <p className="state-description">Fetching lead and notes history...</p>
            </div>
          ) : lead ? (
            <>
              {/* Delete Confirmation Box */}
              {confirmDelete && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#b91c1c' }}>
                    <AlertTriangle size={18} />
                    <strong>Are you sure you want to delete this lead?</strong>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    This action will permanently delete <strong>{lead.name}</strong> and all associated notes.
                  </p>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setConfirmDelete(false)}
                      disabled={isDeleting}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={handleDeleteLead}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Yes, Delete Lead'}
                    </button>
                  </div>
                </div>
              )}

              {/* Edit Mode Form vs Summary Card */}
              {isEditing ? (
                <form onSubmit={handleSaveEdit} className="lead-summary-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>Edit Lead Details</strong>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editFormData.name}
                      onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={editFormData.email}
                      onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editFormData.phone}
                      onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <div className="status-pill-selector">
                      {STATUSES.map(s => (
                        <button
                          key={s.value}
                          type="button"
                          className={`status-pill-btn ${editFormData.status === s.value ? `selected ${s.value}` : ''}`}
                          onClick={() => setEditFormData({ ...editFormData, status: s.value })}
                        >
                          <span className="status-dot" />
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      disabled={isSavingEdit}
                    >
                      {isSavingEdit ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="lead-summary-card">
                  <div className="lead-quick-stats">
                    <div className="detail-item">
                      <span className="detail-label">Email Address</span>
                      <a href={`mailto:${lead.email}`} className="lead-contact-item detail-value">
                        <Mail size={14} />
                        {lead.email}
                      </a>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Phone Number</span>
                      <a href={`tel:${lead.phone}`} className="lead-contact-item detail-value">
                        <Phone size={14} />
                        {lead.phone}
                      </a>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Created Date</span>
                      <div className="detail-value">
                        <Calendar size={14} color="var(--text-muted)" />
                        {formatDate(lead.createdAt)}
                      </div>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Notes Count</span>
                      <div className="detail-value">
                        <MessageSquare size={14} color="var(--text-muted)" />
                        {notes.length} {notes.length === 1 ? 'note' : 'notes'}
                      </div>
                    </div>
                  </div>

                  {/* Status switcher quick pill bar */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
                    <span className="detail-label">Update Status</span>
                    <div className="status-pill-selector">
                      {STATUSES.map(s => (
                        <button
                          key={s.value}
                          type="button"
                          className={`status-pill-btn ${lead.status === s.value ? `selected ${s.value}` : ''}`}
                          onClick={() => handleStatusChange(s.value)}
                        >
                          <span className="status-dot" />
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Notes Section */}
              <div className="notes-section">
                <div className="notes-header">
                  <div className="notes-title">
                    <MessageSquare size={18} color="var(--accent-primary)" />
                    Interaction Notes ({notes.length})
                  </div>
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="note-input-box">
                  <textarea
                    className="note-textarea"
                    placeholder="Log a call, meeting summary, or next action steps... (Ctrl + Enter to submit)"
                    value={newNoteContent}
                    onChange={e => setNewNoteContent(e.target.value)}
                    onKeyDown={handleNoteTextareaKeyDown}
                  />
                  <div className="note-submit-row">
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Press <kbd style={{ padding: '2px 5px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 4, color: '#334155' }}>Ctrl</kbd> + <kbd style={{ padding: '2px 5px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 4, color: '#334155' }}>Enter</kbd> to save
                    </span>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      disabled={!newNoteContent.trim() || submittingNote}
                    >
                      {submittingNote ? (
                        'Posting...'
                      ) : (
                        <>
                          <Send size={13} />
                          Add Note
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Notes List Timeline */}
                <div className="notes-timeline">
                  {notes.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '28px 16px',
                      background: '#f8fafc',
                      borderRadius: 'var(--radius-md)',
                      border: '1px dashed #cbd5e1',
                      color: 'var(--text-muted)',
                      fontSize: '0.85rem',
                    }}>
                      No notes recorded yet. Add the first note above!
                    </div>
                  ) : (
                    notes.map(note => (
                      <div key={note.id} className="note-card">
                        <div className="note-meta">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Clock size={12} />
                            <span>{formatDate(note.createdAt)}</span>
                          </div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                            #{note.id}
                          </span>
                        </div>
                        <div className="note-content">{note.content}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              {!confirmDelete && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', paddingTop: 16 }}>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 size={14} />
                    Delete Lead
                  </button>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
