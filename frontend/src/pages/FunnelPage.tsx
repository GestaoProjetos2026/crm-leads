import { useEffect, useState } from 'react';
import { Opportunity, OpportunityService } from '../services/OpportunityService';

const FunnelPage = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const data = await OpportunityService.getOpportunities();
        setOpportunities(data);
      } catch (error) {
        console.error('Failed to fetch opportunities:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOpportunities();
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <header style={{ marginBottom: 'var(--spacing-md)' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: 'var(--spacing-xs)' }}>Funil de Vendas</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Acompanhe as oportunidades e o valor em negociação.</p>
      </header>

      {loading ? (
        <div style={{ color: 'var(--text-secondary)' }}>Carregando oportunidades...</div>
      ) : (
        <div className="glass-panel data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Oportunidade</th>
                <th>Valor</th>
                <th>Estágio</th>
                <th>Lead</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((opp) => (
                <tr key={opp.id}>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{opp.title}</div>
                  </td>
                  <td>
                    <span style={{ color: 'var(--text-primary)' }}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(opp.value)}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{opp.stageName}</span>
                  </td>
                  <td>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{opp.leadName}</span>
                  </td>
                  <td>
                    {opp.status === 'WON' ? (
                      <span className="badge badge-success">Ganha</span>
                    ) : opp.status === 'LOST' ? (
                      <span className="badge badge-danger">Perdida</span>
                    ) : (
                      <span className="badge badge-primary">Aberta</span>
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
      )}
    </div>
  );
};

export default FunnelPage;
