export class Stage {
  constructor({ id, name, companyId, slaLimit = null }) {
    this.id = id;
    this.name = name;
    this.companyId = companyId;
    this.slaLimit = slaLimit; // in hours
  }

  setSlaLimit(hours) {
    if (hours < 0) {
      throw new Error("SLA Limit cannot be negative.");
    }
    this.slaLimit = hours;
  }
}
