import React, { useState, useEffect } from 'react';
import { Lock, X, KeyRound, AlertCircle, Loader2 } from 'lucide-react';
import { authService, api } from '../services/api';
import { useAuth } from '../context';

export interface AuthModalProps {
  isOpen?: boolean;
  isDismissible?: boolean;
  onClose?: () => void;
  onLoginSuccess?: () => void;
}

export function AuthModal(props: AuthModalProps = {}) {
  const authCtx = useAuth();

  const isOpen = props.isOpen !== undefined ? props.isOpen : authCtx.isAuthModalOpen;
  const isDismissible = props.isDismissible !== undefined ? props.isDismissible : authCtx.isAuthenticated;
  const onClose = props.onClose ?? authCtx.closeAuthModal;
  const onLoginSuccess = props.onLoginSuccess ?? authCtx.handleLoginSuccess;

  const [username, setUsername] = useState(authService.getUsername() || 'admin');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Sync username from authService when opening
  useEffect(() => {
    if (isOpen) {
      setUsername(authService.getUsername() || 'admin');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setError('Please provide both username and password.');
      return;
    }

    try {
      setVerifying(true);
      setError(null);

      const result = await api.verifyCredentials(cleanUser, cleanPass);
      setVerifying(false);

      if (!result.success) {
        setError(result.error || 'Invalid username or password. Please try again.');
        return;
      }

      // Save credentials and trigger success callback
      authService.setCredentials(cleanUser, cleanPass);
      setError(null);
      onLoginSuccess();
      onClose();
    } catch (err: any) {
      setVerifying(false);
      setError(err.message || 'An unexpected error occurred during authentication.');
    }
  };

  const handleOverlayClick = () => {
    if (isDismissible && !verifying) {
      onClose();
    }
  };

  return (
    <div
      className={`modal-overlay ${!isDismissible ? 'modal-overlay-blocking' : ''}`}
      onClick={handleOverlayClick}
    >
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        style={{ maxWidth: 440 }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
                background: '#eff6ff',
                flexShrink: 0,
              }}
            >
              <Lock size={18} />
            </div>
            <div>
              <h2 id="auth-modal-title" className="modal-title" style={{ fontSize: '1.05rem' }}>
                Authentication Required
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Sign in to access and interact with leads
              </p>
            </div>
          </div>
          {isDismissible && (
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              onClick={onClose}
              disabled={verifying}
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div
              style={{
                padding: '10px 14px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 'var(--radius-md)',
                color: '#1d4ed8',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <KeyRound size={16} style={{ flexShrink: 0 }} />
              <span>
                Basic Auth is enabled. Default credentials: <strong>admin</strong> / <strong>password123</strong>
              </span>
            </div>

            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 'var(--radius-md)',
                  color: '#b91c1c',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="auth-username" className="form-label">
                Username
              </label>
              <input
                id="auth-username"
                type="text"
                className="form-input"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="admin"
                disabled={verifying}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="auth-password" className="form-label">
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                className="form-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={verifying}
              />
            </div>
          </div>

          <div className="modal-footer">
            {isDismissible && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onClose}
                disabled={verifying}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={verifying}
              style={{ minWidth: 120 }}
            >
              {verifying ? (
                <>
                  <Loader2 size={16} className="spinner" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Sign In & Access</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
