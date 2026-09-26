import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import type { Lead, PaginationMeta, LeadFormData, LeadsApiResponse } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

export interface LeadsMetrics {
  total: number;
  newCount: number;
  qualifiedCount: number;
  contactedCount: number;
  lostCount: number;
}

export interface LeadsContextType {
  // State
  leads: Lead[];
  loading: boolean;
  pagination: PaginationMeta;
  search: string;
  debouncedSearch: string;
  statusFilter: string;
  selectedLeadId: number | null;
  isCreateModalOpen: boolean;
  metrics: LeadsMetrics;

  // Actions
  setSearch: (search: string) => void;
  setStatusFilter: (status: string) => void;
  setPage: (page: number) => void;
  setSelectedLeadId: (id: number | null) => void;
  selectLead: (id: number) => void;
  closeDetailDrawer: () => void;
  setIsCreateModalOpen: (open: boolean) => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  fetchLeads: (pageToFetch?: number, forceRefresh?: boolean) => Promise<void>;
  refreshLeads: () => void;
  createLead: (formData: LeadFormData) => Promise<void>;
  updateLead: (updatedLead: Lead) => void;
  deleteLead: (deletedId: number) => void;
}

export const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

function getInitialUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const pageParam = parseInt(params.get('page') || '1', 10);
  const page = !isNaN(pageParam) && pageParam > 0 ? pageParam : 1;
  const status = params.get('status') || 'all';
  const search = params.get('search') || '';
  return { page, status, search };
}

