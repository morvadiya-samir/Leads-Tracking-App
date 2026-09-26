import type { Lead, Note, LeadsApiResponse, LeadFormData } from '../types';

const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  details?: { field: string; message: string }[];

  constructor(message: string, status: number, details?: { field: string; message: string }[]) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const authService = {
  getAuthToken(): string | null {
    return localStorage.getItem('leadpulse_auth_token');
  },
  setCredentials(user: string, pass: string): string {
    const token = btoa(`${user}:${pass}`);
    localStorage.setItem('leadpulse_auth_token', token);
    return token;
  },
  clearCredentials(): void {
    localStorage.removeItem('leadpulse_auth_token');
  },
  getUsername(): string | null {
    const token = localStorage.getItem('leadpulse_auth_token');
    if (!token) return null;
    try {
      const decoded = atob(token);
      return decoded.split(':')[0] || null;
    } catch {
      return null;
    }
  },
  isAuthenticated(): boolean {
    return !!localStorage.getItem('leadpulse_auth_token');
  },
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const token = authService.getAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Basic ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    let errorMessage = `Request failed with status ${response.status}`;
    let details: { field: string; message: string }[] | undefined;
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      }
      if (errorData.details) {
        details = errorData.details;
      }
    } catch {
      // Body is not JSON
    }
    throw new ApiError(errorMessage, response.status, details);
  }

  return response.json();
}

export const api = {
  // Leads
  async getLeads(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<LeadsApiResponse> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status && params.status !== 'all') searchParams.set('status', params.status);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const queryString = searchParams.toString();
    return request<LeadsApiResponse>(`/leads${queryString ? `?${queryString}` : ''}`);
  },

  async getLead(id: number): Promise<Lead> {
    return request<Lead>(`/leads/${id}`);
  },

  async createLead(data: LeadFormData): Promise<Lead> {
    return request<Lead>('/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateLead(id: number, data: Partial<LeadFormData>): Promise<Lead> {
    return request<Lead>(`/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteLead(id: number): Promise<{ message: string; id: number }> {
    return request<{ message: string; id: number }>(`/leads/${id}`, {
      method: 'DELETE',
    });
  },

  // Notes
  async getNotes(leadId: number): Promise<Note[]> {
    return request<Note[]>(`/leads/${leadId}/notes`);
  },

  async createNote(leadId: number, content: string): Promise<Note> {
    return request<Note>(`/leads/${leadId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  // Auth verification
  async verifyCredentials(user: string, pass: string): Promise<{ success: boolean; error?: string }> {
    try {
      const token = btoa(`${user}:${pass}`);
      const response = await fetch(`${API_BASE}/leads?limit=1`, {
        headers: {
          Authorization: `Basic ${token}`,
        },
      });

      if (response.ok) {
        return { success: true };
      }

      if (response.status === 401) {
        let errorMsg = 'Invalid username or password. Please try again.';
        try {
          const data = await response.json();
          if (data.error) errorMsg = data.error;
        } catch {
          // Ignore json parse error
        }
        return { success: false, error: errorMsg };
      }

      return { success: false, error: `Verification failed with status ${response.status}` };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error while verifying credentials' };
    }
  },
};
