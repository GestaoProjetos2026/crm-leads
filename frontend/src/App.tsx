import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import BottlenecksPage from './pages/BottlenecksPage';
import ConversionLatencyPage from './pages/ConversionLatencyPage';

/**
 * Credenciais de demonstração aceitas pelo sistema.
 * Em produção, a autenticação é feita via JWT no backend.
 */
const DEMO_USERS: Record<string, { password: string; name: string; profile: string }> = {
  'diretor@demo.com':  { password: 'admin123', name: 'Diretor Comercial', profile: 'director' },
  'gestor@demo.com':   { password: 'admin123', name: 'Gestor de Tráfego', profile: 'marketing_manager' },
  'vendedor@demo.com': { password: 'admin123', name: 'Vendedor (SDR)', profile: 'sales_rep' },
};

const LoginScreen = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Tenta autenticar no backend real (NestJS)
      const response = await fetch('http://localhost:3000/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('sw_token', data.access_token);
        localStorage.setItem('sw_user', JSON.stringify({ email }));
        navigate('/dashboard');
        return;
      }
    } catch {
      // Backend indisponível — usa credenciais de demonstração
    }

    // 2. Fallback: valida com credenciais de demonstração
    const demoUser = DEMO_USERS[email.toLowerCase()];
    if (demoUser && password === demoUser.password) {
      localStorage.setItem('sw_user', JSON.stringify({
        email,
        name: demoUser.name,
        profile: demoUser.profile,
      }));
      setLoading(false);
      navigate('/dashboard');
      return;
    }

    // 3. Credenciais inválidas
    setLoading(false);
    setError('E-mail ou senha incorretos. Tente com as credenciais de demonstração.');
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div className="glass-panel" style={{ padding: '3rem 2rem', width: '100%', maxWidth: '420px', borderRadius: '16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--text-primary)', fontSize: '1.75rem', marginBottom: '0.5rem' }}>SalesWeakness</h2>
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
        </form>

        {/* Demo credentials hint */}
        <div style={{
          marginTop: '1.5rem',
          padding: '0.875rem',
          borderRadius: '8px',
          background: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
        }}>
          <p style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            🔑 Credenciais de Demonstração
          </p>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <div><strong style={{ color: 'var(--text-primary)' }}>diretor@demo.com</strong> · senha: admin123</div>
            <div><strong style={{ color: 'var(--text-primary)' }}>gestor@demo.com</strong> · senha: admin123</div>
            <div><strong style={{ color: 'var(--text-primary)' }}>vendedor@demo.com</strong> · senha: admin123</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/dashboard', label: 'Painel', icon: '📊' },
    { path: '/bottlenecks', label: 'Gargalos', icon: '🚨' },
    { path: '/conversion-latency', label: 'Latência', icon: '⏱️' },
    { path: '/settings', label: 'Configurações', icon: '⚙️' },
  ];

  return (
    <div className="app-container">
      <aside className="sidebar glass-panel">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">🎯</span>
            <h3 className="logo-text">SalesWeakness</h3>
          </div>
          <span className="version-badge">Sprint 4</span>
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
            <span className="nav-icon">🚪</span>
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
          <span className="title-icon">📊</span>
          Visão Geral
        </h2>
        <p className="page-subtitle">Dashboard do Diretor Comercial — Sprint 4: Motor de Gargalos</p>
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
         <button className="btn btn-secondary hover-lift">Exportar CSV</button>
         <button className="btn btn-primary hover-lift">Nova Oportunidade</button>
      </div>
    </header>
    
    <div className="kpi-grid">
      <div className="kpi-card kpi-info">
        <div className="kpi-icon">🎯</div>
        <div className="kpi-content">
          <span className="kpi-label">Leads Ativos</span>
          <span className="kpi-value">5</span>
        </div>
      </div>

      <div className="kpi-card kpi-danger">
        <div className="kpi-icon">💰</div>
        <div className="kpi-content">
          <span className="kpi-label">Valor em Risco</span>
          <span className="kpi-value">R$ 210.000</span>
        </div>
        <div className="kpi-pulse"></div>
      </div>

      <div className="kpi-card kpi-warning">
        <div className="kpi-icon">⚠️</div>
        <div className="kpi-content">
          <span className="kpi-label">Gargalos Ativos</span>
          <span className="kpi-value">4</span>
        </div>
      </div>
    </div>

    {/* Quick Links */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-lg)', marginTop: 'var(--spacing-xl)' }}>
      <Link to="/bottlenecks" className="quick-link-card glass-panel hover-lift">
        <div className="quick-link-icon">🚨</div>
        <div>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Gargalos Detectados</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Veja leads parados além do SLA e o valor em risco de cada oportunidade estagnada.
          </p>
        </div>
        <span className="quick-link-arrow">→</span>
      </Link>

      <Link to="/conversion-latency" className="quick-link-card glass-panel hover-lift">
        <div className="quick-link-icon">⏱️</div>
        <div>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Latência de Conversão</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Analise o tempo médio em cada etapa do funil e identifique onde sua equipe está perdendo dinheiro.
          </p>
        </div>
        <span className="quick-link-arrow">→</span>
      </Link>
    </div>
  </MainLayout>
);

const SettingsPlaceholder = ({ 
  theme, setTheme, 
  accentColor, setAccentColor, 
  fontSize, setFontSize 
}: any) => (
  <MainLayout>
    <header style={{ marginBottom: 'var(--spacing-xl)' }}>
      <h2 className="page-title" style={{ marginBottom: 'var(--spacing-xs)' }}>
        <span className="title-icon">⚙️</span>
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
            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem' }}>Tema Padrão</label>
            <select 
              value={theme} 
              onChange={(e) => setTheme(e.target.value)} 
              style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
            >
              <option value="dark">Modo Escuro (Dark)</option>
              <option value="light">Modo Claro (Light)</option>
            </select>
          </div>
          
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
            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)', fontSize: '0.875rem' }}>Cor de Destaque</label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {['#3B82F6', '#10B981', '#8B5CF6', '#F43F5E', '#F59E0B'].map(color => (
                <button 
                  key={color}
                  onClick={() => setAccentColor(color)}
                  style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', backgroundColor: color, 
                    border: accentColor === color ? '3px solid var(--text-primary)' : '2px solid transparent',
                    cursor: 'pointer',
                    boxShadow: accentColor === color ? '0 0 10px rgba(0,0,0,0.2)' : 'none',
                    transition: 'all var(--transition-fast)'
                  }}
                  aria-label={`Color ${color}`}
                />
              ))}
            </div>
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
              value="http://localhost:3000/v1/leads/ingest?tenantId=1"
              style={{ flex: 1, padding: 'var(--spacing-sm)', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}
            />
            <button className="btn btn-secondary">Copiar</button>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
            Header obrigatório: <code style={{ color: 'var(--accent-primary)' }}>x-api-key: sw-dev-api-key-2026</code>
          </p>
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

function App() {
  const [theme, setTheme] = useState('dark');
  const [accentColor, setAccentColor] = useState('#3B82F6');
  const [fontSize, setFontSize] = useState('16px');

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
        <Route path="/bottlenecks" element={<MainLayout><BottlenecksPage /></MainLayout>} />
        <Route path="/conversion-latency" element={<MainLayout><ConversionLatencyPage /></MainLayout>} />
        <Route 
          path="/settings" 
          element={
            <SettingsPlaceholder 
              theme={theme} 
              setTheme={setTheme} 
              accentColor={accentColor} 
              setAccentColor={setAccentColor}
              fontSize={fontSize}
              setFontSize={setFontSize}
            />
          } 
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;
