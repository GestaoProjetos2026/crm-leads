export interface JwtPayload {
  /** User ID */
  sub: number;
  /** Tenant identifier */
  tenant_id: number;
  /** User profile */
  profile: string;
  /** Permission scopes, e.g. ['analytics:read', 'deals:write'] */
  scopes: string[];
  /** Token expiry (Unix timestamp) - added by JWT library */
  exp?: number;
}