export function LeadsProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const initialParams = useMemo(() => getInitialUrlParams(), []);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: initialParams.page,
    limit: 8,
    totalPages: 1,
  });
  const [search, setSearch] = useState(initialParams.search);
  const [debouncedSearch, setDebouncedSearch] = useState(initialParams.search);
  const [statusFilter, setStatusFilterState] = useState<string>(initialParams.status);
  const [loading, setLoading] = useState(true);

  // Modals & Drawer State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);

  // In-memory cache for fetched pages to prevent duplicate API requests
  const leadsCacheRef = useRef<Map<string, LeadsApiResponse>>(new Map());

  // Synchronize state changes to browser URL query parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (pagination.page > 1) {
      params.set('page', pagination.page.toString());
    }
    if (statusFilter && statusFilter !== 'all') {
      params.set('status', statusFilter);
    }
    if (debouncedSearch.trim()) {
      params.set('search', debouncedSearch.trim());
    }

    const currentQuery = window.location.search.replace(/^\?/, '');
    const newQuery = params.toString();

    if (currentQuery !== newQuery) {
      const newUrl = newQuery ? `${window.location.pathname}?${newQuery}` : window.location.pathname;
      window.history.pushState(null, '', newUrl);
    }
  }, [pagination.page, statusFilter, debouncedSearch]);

  // Listen to browser Back / Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const urlState = getInitialUrlParams();
      setPagination(prev => ({ ...prev, page: urlState.page }));
      setStatusFilterState(urlState.status);
      setSearch(urlState.search);
      setDebouncedSearch(urlState.search);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Debounce search input - only reset page to 1 when search actually changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== debouncedSearch) {
        setDebouncedSearch(search);
        setPagination(p => ({ ...p, page: 1 }));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, debouncedSearch]);

  // Fetch leads with client-side caching
  const fetchLeads = useCallback(
    async (pageToFetch = pagination.page, forceRefresh = false) => {
      const cacheKey = `${debouncedSearch}:${statusFilter}:${pageToFetch}:${pagination.limit}`;

      // Return cached response immediately if already fetched
      if (!forceRefresh && leadsCacheRef.current.has(cacheKey)) {
        const cached = leadsCacheRef.current.get(cacheKey)!;
        setLeads(cached.data);
        setPagination(cached.pagination);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await api.getLeads({
          search: debouncedSearch,
          status: statusFilter,
          page: pageToFetch,
          limit: pagination.limit,
        });

        // Save to client cache
        leadsCacheRef.current.set(cacheKey, res);

        setLeads(res.data);
        setPagination(res.pagination);

        // If requested page is beyond totalPages, adjust to last page
        if (res.pagination.totalPages > 0 && pageToFetch > res.pagination.totalPages) {
          setPagination(prev => ({ ...prev, page: res.pagination.totalPages }));
        }
      } catch (err: unknown) {
        const error = err as { status?: number; message?: string };
        if (error?.status === 401) {
          setLeads([]);
          openAuthModal();
        } else {
          showToast('error', error?.message || 'Failed to fetch leads list');
        }
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, statusFilter, pagination.limit, pagination.page, openAuthModal, showToast]
  );

  // Fetch leads on mount or when page/fetchLeads changes
  useEffect(() => {
    fetchLeads(pagination.page);
  }, [fetchLeads, pagination.page]);

  // Listen for auth reset events (logout or 401 unauthorized)
  useEffect(() => {
    const handleAuthReset = () => {
      leadsCacheRef.current.clear();
      setLeads([]);
      setSelectedLeadId(null);
      setIsCreateModalOpen(false);
    };

    const handleAuthLogin = () => {
      leadsCacheRef.current.clear();
      fetchLeads(1, true);
    };

    window.addEventListener('auth:unauthorized', handleAuthReset);
    window.addEventListener('auth:logout', handleAuthReset);
    window.addEventListener('auth:login', handleAuthLogin);

    return () => {
      window.removeEventListener('auth:unauthorized', handleAuthReset);
      window.removeEventListener('auth:logout', handleAuthReset);
      window.removeEventListener('auth:login', handleAuthLogin);
    };
  }, [fetchLeads]);

  // Actions
  const handleRefresh = useCallback(() => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    fetchLeads(pagination.page, true);
  }, [isAuthenticated, openAuthModal, fetchLeads, pagination.page]);

  const handleOpenCreateModal = useCallback(() => {
    if (!isAuthenticated) {
      openAuthModal();
      showToast('error', 'Please sign in first to create leads.');
      return;
    }
    setIsCreateModalOpen(true);
  }, [isAuthenticated, openAuthModal, showToast]);

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const handleCreateLead = useCallback(
    async (formData: LeadFormData) => {
      if (!isAuthenticated) {
        openAuthModal();
        showToast('error', 'Please sign in first to create leads.');
        return;
      }
      const newLead = await api.createLead(formData);
      showToast('success', `Lead "${newLead.name}" created successfully!`);
      leadsCacheRef.current.clear();
      fetchLeads(1, true);
      setIsCreateModalOpen(false);
    },
    [isAuthenticated, openAuthModal, showToast, fetchLeads]
  );

  const handleSelectLead = useCallback(
    (id: number) => {
      if (!isAuthenticated) {
        openAuthModal();
        return;
      }
      setSelectedLeadId(id);
    },
    [isAuthenticated, openAuthModal]
  );

  const handleCloseDetailDrawer = useCallback(() => {
    setSelectedLeadId(null);
  }, []);

  const handleLeadUpdated = useCallback((updatedLead: Lead) => {
    leadsCacheRef.current.clear();
    setLeads(prev =>
      prev.map(l => (l.id === updatedLead.id ? { ...l, ...updatedLead } : l))
    );
  }, []);

  const handleLeadDeleted = useCallback((deletedId: number) => {
    leadsCacheRef.current.clear();
    setLeads(prev => prev.filter(l => l.id !== deletedId));
    setPagination(prev => ({
      ...prev,
      total: Math.max(0, prev.total - 1),
    }));
  }, []);

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (!isAuthenticated) {
        openAuthModal();
        return;
      }
      setPagination(p => ({ ...p, page: newPage }));
    },
    [isAuthenticated, openAuthModal]
  );

  const handleStatusChange = useCallback((newStatus: string) => {
    setStatusFilterState(newStatus);
    setPagination(p => ({ ...p, page: 1 }));
  }, []);

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!isAuthenticated) {
      return { total: 0, newCount: 0, qualifiedCount: 0, contactedCount: 0, lostCount: 0 };
    }
    const total = pagination.total;
    const newCount = leads.filter(l => l.status === 'new').length;
    const qualifiedCount = leads.filter(l => l.status === 'qualified').length;
    const contactedCount = leads.filter(l => l.status === 'contacted').length;
    const lostCount = leads.filter(l => l.status === 'lost').length;

    return { total, newCount, qualifiedCount, contactedCount, lostCount };
  }, [leads, pagination.total, isAuthenticated]);

  return (
    <LeadsContext.Provider
      value={{
        leads,
        loading,
        pagination,
        search,
        debouncedSearch,
        statusFilter,
        selectedLeadId,
        isCreateModalOpen,
        metrics,
        setSearch,
        setStatusFilter: handleStatusChange,
        setPage: handlePageChange,
        setSelectedLeadId,
        selectLead: handleSelectLead,
        closeDetailDrawer: handleCloseDetailDrawer,
        setIsCreateModalOpen,
        openCreateModal: handleOpenCreateModal,
        closeCreateModal: handleCloseCreateModal,
        fetchLeads,
        refreshLeads: handleRefresh,
        createLead: handleCreateLead,
        updateLead: handleLeadUpdated,
        deleteLead: handleLeadDeleted,
      }}
    >
      {children}
    </LeadsContext.Provider>
  );
}

export function useLeads(): LeadsContextType {
  const context = useContext(LeadsContext);
  if (!context) {
    throw new Error('useLeads must be used within a LeadsProvider');
  }
  return context;
}
