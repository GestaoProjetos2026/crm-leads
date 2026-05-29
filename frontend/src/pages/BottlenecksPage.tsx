import React, { useEffect, useState } from 'react';
import { MdWarning, MdContentPaste, MdRefresh, MdLens, MdClose, MdPerson } from 'react-icons/md';
import { Lead, LeadService } from '../services/LeadService';

function getHoursStagnant(createdAt: string): number {
  return (Date.now() - new Date(createdAt).getTime()) / 3600000;
}

function getUrgencyLevel(hours: number): 'critical' | 'warning' | 'moderate' {
  if (hours >= 96) return 'critical';
  if (hours >= 48) return 'warning';
  return 'moderate';
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'agora';
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}

const BottlenecksPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    loadBottlenecks();
  }, []);

  const loadBottlenecks = async () => {
    setLoading(true);
    setError(null);
    setUseMock(false);
    try {
      const data = await LeadService.getLeads();
      setLeads(data);
    } catch {
      setError('Não foi possível carregar os dados.');
      setUseMock(true);
    } finally {
      setLoading(false);
    }
  };

  const activeLeads = leads.filter(l => !l.isInactive);

  return (
    <div className="bottlenecks-page">
      {/* Header */}
      <header className="page-header">
        <div>
          <h2 className="page-title">
            <span className="title-icon"><MdWarning size={20} /></span>
            Gargalos Detectados
          </h2>
          <p className="page-subtitle">
            Leads parados além do SLA configurado — ação imediata necessária
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {useMock && (
            <span className="mock-badge">
              <MdContentPaste size={16} /> Dados de demonstração
            </span>
          )}
          <button className="btn btn-secondary hover-lift" onClick={loadBottlenecks}>
            <MdRefresh size={16} /> Atualizar
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card kpi-warning">
          <div className="kpi-icon"><MdPerson size={24} /></div>
          <div className="kpi-content">
            <span className="kpi-label">Gargalos Ativos</span>
            <span className="kpi-value">{loading ? 'Loading...' : activeLeads.length}</span>
          </div>
        </div>

        <div className="kpi-card kpi-critical">
          <div className="kpi-icon"><MdLens color="var(--danger)" size={24} /></div>
          <div className="kpi-content">
            <span className="kpi-label">Críticos (+96h)</span>
            <span className="kpi-value">{loading ? 'Loading...' : 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Analisando pipeline...</p>
        </div>
      ) : error ? (
        <div className="error-container glass-panel">
          <p><MdClose size={16} /> {error}</p>
          <button className="btn btn-primary" onClick={loadBottlenecks}>Tentar novamente</button>
        </div>
      ) : (
        <div className="bottlenecks-table-container glass-panel">
          <table className="bottlenecks-table" id="bottlenecks-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Lead</th>
                <th>Fonte</th>
                <th>Tempo no Pipeline</th>
                <th>Detectado</th>
              </tr>
            </thead>
            <tbody>
              {activeLeads.map((lead) => {
                const hours = getHoursStagnant(lead.createdAt);
                const urgency = getUrgencyLevel(hours);
                return (
                  <tr key={lead.id} className={`urgency-${urgency}`}>
                    <td>
                      <span className={`status-badge status-${urgency}`}>
                        {urgency === 'critical'
                          ? <><MdLens color="var(--danger)" size={12} /> CRÍTICO</>
                          : urgency === 'warning'
                          ? <><MdLens color="var(--warning)" size={12} /> ALERTA</>
                          : <><MdLens color="orange" size={12} /> MODERADO</>}
                      </span>
                    </td>
                    <td>
                      <div className="lead-info">
                        <span className="lead-name">{lead.firstName} {lead.lastName}</span>
                        <span className="lead-email">{lead.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className="stage-badge">{lead.source || '—'}</span>
                    </td>
                    <td>
                      <div className="time-info">
                        <span className="time-value">{Math.round(hours)}h</span>
                        <div className="time-bar-bg">
                          <div
                            className={`time-bar time-bar-${urgency}`}
                            style={{ width: `${Math.min(100, (hours / 96) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="detected-time">{formatTimeAgo(lead.createdAt)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BottlenecksPage;