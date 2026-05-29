import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from './services/api';
import { isAxiosError } from 'axios';

import logo from './assets/logo2.svg';

export const LoginScreen = () => {
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