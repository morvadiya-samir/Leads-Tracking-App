import type { Lead, PaginationMeta, LeadFormData } from '../types';
import { MetricsBanner } from './MetricsBanner';
import { ControlsBar } from './ControlsBar';
import { LeadsTable } from './LeadsTable';
import { Pagination } from './Pagination';
import { CreateLeadModal } from './CreateLeadModal';
import { LeadDetailDrawer } from './LeadDetailDrawer';
import { useLeads, useAuth, useToast } from '../context';

export interface LeadsMetrics {
  total: number;
  newCount: number;
  qualifiedCount: number;
  contactedCount: number;
  lostCount: number;
}

export interface LeadsDashboardProps {
  // Metrics Banner
  metrics?: LeadsMetrics;

  // Search & Filter Controls
  search?: string;
  onSearchChange?: (search: string) => void;
  statusFilter?: string;
  onStatusChange?: (status: string) => void;

  // Table Data & Actions
  leads?: Lead[];
  loading?: boolean;
  isAuthenticated?: boolean;
  debouncedSearch?: string;
  onSelectLead?: (id: number) => void;
  onOpenCreateModal?: () => void;
  onOpenAuthModal?: () => void;

  // Pagination
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;

  // Create Lead Modal
  isCreateModalOpen?: boolean;
  onCloseCreateModal?: () => void;
  onCreateLead?: (formData: LeadFormData) => Promise<void>;

  // Lead Detail & Notes Drawer
  selectedLeadId?: number | null;
  onCloseDetailDrawer?: () => void;
  onLeadUpdated?: (lead: Lead) => void;
  onLeadDeleted?: (id: number) => void;
  showToast?: (type: 'success' | 'error' | 'info', message: string) => void;
}

export function LeadsDashboard(props: LeadsDashboardProps = {}) {
  const leadsCtx = useLeads();
  const authCtx = useAuth();
  const toastCtx = useToast();

  const metrics = props.metrics ?? leadsCtx.metrics;
  const search = props.search ?? leadsCtx.search;
  const onSearchChange = props.onSearchChange ?? leadsCtx.setSearch;
  const statusFilter = props.statusFilter ?? leadsCtx.statusFilter;
  const onStatusChange = props.onStatusChange ?? leadsCtx.setStatusFilter;

  const leads = props.leads ?? leadsCtx.leads;
  const loading = props.loading ?? leadsCtx.loading;
  const isAuthenticated = props.isAuthenticated ?? authCtx.isAuthenticated;
  const debouncedSearch = props.debouncedSearch ?? leadsCtx.debouncedSearch;
  const onSelectLead = props.onSelectLead ?? leadsCtx.selectLead;
  const onOpenCreateModal = props.onOpenCreateModal ?? leadsCtx.openCreateModal;
  const onOpenAuthModal = props.onOpenAuthModal ?? authCtx.openAuthModal;

  const pagination = props.pagination ?? leadsCtx.pagination;
  const onPageChange = props.onPageChange ?? leadsCtx.setPage;

  const isCreateModalOpen = props.isCreateModalOpen ?? leadsCtx.isCreateModalOpen;
  const onCloseCreateModal = props.onCloseCreateModal ?? leadsCtx.closeCreateModal;
  const onCreateLead = props.onCreateLead ?? leadsCtx.createLead;

  const selectedLeadId = props.selectedLeadId !== undefined ? props.selectedLeadId : leadsCtx.selectedLeadId;
  const onCloseDetailDrawer = props.onCloseDetailDrawer ?? leadsCtx.closeDetailDrawer;
  const onLeadUpdated = props.onLeadUpdated ?? leadsCtx.updateLead;
  const onLeadDeleted = props.onLeadDeleted ?? leadsCtx.deleteLead;
  const showToast = props.showToast ?? toastCtx.showToast;

  return (
    <>
      {/* Metrics Banner */}
      <MetricsBanner
        total={metrics.total}
        newCount={metrics.newCount}
        qualifiedCount={metrics.qualifiedCount}
        contactedCount={metrics.contactedCount}
        lostCount={metrics.lostCount}
      />

      {/* Search and Status Filters */}
      <ControlsBar
        search={search}
        onSearchChange={onSearchChange}
        statusFilter={statusFilter}
        onStatusChange={onStatusChange}
      />

      {/* Main Leads Table */}
      <LeadsTable
        leads={leads}
        loading={loading}
        isAuthenticated={isAuthenticated}
        debouncedSearch={debouncedSearch}
        statusFilter={statusFilter}
        onSelectLead={onSelectLead}
        onOpenCreateModal={onOpenCreateModal}
        onOpenAuthModal={onOpenAuthModal}
      />

      {/* Pagination Bar */}
      <Pagination
        page={pagination.page}
        limit={pagination.limit}
        total={pagination.total}
        totalPages={pagination.totalPages}
        onPageChange={onPageChange}
      />

      {/* Create Lead Modal */}
      <CreateLeadModal
        isOpen={isCreateModalOpen}
        onClose={onCloseCreateModal}
        onSubmit={onCreateLead}
      />

      {/* Lead Detail & Notes Drawer */}
      <LeadDetailDrawer
        leadId={selectedLeadId}
        onClose={onCloseDetailDrawer}
        onLeadUpdated={onLeadUpdated}
        onLeadDeleted={onLeadDeleted}
        showToast={showToast}
      />
    </>
  );
}
