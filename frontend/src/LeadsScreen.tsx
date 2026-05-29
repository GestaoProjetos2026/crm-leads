import { useEffect, useState } from 'react';
import { Lead, LeadService } from './services/LeadService';
import { MainLayout } from './MainLayout';

export const LeadsScreen = ({ viewMode }: { viewMode: string }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const data = await LeadService.getLeads();
        setLeads(data);
      } catch (error) {
        console.error('Failed to fetch leads:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true :
        statusFilter === 'active' ? !lead.isInactive :
          statusFilter === 'inactive' ? lead.isInactive : true;

    const matchesSource = sourceFilter === 'all' ? true : lead.source === sourceFilter;

    return matchesSearch && matchesStatus && matchesSource;
  });

  return (
    <MainLayout>
      <header style={{ marginBottom: 'var(--spacing-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: 'var(--spacing-xs)' }}>Leads</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Gerencie e acompanhe seus contatos comerciais.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'} hover-lift`}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Ocultar Filtros' : 'Filtrar'}
          </button>
          <button className="btn btn-primary hover-lift">Novo Lead</button>
        </div>
      </header>

      {showFilters && (
        <div className="glass-panel" style={{ padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)', display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 250px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Buscar</label>
            <input
              type="text"
              placeholder="Nome ou e-mail..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
            />
          </div>
          <div style={{ flex: '1 1 150px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
            >
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>
          <div style={{ flex: '1 1 150px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Origem</label>
            <select
              value={sourceFilter}
              onChange={e => setSourceFilter(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
            >
              <option value="all">Todas</option>
              <option value="facebook_leads">Facebook Leads</option>
              <option value="landing_page">Landing Page</option>
              <option value="organic">Orgânico</option>
              <option value="linkedin_ads">LinkedIn Ads</option>
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ color: 'var(--text-secondary)' }}>Carregando leads...</div>
      ) : viewMode === 'table' ? (
        <div className="glass-panel data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Origem</th>
                <th>Data de Entrada</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{lead.firstName} {lead.lastName}</div>
                  </td>
                  <td>{lead.email}</td>
                  <td>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{lead.source}</span>
                  </td>
                  <td>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </td>
                  <td>
                    {lead.isInactive ? (
                      <span className="badge badge-warning">Inativo</span>
                    ) : (
                      <span className="badge badge-success">Ativo</span>
                    )}
                  </td>
                  <td>
                    <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>Ver</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="leads-grid">
          {filteredLeads.map((lead) => (
            <div key={lead.id} className="glass-panel lead-card hover-lift">
              <div className="lead-card-header">
                <div>
                  <div className="lead-card-title">{lead.firstName} {lead.lastName}</div>
                  <div className="lead-card-subtitle">{lead.email}</div>
                </div>
                {lead.isInactive ? (
                  <span className="badge badge-warning">Inativo</span>
                ) : (
                  <span className="badge badge-success">Ativo</span>
                )}
              </div>
              <div style={{ padding: 'var(--spacing-sm) 0' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  {lead.source}
                </span>
              </div>
              <div className="lead-card-footer">
                <span>Criado em {new Date(lead.createdAt).toLocaleDateString('pt-BR')}</span>
                <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>Abrir</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  );
};