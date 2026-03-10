export class StagnationWorker {
  constructor({ scanStagnantLeadsUseCase, companyIds = [] }) {
    this.scanStagnantLeadsUseCase = scanStagnantLeadsUseCase;
    this.intervalMs = process.env.WORKER_INTERVAL_MS || 15 * 60 * 1000; // Default 15 mins
    this.companyIds = companyIds; // TODO: Mock: List of active tenant IDs to scan
    this.timer = null;
  }

  start() {
    console.log(`[Worker] Starting Stagnation Worker. Interval: ${this.intervalMs}ms`);
    this.runCycle(); // Run immediately on start
    this.timer = setInterval(() => this.runCycle(), this.intervalMs);
  }

  stop() {
      if (this.timer) {
          clearInterval(this.timer);
          this.timer = null;
          console.log('[Worker] Stopped Stagnation Worker.');
      }
  }

  async runCycle() {
    console.log(`[Worker] Executing stagnation cycle at ${new Date().toISOString()}...`);
    
    for (const companyId of this.companyIds) {
      try {
        const result = await this.scanStagnantLeadsUseCase.execute(companyId, 500); // Batch of 500
        console.log(`[Worker] Company ${companyId} - Processed ${result.processed} leads. Errors: ${result.errors.length}`);
      } catch (err) {
        console.error(`[Worker] Critical error scanning company ${companyId}:`, err);
      }
    }
  }
}
