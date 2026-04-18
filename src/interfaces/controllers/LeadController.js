import { CreateLeadDto } from '../../application/dtos/CreateLeadDto.js';

export class LeadController {
  constructor(ingestLeadUseCase) {
    this.ingestLeadUseCase = ingestLeadUseCase;
  }

  async ingest(req, res) {
    try {
      // Autenticação via X-API-Key (Ticket 46)
      const tenantKey = req.headers['x-api-key'];
      if (!tenantKey) {
        return this._respond(res, 401, { error: 'Unauthorized: Missing X-API-Key' });
      }
      const tenantId = tenantKey;

      const dto = new CreateLeadDto(req.body);
      const validationErrors = dto.validate();

      // Retornar 422 se faltar campos obrigatórios
      if (validationErrors.length > 0) {
        return this._respond(res, 422, { 
          error: 'Unprocessable Entity: Missing required fields', 
          details: validationErrors 
        });
      }

      const lead = await this.ingestLeadUseCase.execute(tenantId, dto);
      return this._respond(res, 201, { message: 'Created', leadId: lead.id });

    } catch (err) {
      // Retornar 409 Conflict se houver e-mail duplicado
      if (err.statusCode === 409) {
        return this._respond(res, 409, { error: 'Conflict: Lead already exists', leadId: err.leadId });
      }
      console.error(err);
      return this._respond(res, 500, { error: 'Internal server error' });
    }
  }

  _respond(res, statusCode, payload) {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(payload));
  }
}