import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.crm-leads.40.82.176.176.nip.io';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT if available and apply mocks
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sw_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor: handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sw_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export interface BottleneckItem {
  id: number;
  opportunityId: number;
  leadId: number | null;
  leadName: string;
  leadEmail: string;
  stageName: string;
  stageId: number | null;
  weaknessType: string;
  description: string | null;
  hoursStagnant: number;
  value: number | null;
  detectedAt: string;
}

export interface ConversionLatencyItem {
  stageId: number;
  stageName: string;
  orderPosition: number;
  avgHours: number;
  maxHours: number;
  minHours: number;
  totalOpportunities: number;
  totalStagnant: number;
  totalValueAtRisk: number;
}

export const auditApi = {
  getBottlenecks: () =>
    api.get<BottleneckItem[]>(`/audit/bottlenecks`),

  getConversionLatency: () =>
    api.get<ConversionLatencyItem[]>(`/audit/conversion-latency`),
};

export const authApi = {
  login: (email: string, password: string, type: 'salesweakness' | 'core') => {
    // Redirecionando para o Proxy configurado no vite.config.ts
    const url = import.meta.env.VITE_LOGIN_ENDPOINT || '/v1/auth/login';
    return api.post<{ access_token: string; }>(
      url,
      { email, password, type }
    );
  },

  register: (email: string, password: string) => {
    // Redirecionando para o Proxy configurado no vite.config.ts
    const url = import.meta.env.VITE_REGISTER_ENDPOINT || '/v1/auth/register';
    return api.post<{id: number, email: string, tenantId: number, profile: string}>(
      url,
      { 
        email,
        password,
        tenantId: 1,
        profile: "sales_rep"
      }
    );
  },
};

export const ficalApi = {
  getActualBilling: () => {
    const url = import.meta.env.VITE_FISCAL_ACTUAL_BILLING_ENDPOINT || '/v1/fiscal/actual-billing';
    return api.get<{
      saldo_atual: number,
      total_entradas: number,
      total_despesas: number,
      total_impostos: number
    }>(
      url,
      {
        headers: {
          'Authorization' : `Bearer ${localStorage.getItem('sw_token')}`
        }
      }
    );
  }
}

export default api;
