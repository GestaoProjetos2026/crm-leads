import { MdSettings } from 'react-icons/md';
import { MainLayout } from './MainLayout';

export const SettingsPlaceholder = ({
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