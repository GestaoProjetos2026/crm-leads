import { Link, useLocation } from 'react-router-dom';
import logo from './assets/logo2.svg';
import { MdBarChart, MdPeople, MdWarning, MdSchedule, MdSettings, MdExitToApp, MdTrackChanges } from 'react-icons/md';

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
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