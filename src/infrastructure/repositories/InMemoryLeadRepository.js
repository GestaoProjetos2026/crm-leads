import { Lead } from '../../domain/entities/Lead.js';

export class InMemoryLeadRepository {
  constructor() {
    this.leads = [];
  }

  async findById(id) {
    const lead = this.leads.find(l => l.id === id);
    return lead ? new Lead(lead) : null;
  }

  async findAllByCompany(companyId) {
    return this.leads
      .filter(l => l.companyId === companyId)
      .map(lead => new Lead(lead));
  }

  async findByEmailAndTenant(email, companyId) {
    const lead = this.leads.find(l => l.email === email && l.companyId === companyId);
    return lead ? new Lead(lead) : null;
  }

  async save(lead) {
      const index = this.leads.findIndex(l => l.id === lead.id);
      if (index !== -1) {
          this.leads[index] = lead;
      } else {
          this.leads.push(lead);
      }
  }

  async getStagnantCandidates(companyId, batchSize = 1000) {
    const candidates = this.leads
      .filter(l => l.companyId === companyId)
      .slice(0, batchSize);
    
    return candidates.map(lead => new Lead(lead));
  }
}