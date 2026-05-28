import api from './api';

export interface Lead {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  isInactive: boolean;
  createdAt: string;
}

export const LeadService = {
  getLeads: async (): Promise<Lead[]> => {
    const response = await api.get('/v1/leads', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('sw_token') ? `Bearer ${localStorage.getItem('sw_token')}` : '',
      },
    });
    return response.data;
  },

  createLead: async (leadData: Omit<Lead, 'id' | 'createdAt'>): Promise<Lead> => {
    const response = await api.post('/v1/leads', leadData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('sw_token') ? `Bearer ${localStorage.getItem('sw_token')}` : '',
      },
    });
    return response.data;
  },
};
