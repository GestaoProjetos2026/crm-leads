import { Link } from 'react-router-dom';
import { MdBarChart, MdWarning, MdSchedule, MdTrackChanges, MdArrowForward, MdAttachMoney } from 'react-icons/md';
import { MainLayout } from './MainLayout';


export const DashboardOverview = () => (
  <MainLayout>
    <header className="page-header">
      <div>
        <h2 className="page-title">
          <span className="title-icon"><MdBarChart size={20} /></span>
          Visão Geral
        </h2>
        <p className="page-subtitle">Dashboard do Diretor Comercial: Motor de Gargalos</p>
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button className="btn btn-secondary hover-lift">Exportar CSV</button>
        <button className="btn btn-primary hover-lift">Nova Oportunidade</button>
      </div>
    </header>

    <div className="kpi-grid">
      <div className="kpi-card kpi-info">
        <div className="kpi-icon"><MdTrackChanges size={24} /></div>
        <div className="kpi-content">
          <span className="kpi-label">Leads Ativos</span>
          <span className="kpi-value">5</span>
        </div>
      </div>

      <div className="kpi-card kpi-danger">
        <div className="kpi-icon"><MdAttachMoney size={24} /></div>
        <div className="kpi-content">
          <span className="kpi-label">Valor em Risco</span>
          <span className="kpi-value">R$ 210.000</span>
        </div>
        <div className="kpi-pulse"></div>
      </div>

      <div className="kpi-card kpi-warning">
        <div className="kpi-icon"><MdWarning size={24} /></div>
        <div className="kpi-content">
          <span className="kpi-label">Gargalos Ativos</span>
          <span className="kpi-value">4</span>
        </div>
      </div>
    </div>

    {/* Quick Links */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-lg)', marginTop: 'var(--spacing-xl)' }}>
      <Link to="/bottlenecks" className="quick-link-card glass-panel hover-lift">
        <div className="quick-link-icon"><MdWarning size={24} /></div>
        <div>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Gargalos Detectados</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Veja leads parados além do SLA e o valor em risco de cada oportunidade estagnada.
          </p>
        </div>
        <span className="quick-link-arrow"><MdArrowForward size={16} /></span>
      </Link>

      <Link to="/conversion-latency" className="quick-link-card glass-panel hover-lift">
        <div className="quick-link-icon"><MdSchedule size={24} /></div>
        <div>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Latência de Conversão</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Analise o tempo médio em cada etapa do funil e identifique onde sua equipe está perdendo dinheiro.
          </p>
        </div>
        <span className="quick-link-arrow"><MdArrowForward size={16} /></span>
      </Link>
    </div>
  </MainLayout>
);