import React, { useEffect, useState } from 'react';
import { auditApi, type ConversionLatencyItem } from '../services/api';
import { MdBarChart, MdContentPaste, MdRefresh, MdAttachMoney, MdSchedule, MdTrendingUp, MdLens } from 'react-icons/md';

// Mock data for when the API is not available
const MOCK_LATENCY: ConversionLatencyItem[] = [
  { stageId: 1, stageName: 'Prospecção',   orderPosition: 1, avgHours: 12,  maxHours: 36,  minHours: 2,  totalOpportunities: 15, totalStagnant: 0, totalValueAtRisk: 0 },
  { stageId: 2, stageName: 'Qualificação', orderPosition: 2, avgHours: 38,  maxHours: 72,  minHours: 8,  totalOpportunities: 12, totalStagnant: 3, totalValueAtRisk: 45000 },
  { stageId: 3, stageName: 'Negociação',   orderPosition: 3, avgHours: 65,  maxHours: 120, minHours: 24, totalOpportunities: 8,  totalStagnant: 2, totalValueAtRisk: 85000 },
  { stageId: 4, stageName: 'Proposta',     orderPosition: 4, avgHours: 42,  maxHours: 96,  minHours: 12, totalOpportunities: 6,  totalStagnant: 1, totalValueAtRisk: 120000 },
  { stageId: 5, stageName: 'Fechamento',   orderPosition: 5, avgHours: 18,  maxHours: 48,  minHours: 4,  totalOpportunities: 4,  totalStagnant: 1, totalValueAtRisk: 30310 },
];

const STAGE_SLA: Record<number, number> = { 1: 24, 2: 48, 3: 72, 4: 48, 5: 24 };

function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
}

function formatHours(hours: number): string {
  if (hours < 24) return `${Math.round(hours)}h`;
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}

function getHealthColor(avgHours: number, slaHours: number): string {
  const ratio = avgHours / slaHours;
  if (ratio > 1.5) return 'var(--danger)';
  if (ratio > 0.8) return 'var(--warning)';
  return 'var(--success)';
}

