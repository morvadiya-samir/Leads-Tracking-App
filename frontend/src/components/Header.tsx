import { RefreshCw, Plus, Lock, User } from 'lucide-react';
import { useLeads, useAuth } from '../context';

export interface HeaderProps {
  loading?: boolean;
  onRefresh?: () => void;
  onOpenCreateModal?: () => void;
  onOpenAuthModal?: () => void;
  username?: string | null;
  onSignOut?: () => void;
}

export function Header(props: HeaderProps = {}) {
  const leadsCtx = useLeads();
  const authCtx = useAuth();

  const loading = props.loading ?? leadsCtx.loading;
  const onRefresh = props.onRefresh ?? leadsCtx.refreshLeads;
  const onOpenCreateModal = props.onOpenCreateModal ?? leadsCtx.openCreateModal;
  const onOpenAuthModal = props.onOpenAuthModal ?? authCtx.openAuthModal;
  const username = props.username !== undefined ? props.username : authCtx.authUser;
  const onSignOut = props.onSignOut ?? authCtx.logout;

  return (
    <header className="app-header">
      <div className="brand-wrapper">
        <h1 className="brand-title">Leads Tracking App</h1>
      </div>

      <div className="header-actions">
        {username ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              className="user-indicator"
              title={`Signed in as ${username}`}
            >
              <User size={14} />
              <span>{username}</span>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={onSignOut}
              title="Sign out"
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            className="btn btn-secondary btn-sm"
            onClick={onOpenAuthModal}
            title="Configure Basic Auth credentials"
          >
            <Lock size={14} />
            <span>Sign in</span>
          </button>
        )}

        <button
          className="btn btn-secondary"
          onClick={onRefresh}
          title="Refresh Leads"
        >
          <RefreshCw size={16} className={loading ? 'spinner' : ''} />
          Refresh
        </button>
        <button
          className="btn btn-primary"
          onClick={onOpenCreateModal}
        >
          <Plus size={18} />
          New Lead
        </button>
      </div>
    </header>
  );
}
