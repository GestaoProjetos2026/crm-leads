export class Lead {
  constructor({ id, currentStageId, companyId, lastMovedAt }) {
    this.id = id;
    this.currentStageId = currentStageId;
    this.companyId = companyId;
    this.lastMovedAt = new Date(lastMovedAt);
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
