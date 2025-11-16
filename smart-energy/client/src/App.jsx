import React, { useEffect, useMemo, useState } from 'react';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Readings from './pages/Readings.jsx';
import Goals from './pages/Goals.jsx';
import Alerts from './pages/Alerts.jsx';
import Profile from './pages/Profile.jsx';
import Household from './pages/Household.jsx';
import { useAuth } from './context/AuthContext.jsx';

export default function App() {
  const [hash, setHash] = useState(window.location.hash || '#/login');
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    const onHash = () => setHash(window.location.hash || '#/login');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const nav = useMemo(() => {
    if (!user) return [];
    const items = [
      { href: '#/dashboard', label: 'Dashboard' },
      { href: '#/alerts', label: 'Alerts' },
      { href: '#/household', label: 'Household' },
      { href: '#/profile', label: 'Profile' },
    ];
    if (user.role === 'admin') {
      items.splice(1, 0, { href: '#/readings', label: 'Readings' }, { href: '#/goals', label: 'Goals' });
    }
    return items;
  }, [user]);

  return (
    <div>
      <header>
        <div>Smart Energy</div>
        <nav>
          {user && nav.map((n) => (
            <a key={n.href} href={n.href} className={hash === n.href ? 'active' : ''}>{n.label}</a>
          ))}
        </nav>
        <div>
          {user ? <button onClick={async () => { await logout(); window.location.hash = '#/login'; }}>Logout</button> : <a href="#/login">Login</a>}
        </div>
      </header>
      <div className="container">
        {hash === '#/login' && <Login />}
        {hash === '#/forgot' && <ForgotPassword />}
        {hash === '#/reset' && <ResetPassword />}
        <ProtectedRoute loading={loading}>
          {hash === '#/dashboard' && <Dashboard />}
          {hash === '#/alerts' && <Alerts />}
          {hash === '#/profile' && <Profile />}
          {hash === '#/household' && <Household />}
        </ProtectedRoute>
        <ProtectedRoute loading={loading} roles={['admin']}>
          {hash === '#/readings' && <Readings />}
          {hash === '#/goals' && <Goals />}
        </ProtectedRoute>
      </div>
    </div>
  );
}
