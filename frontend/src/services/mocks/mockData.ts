export const mockLeadsData = [
  { id: 1, firstName: 'João', lastName: 'Silva', email: 'joao.silva@empresa.com', phone: '(11) 98765-4321', source: 'facebook_leads', status: 'Novo', isInactive: false, createdAt: '2026-04-20T10:00:00.000Z' },
  { id: 2, firstName: 'Maria', lastName: 'Oliveira', email: 'maria.oliveira@startup.io', phone: '(11) 91234-5678', source: 'landing_page', status: 'Em Contato', isInactive: false, createdAt: '2026-04-21T14:30:00.000Z' },
  { id: 3, firstName: 'Carlos', lastName: 'Souza', email: 'carlos.souza@gmail.com', phone: '(21) 98888-7777', source: 'organic', status: 'Desqualificado', isInactive: true, createdAt: '2025-10-15T09:15:00.000Z' },
  { id: 4, firstName: 'Ana', lastName: 'Costa', email: 'ana.costa@techsol.com', phone: '(31) 99999-0000', source: 'linkedin_ads', status: 'Qualificado', isInactive: false, createdAt: '2026-04-23T11:45:00.000Z' },
  { id: 5, firstName: 'Pedro', lastName: 'Almeida', email: 'pedro.almeida@hotmail.com', phone: '(41) 97777-6666', source: 'facebook_leads', status: 'Novo', isInactive: true, createdAt: '2025-08-05T16:20:00.000Z' },
  { id: 6, firstName: 'Anna', lastName: 'Nunes', email: 'annanunesc04@gmail.com', phone: '(51) 96666-5555', source: 'organic', status: 'Novo', isInactive: true, createdAt: '2025-08-05T16:20:00.000Z' },
];

export const mockOpportunitiesData = [
  { id: 1, title: 'Consultoria Estratégica', value: 15000, status: 'OPEN', stageId: 1, stageName: 'Prospecção', leadId: 1, leadName: 'João Silva', createdAt: '2026-05-01T09:00:00.000Z', closedAt: null },
  { id: 2, title: 'Implementação de CRM', value: 45000, status: 'OPEN', stageId: 2, stageName: 'Apresentação', leadId: 2, leadName: 'Maria Oliveira', createdAt: '2026-04-25T14:00:00.000Z', closedAt: null },
  { id: 3, title: 'Plano de Marketing Anual', value: 120000, status: 'WON', stageId: 5, stageName: 'Fechamento', leadId: 4, leadName: 'Ana Costa', createdAt: '2026-02-10T10:30:00.000Z', closedAt: '2026-04-15T16:00:00.000Z' },
  { id: 4, title: 'Auditoria de Processos', value: 8000, status: 'LOST', stageId: 3, stageName: 'Proposta Enviada', leadId: 3, leadName: 'Carlos Souza', createdAt: '2025-11-01T11:00:00.000Z', closedAt: '2025-12-05T15:20:00.000Z' },
  { id: 5, title: 'Treinamento de Vendas', value: 25000, status: 'OPEN', stageId: 4, stageName: 'Negociação', leadId: 6, leadName: 'Anna Nunes', createdAt: '2026-03-20T13:45:00.000Z', closedAt: null },
];
