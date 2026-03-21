export class StageController {
  constructor(configureStageSlaUseCase) {
    this.configureStageSlaUseCase = configureStageSlaUseCase;
  }

  async configureSla(req, res) {
    try {
      // Simulate Express route params / body
      // Example path: /v1/config/stages/STAGE_ID/sla
      const stageId = req.params?.id || req.body?.stageId;
      const { companyId, slaLimitHours } = req.body;

      if (!stageId || !companyId || slaLimitHours === undefined) {
        return this._badRequest(res, 'Missing required fields: stageId, companyId, slaLimitHours');
      }

      const stage = await this.configureStageSlaUseCase.execute({
        stageId,
        companyId,
        slaLimitHours: Number(slaLimitHours)
      });

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        message: 'SLA Limit configured successfully',
        data: {
          stageId: stage.id,
          slaLimitHours: stage.slaLimit
        }
      }));
    } catch (err) {
      if (err.message === 'SLA limit cannot be negative' || err.message === 'Stage not found') {
        return this._badRequest(res, err.message);
      }
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
