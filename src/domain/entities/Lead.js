export class Lead {
  constructor({ id, currentStageId, companyId, lastMovedAt, email, firstName, lastName, source, campaignId }) {
    this.id = id;
    this.currentStageId = currentStageId;
    this.companyId = companyId;
    this.lastMovedAt = new Date(lastMovedAt);
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.source = source;
    this.campaignId = campaignId;
  }

  isStagnated(slaLimitHours, currentTime = new Date()) {
    if (slaLimitHours === null || slaLimitHours === undefined) return false;
    
    const diffMs = currentTime - this.lastMovedAt;
    const diffHours = diffMs / (1000 * 60 * 60);

    return diffHours > slaLimitHours;
  }

  getElapsedHours(currentTime = new Date()) {
    const diffMs = currentTime - this.lastMovedAt;
    return diffMs / (1000 * 60 * 60);
  }
}