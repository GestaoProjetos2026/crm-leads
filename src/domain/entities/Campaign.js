export class Campaign {
  constructor({ id, tenantId, name, budget, status, createdAt }) {
    this.id = id;
    this.tenantId = tenantId;
    this.name = name;
    this.budget = budget;
    this.status = status || 'active';
    this.createdAt = createdAt || new Date();
  }
}