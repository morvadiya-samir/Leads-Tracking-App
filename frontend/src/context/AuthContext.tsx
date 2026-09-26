import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';
import { useToast } from './ToastContext';

export interface AuthContextType {
  isAuthenticated: boolean;
  authUser: string | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  handleLoginSuccess: () => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => authService.isAuthenticated());
  const [authUser, setAuthUser] = useState<string | null>(() => authService.getUsername());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(!authService.isAuthenticated());

  // Listen for unauthorized 401 API responses
  useEffect(() => {
    const handleUnauthorized = () => {
      setIsAuthenticated(false);
      setAuthUser(null);
      setIsAuthModalOpen(true);
      showToast('error', 'Authentication required. Please sign in to view and manage leads.');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [showToast]);

  const handleLoginSuccess = useCallback(() => {
    setIsAuthenticated(true);
    setAuthUser(authService.getUsername());
    setIsAuthModalOpen(false);
    showToast('success', 'Authenticated successfully!');
    window.dispatchEvent(new CustomEvent('auth:login'));
  }, [showToast]);

  const logout = useCallback(() => {
    authService.clearCredentials();
    setAuthUser(null);
    setIsAuthenticated(false);
    setIsAuthModalOpen(true);
    showToast('info', 'Signed out. Please sign in to continue.');
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }, [showToast]);

  const openAuthModal = useCallback(() => {
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    if (isAuthenticated) {
      setIsAuthModalOpen(false);
    }
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        authUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        handleLoginSuccess,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
