import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3031/v1';

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
  login: (email: string, password: string) => {
    const coreEngineUrl = import.meta.env.VITE_CORE_API_URL || 'http://api.core-engine.40.82.176.176.nip.io/v1';
    return axios.post<{ success: boolean; data: { accessToken: string; refreshToken: string; tokenType: string; expiresIn: number } }>(
      `${coreEngineUrl}/auth/login`,
      { email, password }
    );
  },
};

export default api;