const ConversionLatencyPage: React.FC = () => {
  const [latency, setLatency] = useState<ConversionLatencyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    loadLatency();
  }, []);

  const loadLatency = async () => {
    setLoading(true);
    try {
      const response = await auditApi.getConversionLatency();
      if (response.data.length === 0) {
        setLatency(MOCK_LATENCY);
        setUseMock(true);
      } else {
        setLatency(response.data);
        setUseMock(false);
      }
    } catch {
      setLatency(MOCK_LATENCY);
      setUseMock(true);
    } finally {
      setLoading(false);
    }
  };

  const totalValueAtRisk = latency.reduce((sum, s) => sum + Number(s.totalValueAtRisk || 0), 0);
  const totalStagnant = latency.reduce((sum, s) => sum + Number(s.totalStagnant || 0), 0);
  const totalOpportunities = latency.reduce((sum, s) => sum + Number(s.totalOpportunities || 0), 0);
  const maxAvgHours = Math.max(...latency.map(s => Number(s.avgHours) || 0), 1);

  return (
    <div className="latency-page">
      {/* Header */}
      <header className="page-header">
        <div>
          <h2 className="page-title">
            <span className="title-icon"><MdBarChart size={20} /></span>
            Latência de Conversão por Etapa
          </h2>
          <p className="page-subtitle">
            Visão executiva do tempo médio em cada etapa do funil — Persona: Diretor Comercial
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {useMock && <span className="mock-badge"><MdContentPaste size={16} /> Dados de demonstração</span>}
          <button className="btn btn-secondary hover-lift" onClick={loadLatency}><MdRefresh size={16} /> Atualizar</button>
        </div>
      </header>

      {/* Executive KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card kpi-danger">
          <div className="kpi-icon"><MdAttachMoney size={24} /></div>
          <div className="kpi-content">
            <span className="kpi-label">Custo da Ineficiência</span>
            <span className="kpi-value">{formatCurrency(totalValueAtRisk)}</span>
          </div>
          <div className="kpi-pulse"></div>
        </div>

        <div className="kpi-card kpi-warning">
          <div className="kpi-icon"><MdSchedule size={24} /></div>
          <div className="kpi-content">
            <span className="kpi-label">Leads Estagnados</span>
            <span className="kpi-value">{totalStagnant} <span className="kpi-small">/ {totalOpportunities}</span></span>
          </div>
        </div>

        <div className="kpi-card kpi-info">
          <div className="kpi-icon"><MdTrendingUp size={24} /></div>
          <div className="kpi-content">
            <span className="kpi-label">Oportunidades Ativas</span>
            <span className="kpi-value">{totalOpportunities}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Calculando métricas de conversão...</p>
        </div>
      ) : (
        <>
          {/* Visual Pipeline Bars */}
          <div className="pipeline-visualization glass-panel">
            <h3 className="section-title">Funil de Conversão — Tempo Médio por Etapa</h3>
            <div className="pipeline-stages">
              {latency.map((stage, index) => {
                const sla = STAGE_SLA[stage.orderPosition] || 48;
                const healthColor = getHealthColor(Number(stage.avgHours), sla);
                const barWidth = (Number(stage.avgHours) / maxAvgHours) * 100;
                const isOverSla = Number(stage.avgHours) > sla;

                return (
                  <div key={stage.stageId ?? index} className="pipeline-stage">
                    <div className="stage-header">
                      <div className="stage-name-section">
                        <span className="stage-number">{stage.orderPosition}</span>
                        <span className="stage-label">{stage.stageName}</span>
                        {isOverSla && <span className="sla-breach-badge">ACIMA DO SLA</span>}
                      </div>
                      <div className="stage-metrics">
                        <span className="avg-time" style={{ color: healthColor }}>
                          Ø {formatHours(Number(stage.avgHours))}
                        </span>
                        <span className="sla-label">SLA: {sla}h</span>
                      </div>
                    </div>

                    <div className="bar-container">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${barWidth}%`,
                          background: `linear-gradient(90deg, ${healthColor}88, ${healthColor})`,
                        }}
                      >
                        <span className="bar-label">{formatHours(Number(stage.avgHours))}</span>
                      </div>
                      {/* SLA marker */}
                      <div
                        className="sla-marker"
                        style={{ left: `${(sla / maxAvgHours) * 100}%` }}
                        title={`SLA: ${sla}h`}
                      />
                    </div>

                    <div className="stage-footer">
                      <span className="footer-stat">
                        {stage.totalOpportunities} oportunidades
                      </span>
                      {Number(stage.totalStagnant) > 0 && (
                        <span className="footer-stat footer-stagnant">
                          <MdLens color="var(--danger)" size={12} /> {stage.totalStagnant} estagnadas ({formatCurrency(Number(stage.totalValueAtRisk))})
                        </span>
                      )}
                      <span className="footer-stat">
                        Min: {formatHours(Number(stage.minHours))} · Max: {formatHours(Number(stage.maxHours))}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detail Table */}
          <div className="latency-table-container glass-panel">
            <h3 className="section-title">Detalhamento por Etapa</h3>
            <table className="latency-table" id="conversion-latency-table">
              <thead>
                <tr>
                  <th>Etapa</th>
                  <th>Tempo Médio</th>
                  <th>Min</th>
                  <th>Max</th>
                  <th>SLA</th>
                  <th>Oportunidades</th>
                  <th>Estagnadas</th>
                  <th>Valor em Risco</th>
                </tr>
              </thead>
              <tbody>
                {latency.map((stage, idx) => {
                  const sla = STAGE_SLA[stage.orderPosition] || 48;
                  const isOverSla = Number(stage.avgHours) > sla;
                  return (
                    <tr key={stage.stageId ?? idx} className={isOverSla ? 'row-over-sla' : ''}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="stage-dot" style={{ background: getHealthColor(Number(stage.avgHours), sla) }}></span>
                          {stage.stageName}
                        </div>
                      </td>
                      <td style={{ color: getHealthColor(Number(stage.avgHours), sla), fontWeight: 600 }}>
                        {formatHours(Number(stage.avgHours))}
                      </td>
                      <td>{formatHours(Number(stage.minHours))}</td>
                      <td>{formatHours(Number(stage.maxHours))}</td>
                      <td>{sla}h</td>
                      <td>{stage.totalOpportunities}</td>
                      <td>
                        {Number(stage.totalStagnant) > 0 ? (
                          <span className="stagnant-count">{stage.totalStagnant}</span>
                        ) : (
                          <span style={{ color: 'var(--success)' }}>0</span>
                        )}
                      </td>
                      <td>
                        {Number(stage.totalValueAtRisk) > 0 ? (
                          <span className="value-at-risk">{formatCurrency(Number(stage.totalValueAtRisk))}</span>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ConversionLatencyPage;
