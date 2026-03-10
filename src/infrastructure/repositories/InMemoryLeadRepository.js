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

  async save(lead) {
      const index = this.leads.findIndex(l => l.id === lead.id);
      if (index !== -1) {
          this.leads[index] = lead;
      } else {
          this.leads.push(lead);
      }
  }

  async getStagnantCandidates(companyId, batchSize = 1000) {
    // In a real database, this would filter by companyId and perhaps only fetch
    // leads that haven't been modified recently to save memory. 
    // Here we just return all leads for the company up to batchSize.
    const candidates = this.leads
      .filter(l => l.companyId === companyId)
      .slice(0, batchSize);
    
    return candidates.map(lead => new Lead(lead));
  }
}
