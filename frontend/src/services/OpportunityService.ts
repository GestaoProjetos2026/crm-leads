import api from './api';

export interface Opportunity {
  id: number;
  title: string;
  value: number;
  status: string;
  stageId: number;
  stageName: string;
  leadId: number;
  leadName: string;
  createdAt: string;
  closedAt: string | null;
}

export const OpportunityService = {
  getOpportunities: async (): Promise<Opportunity[]> => {
    const response = await api.get('/opportunities');
    return response.data;
  },

  createOpportunity: async (opportunityData: Omit<Opportunity, 'id' | 'createdAt' | 'closedAt'>): Promise<Opportunity> => {
    const response = await api.post('/opportunities', opportunityData);
    return response.data;
  },
};
