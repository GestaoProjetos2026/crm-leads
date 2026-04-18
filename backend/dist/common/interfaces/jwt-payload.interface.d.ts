export interface JwtPayload {
    sub: number;
    tenant_id: number;
    profile: string;
    scopes: string[];
    exp?: number;
}
