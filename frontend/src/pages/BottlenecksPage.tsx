import React, { useEffect, useState } from 'react';
import { auditApi, type BottleneckItem } from '../services/api';
import { MdWarning, MdContentPaste, MdRefresh, MdAttachMoney, MdLens, MdClose } from 'react-icons/md';

// Mock data for when the API is not available
const MOCK_BOTTLENECKS: BottleneckItem[] = [
  {
    id: 1, opportunityId: 1, leadId: 1,
    leadName: 'Maria Santos', leadEmail: 'maria@empresa.com',
    stageName: 'Qualificação', stageId: 2, weaknessType: 'Stagnation',
    description: 'Lead parado há 72h na etapa "Qualificação" (SLA: 48h). Valor em risco: R$ 15.000,00',
    hoursStagnant: 72, value: 15000, detectedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 2, opportunityId: 2, leadId: 2,
    leadName: 'Pedro Oliveira', leadEmail: 'pedro@empresa.com',
    stageName: 'Negociação', stageId: 3, weaknessType: 'Stagnation',
    description: 'Lead parado há 96h na etapa "Negociação" (SLA: 72h). Valor em risco: R$ 45.000,00',
    hoursStagnant: 96, value: 45000, detectedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 3, opportunityId: 4, leadId: 4,
    leadName: 'Lucas Souza', leadEmail: 'lucas@empresa.com',
    stageName: 'Proposta', stageId: 4, weaknessType: 'Stagnation',
    description: 'Lead parado há 60h na etapa "Proposta" (SLA: 48h). Valor em risco: R$ 120.000,00',
    hoursStagnant: 60, value: 120000, detectedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 4, opportunityId: 5, leadId: 5,
    leadName: 'Juliana Ferreira', leadEmail: 'juliana@empresa.com',
    stageName: 'Fechamento', stageId: 5, weaknessType: 'Stagnation',
    description: 'Lead parado há 30h na etapa "Fechamento" (SLA: 24h). Valor em risco: R$ 30.000,00',
    hoursStagnant: 30, value: 30310, detectedAt: new Date(Date.now() - 3600000 * 0.5).toISOString(),
  },
];

function getUrgencyLevel(hours: number, slaHours: number = 48): 'critical' | 'warning' | 'moderate' {
  const ratio = hours / slaHours;
  if (ratio >= 2) return 'critical';
  if (ratio >= 1.5) return 'warning';
  return 'moderate';
}

function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
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
  const [bottlenecks, setBottlenecks] = useState<BottleneckItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    loadBottlenecks();
  }, []);

  const loadBottlenecks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await auditApi.getBottlenecks();
      if (response.data.length === 0) {
        setBottlenecks(MOCK_BOTTLENECKS);
        setUseMock(true);
      } else {
        setBottlenecks(response.data);
        setUseMock(false);
      }
    } catch {
      setBottlenecks(MOCK_BOTTLENECKS);
      setUseMock(true);
    } finally {
      setLoading(false);
    }
  };

  const totalValueAtRisk = bottlenecks.reduce(
    (sum, b) => sum + (Number(b.value) || 0), 0
  );

  const criticalCount = bottlenecks.filter(
    b => getUrgencyLevel(b.hoursStagnant) === 'critical'
  ).length;

  return (
    <div className="bottlenecks-page">
      {/* Header Section */}
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

      {/* KPI Summary Cards */}
      <div className="kpi-grid">
        <div className="kpi-card kpi-danger">
          <div className="kpi-icon"><MdAttachMoney size={24} /></div>
          <div className="kpi-content">
            <span className="kpi-label">Valor em Risco Total</span>
            <span className="kpi-value">{formatCurrency(totalValueAtRisk)}</span>
          </div>
          <div className="kpi-pulse"></div>
        </div>

        <div className="kpi-card kpi-warning">
          <div className="kpi-icon"><MdWarning size={24} /></div>
          <div className="kpi-content">
            <span className="kpi-label">Gargalos Ativos</span>
            <span className="kpi-value">{bottlenecks.length}</span>
          </div>
        </div>

        <div className="kpi-card kpi-critical">
          <div className="kpi-icon"><MdLens color="var(--danger)" size={24} /></div>
          <div className="kpi-content">
            <span className="kpi-label">Críticos (2x SLA)</span>
            <span className="kpi-value">{criticalCount}</span>
          </div>
        </div>
      </div>

      {/* Bottlenecks Table */}
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
                <th>Etapa</th>
                <th>Tempo Parado</th>
                <th>Valor em Risco</th>
                <th>Detectado</th>
              </tr>
            </thead>
            <tbody>
              {bottlenecks.map((item, idx) => {
                const urgency = getUrgencyLevel(item.hoursStagnant);
                return (
                  <tr key={item.id ?? idx} className={`urgency-${urgency}`}>
                    <td>
                      <span className={`status-badge status-${urgency}`}>
                        {urgency === 'critical' ? <><MdLens color="var(--danger)" size={12} /> CRÍTICO</> :
                         urgency === 'warning' ? <><MdLens color="var(--warning)" size={12} /> ALERTA</> : <><MdLens color="orange" size={12} /> MODERADO</>}
                      </span>
                    </td>
                    <td>
                      <div className="lead-info">
                        <span className="lead-name">{item.leadName}</span>
                        <span className="lead-email">{item.leadEmail}</span>
                      </div>
                    </td>
                    <td>
                      <span className="stage-badge">{item.stageName}</span>
                    </td>
                    <td>
                      <div className="time-info">
                        <span className="time-value">{Math.round(item.hoursStagnant)}h</span>
                        <div className="time-bar-bg">
                          <div
                            className={`time-bar time-bar-${urgency}`}
                            style={{ width: `${Math.min(100, (item.hoursStagnant / 96) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="value-at-risk">{formatCurrency(item.value)}</span>
                    </td>
                    <td>
                      <span className="detected-time">{formatTimeAgo(item.detectedAt)}</span>
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
