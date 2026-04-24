import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';

const LoginScreen = () => {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // O backend (NestJS + TypeORM) requer login, mas como o módulo está comentado,
    // simulamos a autenticação redirecionando para o painel.
    navigate('/dashboard');
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div className="glass-panel" style={{ padding: '3rem 2rem', width: '100%', maxWidth: '420px', borderRadius: '16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--text-primary)', fontSize: '1.75rem', marginBottom: '0.5rem' }}>SalesWeakness</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Faça login para acessar seu painel.</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label htmlFor="email" style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              E-mail Profissional
            </label>
            <input 
              id="email"
              type="email" 
              placeholder="diretor@empresa.com"
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
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
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', cursor: 'pointer' }}>
              <input type="checkbox" style={{ accentColor: 'var(--accent-primary)' }} />
              Lembrar de mim
            </label>
            <a href="#" style={{ color: 'var(--accent-primary)', fontSize: '0.875rem', textDecoration: 'none' }}>Esqueceu a senha?</a>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', marginTop: '0.5rem', fontSize: '1rem' }}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/dashboard', label: 'Painel' },
    { path: '/leads', label: 'Leads (Mock)' },
    { path: '/settings', label: 'Configurações' },
  ];

  return (
    <div className="app-container">
      <aside className="glass-panel" style={{ width: '250px', borderRight: '1px solid var(--border-color)', borderRadius: 0 }}>
        <div style={{ padding: 'var(--spacing-lg)' }}>
          <h3 style={{ color: 'var(--text-primary)' }}>SalesWeakness</h3>
        </div>
        <nav style={{ padding: 'var(--spacing-md)' }}>
          <ul style={{ listStyle: 'none' }}>
            {navItems.map(item => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <li key={item.path} style={{ padding: 'var(--spacing-sm) 0' }}>
                  <Link 
                    to={item.path} 
                    style={{ 
                      textDecoration: 'none', 
                      color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      fontWeight: isActive ? 'bold' : 'normal',
                      display: 'block',
                      transition: 'color var(--transition-fast)'
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

const DashboardPlaceholder = () => (
  <MainLayout>
    <header style={{ marginBottom: 'var(--spacing-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h2 style={{ color: 'var(--text-primary)' }}>Visão Geral</h2>
      <div style={{ display: 'flex', gap: '1rem' }}>
         <button className="btn btn-secondary hover-lift">Exportar CSV</button>
         <button className="btn btn-primary hover-lift">Nova Oportunidade</button>
      </div>
    </header>
    
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-lg)' }}>
      {/* KPI Cards */}
      {[1, 2, 3].map(i => (
        <div key={i} className="glass-panel hover-lift" style={{ padding: 'var(--spacing-lg)' }}>
          <h4 style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>Métrica {i}</h4>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>R$ 45.000</div>
        </div>
      ))}
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
      <h2 style={{ color: 'var(--text-primary)', marginBottom: 'var(--spacing-xs)' }}>Configurações</h2>
      <p style={{ color: 'var(--text-secondary)' }}>Gerencie as preferências da empresa, aparência e integrações.</p>
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
              value="https://api.salesweakness.com/v1/leads/ingest?tenant=42"
              style={{ flex: 1, padding: 'var(--spacing-sm)', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}
            />
            <button className="btn btn-secondary">Copiar</button>
          </div>
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
        <Route path="/dashboard" element={<DashboardPlaceholder />} />
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
