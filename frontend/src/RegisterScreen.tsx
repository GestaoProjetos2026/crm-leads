import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from './services/api';
import { isAxiosError } from 'axios';

import logo from './assets/logo2.svg';

export const RegisterScreen = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Pequeno delay para garantir que o browser pintou o estado inicial (opacity: 0)
    const timer = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Derived: só mostra indicador quando o campo de confirmação tiver algum conteúdo
  const passwordTouched = passwordConfirm.length > 0;
  const passwordsMatch = password === passwordConfirm;

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!passwordsMatch) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      await authApi.register(email, password);

      const responselogin = await authApi.login(email, password, 'salesweakness');
      const token = responselogin.data.access_token;

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
        } else if (err.response.status === 409) {
          setError('Este e-mail já está em uso.');
        } else if (err.response.status === 403) {
          setError('Registro não permitido para este domínio.');
        } else {
          setError(`Erro ao registrar: ${err.response.data?.message || err.message}`);
        }
      } else {
        setError('Ocorreu um erro inesperado.');
      }
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ visible }: { visible: boolean }) =>
    visible ? (
      // eye-off
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10.58 10.58A3 3 0 0113.42 13.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.88 5.07C11.02 4.82 12.26 4.75 13.5 5.05C17 5.9 20 9 21 12C20.26 14.04 18.88 15.77 16.94 17.08" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ) : (
      // eye
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );

  const eyeBtnStyle: React.CSSProperties = {
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
    color: 'var(--text-secondary)',
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
          <p style={{ color: 'var(--text-secondary)' }}>Registre uma nova conta!</p>
        </div>

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

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* E-mail */}
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

          {/* Senha */}
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
              style={eyeBtnStyle}
            >
              <EyeIcon visible={showPassword} />
            </button>
          </div>

          {/* Confirmar Senha */}
          <div>
            <div style={{ position: 'relative' }}>
              <label htmlFor="passwordConfirm" style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                Repetir Senha
              </label>
              <input
                id="passwordConfirm"
                type={showPasswordConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                required
                value={passwordConfirm}
                onChange={(e) => { setPasswordConfirm(e.target.value); setError(''); }}
                style={{
                  width: '100%', padding: '0.75rem', paddingRight: '2.5rem', borderRadius: '8px',
                  border: `1px solid ${
                    passwordTouched
                      ? passwordsMatch
                        ? 'rgba(34, 197, 94, 0.6)'
                        : 'rgba(239, 68, 68, 0.5)'
                      : 'var(--border-color)'
                  }`,
                  background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.2s'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirm((s) => !s)}
                aria-label={showPasswordConfirm ? 'Ocultar senha' : 'Mostrar senha'}
                title={showPasswordConfirm ? 'Ocultar senha' : 'Mostrar senha'}
                style={eyeBtnStyle}
              >
                <EyeIcon visible={showPasswordConfirm} />
              </button>
            </div>

            {/* Indicador de senhas */}
            {passwordTouched && (
              <p style={{
                marginTop: '0.4rem',
                fontSize: '0.78rem',
                color: passwordsMatch ? '#22C55E' : '#EF4444',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}>
                {passwordsMatch ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    As senhas coincidem
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    As senhas não coincidem
                  </>
                )}
              </p>
            )}
          </div>

          {/* Botão Registrar */}
          <button
            name="salesweakness"
            type="submit"
            className="btn btn-primary"
            disabled={loading || (passwordTouched && !passwordsMatch)}
            style={{
              width: '100%', padding: '0.875rem', marginTop: '0.5rem', fontSize: '1rem',
              opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer',
            }}
          >
            {loading ? 'Registrando...' : 'Registrar'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Já tem uma conta?{' '}
            <a href="/login" style={{ color: 'var(--accent-primary)' }}>Entrar</a>
          </p>

        </form>
      </div>
    </div>
  );
};