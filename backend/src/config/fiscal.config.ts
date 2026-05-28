import { registerAs } from '@nestjs/config';

/**
 * Configuration for the Finance-Fiscal API (Squad 2).
 * Uses Kubernetes internal DNS for service-to-service communication.
 *
 * URL pattern: http://<service>.<namespace>.svc.cluster.local:<port>
 */
export default registerAs('fiscal', () => ({
  baseUrl:
    process.env.FISCAL_API_BASE_URL ??
    'https://api.fiscal-finance.40.82.176.176.nip.io',
  apiUser: process.env.FISCAL_API_USER ?? 'admin',
  apiPassword: process.env.FISCAL_API_PASSWORD ?? 'admin123',
  timeoutMs: parseInt(process.env.FISCAL_API_TIMEOUT_MS ?? '5000', 10),
}));
