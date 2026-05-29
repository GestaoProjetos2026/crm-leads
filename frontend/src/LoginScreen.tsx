import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from './services/api';
import { isAxiosError } from 'axios';

import logo from './assets/logo2.svg';

export const LoginScreen = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loadingLoginLocal, setLoadingLoginLocal] = useState(false);
  const [loadingLoginCore, setLoadingLoginCore] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Pequeno delay para garantir que o browser pintou o estado inicial (opacity: 0)
    const timer = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    const button = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement;
    const buttonName = button.name as 'core' | 'salesweakness'

    e.preventDefault();
    setError('');

    if (buttonName === 'salesweakness')
      setLoadingLoginLocal(true);
    else if (buttonName === 'core')
      setLoadingLoginCore(true);

    try {
      const response = await authApi.login(email, password, buttonName);
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
    } finally {
      setLoadingLoginLocal(false);
      setLoadingLoginCore(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div
        className="glass-panel"
        style={{
          padding: '3rem 2rem',
          width: '100%',
          maxWidth: '420px',
          borderRadius: '16px',
          // Animação de entrada
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}
      >
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

          <div style={{ position: 'relative' }}>
            <label htmlFor="password" style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              Senha
            </label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              style={{ width: '100%', padding: '0.75rem', paddingRight: '2.5rem', borderRadius: '8px', border: `1px solid ${error ? 'rgba(239, 68, 68, 0.5)' : 'var(--border-color)'}`, background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.2s' }}
            />

            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              style={{
                position: 'absolute',
                right: '0.5rem',
                top: '50%',
                background: 'transparent',
                border: 'none',
                padding: '0.25rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-secondary)'
              }}
            >
              {showPassword ? (
                // eye-off / hidden
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10.58 10.58A3 3 0 0113.42 13.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9.88 5.07C11.02 4.82 12.26 4.75 13.5 5.05C17 5.9 20 9 21 12C20.26 14.04 18.88 15.77 16.94 17.08" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                // eye / visible
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>

          <button
            name="salesweakness"
            type="submit"
            className="btn btn-primary"
            disabled={loadingLoginLocal}
            style={{
              width: '100%', padding: '0.875rem', marginTop: '0.5rem', fontSize: '1rem',
              opacity: loadingLoginLocal ? 0.7 : 1, cursor: loadingLoginLocal ? 'wait' : 'pointer',
            }}
          >
            {loadingLoginLocal ? 'Entrando...' : 'Entrar'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.5rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>ou</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          </div>
          <div className="divider" style={{ display: 'flex', alignItems: 'center', justifyContent: 'right' }}>
            <button
              name="core"
              type="submit"
              className="btn btn-primary"
              disabled={loadingLoginLocal}
              style={{
                width: '100%', padding: '0.875rem', fontSize: '1rem',
                opacity: loadingLoginLocal ? 0.7 : 1, cursor: loadingLoginLocal ? 'wait' : 'pointer',
              }}
            >
              {loadingLoginCore ? 'Entrando...' : 'Cooregle'}
            </button>
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
            Não tem uma conta? <a href="/register" style={{ color: 'var(--accent-primary)' }}>Registrar-se</a>
          </p>
        </form>
      </div>
    </div>
  );
};