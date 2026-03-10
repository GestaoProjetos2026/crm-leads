export class AuditController {
  constructor(getStagnantLeadsUseCase, calculateConversionLatencyUseCase) {
    this.getStagnantLeadsUseCase = getStagnantLeadsUseCase;
    this.calculateConversionLatencyUseCase = calculateConversionLatencyUseCase;
  }

  async getBottlenecks(req, res) {
    try {
      const companyId = req.query?.companyId || req.body?.companyId; // in a real app, from auth token
      
      if (!companyId) {
        return this._badRequest(res, 'Missing companyId query parameter');
      }

      const stagnations = await this.getStagnantLeadsUseCase.execute(companyId);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        data: stagnations
      }));
    } catch (err) {
      this._serverError(res, err);
    }
  }

  async getConversionLatency(req, res) {
    try {
      const companyId = req.query?.companyId || req.body?.companyId;

      if (!companyId) {
         return this._badRequest(res, 'Missing companyId parameter');
      }

      // Mocking start/endDate for prototype
      const latencyData = await this.calculateConversionLatencyUseCase.execute(companyId, null, null);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        data: latencyData
      }));
    } catch (err) {
      this._serverError(res, err);
    }
  }

  _badRequest(res, message) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: message }));
  }

  _serverError(res, err) {
    console.error(err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}
