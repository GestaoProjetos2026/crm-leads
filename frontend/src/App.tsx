import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import BottlenecksPage from './pages/BottlenecksPage';
import ConversionLatencyPage from './pages/ConversionLatencyPage';
import FunnelPage from './pages/FunnelPage';
import { Lead, LeadService } from './services/LeadService';
import { authApi } from './services/api';
import { isAxiosError } from 'axios';
import logo from './assets/logo2.svg';
import { MdBarChart, MdPeople, MdWarning, MdSchedule, MdSettings, MdExitToApp, MdTrackChanges, MdArrowForward, MdAttachMoney } from 'react-icons/md';

const LoginScreen = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    const button = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement;

    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login(email, password, button.name as 'core' | 'salesweakness');
      const token = response.data.access_token;
      
      // Decodifica o JWT base64 para pegar os roles (Core Engine JWT usa 'roles' em vez de 'profile')
      const payloadBase64 = token.split('.')[1];
      const payload = JSON.parse(atob(payloadBase64));

      localStorage.setItem('sw_token', token);
      localStorage.setItem('sw_user', JSON.stringify({ 
        email,
        name: email.split('@')[0],
        profile: (payload.roles && payload.roles.length > 0) ? payload.roles[0] : 'user'
      }));
      
      navigate('/dashboard');
    } catch (err: any) {
      setLoading(false);
      if (isAxiosError(err)) {
        if (!err.response) {
          setError('Erro de conexão: Não foi possível alcançar o servidor.');
        } else if (err.response.status === 401) {
          setError('E-mail ou senha incorretos.');
        } else if (err.response.status === 403) {
          setError('Sua conta ou tenant está bloqueada.');
        } else {
          setError(`Erro ao fazer login: ${err.response.data?.message || err.message}`);
        }
      } else {
        setError('Ocorreu um erro inesperado.');
      }
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div className="glass-panel" style={{ padding: '3rem 2rem', width: '100%', maxWidth: '420px', borderRadius: '16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src={logo} alt="SalesWeakness Logo" style={{ width: '250px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Faça login para acessar seu painel.</p>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            color: '#EF4444',
            fontSize: '0.85rem',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label htmlFor="email" style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              E-mail Profissional
            </label>
            <input
              id="email"
              type="email"
              placeholder="diretor@demo.com"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${error ? 'rgba(239, 68, 68, 0.5)' : 'var(--border-color)'}`, background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.2s' }}
            />
          </div>

          <div>
            <label htmlFor="password" style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              Senha
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${error ? 'rgba(239, 68, 68, 0.5)' : 'var(--border-color)'}`, background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.2s' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', cursor: 'pointer' }}>
              <input type="checkbox" style={{ accentColor: 'var(--accent-primary)' }} />
              Lembrar de mim
            </label>
            <a href="#" style={{ color: 'var(--accent-primary)', fontSize: '0.875rem', textDecoration: 'none' }}>Esqueceu a senha?</a>
          </div>

          <button
            name="salesweakness"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: '100%', padding: '0.875rem', marginTop: '0.5rem', fontSize: '1rem',
              opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer',
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          <div className="divider" style={{ display: 'flex', alignItems: 'center', justifyContent: 'right' }}>
            <button
              name="core"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: 'fit-content', padding: '0.875rem', fontSize: '1rem',
                opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer',
              }}
            >
              {loading ? 'Entrando...' : 'Cooregle'}
            </button>
          </div>
        </form>


      </div>
    </div>
  );
};

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Painel', icon: <MdBarChart size={16} /> },
    { path: '/leads', label: 'Leads', icon: <MdPeople size={16} /> },
    { path: '/funnel', label: 'Funil', icon: <MdTrackChanges size={16} /> },
    { path: '/bottlenecks', label: 'Gargalos', icon: <MdWarning size={16} /> },
    { path: '/conversion-latency', label: 'Latência', icon: <MdSchedule size={16} /> },
    { path: '/settings', label: 'Configurações', icon: <MdSettings size={16} /> },
  ];

  return (
    <div className="app-container">
      <aside className="sidebar glass-panel">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src={logo} alt="SalesWeakness Logo" style={{ width: '180px' }} />
          </div>
        </div>
        <nav className="sidebar-nav">
          <ul style={{ listStyle: 'none' }}>
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="sidebar-footer">
          <Link to="/login" className="nav-link" style={{ color: 'var(--danger)' }}>
            <span className="nav-icon"><MdExitToApp size={16} /></span>
            Sair
          </Link>
        </div>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

const DashboardOverview = () => (
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

const SettingsPlaceholder = ({
  accentColor, setAccentColor,
  fontSize, setFontSize,
  leadsViewMode, setLeadsViewMode
}: any) => (
  <MainLayout>
    <header style={{ marginBottom: 'var(--spacing-xl)' }}>
      <h2 className="page-title" style={{ marginBottom: 'var(--spacing-xs)' }}>
        <span className="title-icon"><MdSettings size={20} /></span>
        Configurações
      </h2>
      <p className="page-subtitle">Gerencie as preferências da empresa, aparência e integrações.</p>
    </header>

    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', maxWidth: '800px' }}>

      {/* Section 1: Aparência */}
      <section className="glass-panel" style={{ padding: 'var(--spacing-lg)' }}>
        <h3 style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
          Aparência e Personalização
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem' }}>Tamanho da Fonte</label>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
            >
              <option value="14px">Pequeno (Mais espaço)</option>
              <option value="16px">Normal (Padrão)</option>
              <option value="18px">Grande (Acessibilidade)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem' }}>Visualização de Leads</label>
            <select
              value={leadsViewMode}
              onChange={(e) => setLeadsViewMode(e.target.value)}
              style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
            >
              <option value="table">Tabela (Lista)</option>
              <option value="grid">Cards (Grade)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Section 2: Regras de Negócio */}
      <section className="glass-panel" style={{ padding: 'var(--spacing-lg)' }}>
        <h3 style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
          Regras de SLA e Estagnação
        </h3>

        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem' }}>
            Tempo de Estagnação de Lead (Horas)
          </label>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input
              type="number"
              defaultValue={48}
              style={{ padding: 'var(--spacing-sm)', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', width: '100px' }}
            />
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Alerta o Gestor quando um lead ficar inativo por este período (Padrão: 48h).</span>
          </div>
        </div>
      </section>

      {/* Section 3: Integrações */}
      <section className="glass-panel" style={{ padding: 'var(--spacing-lg)' }}>
        <h3 style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
          Integrações e Webhooks
        </h3>

        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem' }}>
            URL de Ingestão de Leads (Webhook)
          </label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input
              type="text"
              readOnly
              value="https://api.salesweakness.com/v1/leads/ingest?tenant=42"
              style={{ flex: 1, padding: 'var(--spacing-sm)', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}
            />
            <button className="btn btn-secondary">Copiar</button>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
            Header obrigatório: <code style={{ color: 'var(--accent-primary)' }}>x-api-key: sw-dev-api-key-2026</code>
          </p>
        </div>

        <div>
          <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem' }}>
            API Key do WhatsApp (Disparo de Reativação)
          </label>
          <input
            type="password"
            defaultValue="sk_test_whatsapp_12345"
            style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
          />
        </div>
      </section>

      {/* Save Button Action */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: 'var(--spacing-md)' }}>
        <button className="btn btn-secondary">Cancelar</button>
        <button className="btn btn-primary">Salvar Alterações</button>
      </div>

    </div>
  </MainLayout>
);

const LeadsScreen = ({ viewMode }: { viewMode: string }) => {
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

function App() {
  const theme = 'dark';
  const [accentColor, setAccentColor] = useState('#0466c8');
  const [fontSize, setFontSize] = useState('16px');
  const [leadsViewMode, setLeadsViewMode] = useState('table');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.setProperty('--accent-primary', accentColor);
    document.documentElement.style.setProperty('--base-font-size', fontSize);
  }, [theme, accentColor, fontSize]);

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/dashboard" element={<DashboardOverview />} />
        <Route path="/leads" element={<LeadsScreen viewMode={leadsViewMode} />} />
        <Route path="/funnel" element={<MainLayout><FunnelPage /></MainLayout>} />
        <Route path="/bottlenecks" element={<MainLayout><BottlenecksPage /></MainLayout>} />
        <Route path="/conversion-latency" element={<MainLayout><ConversionLatencyPage /></MainLayout>} />
        <Route
          path="/settings"
          element={
            <SettingsPlaceholder
              accentColor={accentColor}
              setAccentColor={setAccentColor}
              fontSize={fontSize}
              setFontSize={setFontSize}
              leadsViewMode={leadsViewMode}
              setLeadsViewMode={setLeadsViewMode}
            />
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;
