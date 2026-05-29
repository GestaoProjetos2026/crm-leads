import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import BottlenecksPage from './pages/BottlenecksPage';
import ConversionLatencyPage from './pages/ConversionLatencyPage';
import FunnelPage from './pages/FunnelPage';

import { LoginScreen } from  './LoginScreen'
import { DashboardOverview } from './DashboardOverview';
import { LeadsScreen } from './LeadsScreen';
import { MainLayout } from './MainLayout';
import { SettingsPlaceholder } from './SettingsPlaceholder';
import { RegisterScreen } from './RegisterScreen';

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
        <Route path="/register" element={<RegisterScreen />} />
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
