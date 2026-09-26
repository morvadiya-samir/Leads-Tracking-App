export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'lost';

export interface Note {
  id: number;
  leadId: number;
  content: string;
  createdAt: string;
}

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt?: string;
  notes?: Note[];
  _count?: {
    notes: number;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LeadsApiResponse {
  data: Lead[];
  pagination: PaginationMeta;
}

export interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
}
