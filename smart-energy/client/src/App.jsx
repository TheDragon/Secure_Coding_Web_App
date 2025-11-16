import React, { useEffect, useMemo, useState } from 'react';
import api from './api/http.js';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Readings from './pages/Readings.jsx';
import Goals from './pages/Goals.jsx';
import Alerts from './pages/Alerts.jsx';
import Profile from './pages/Profile.jsx';
import Household from './pages/Household.jsx';

const routes = ['/', '#/login', '#/register', '#/forgot', '#/reset', '#/dashboard', '#/readings', '#/goals', '#/alerts', '#/profile', '#/household'];

export default function App() {
  const [hash, setHash] = useState(window.location.hash || '#/login');
  const [me, setMe] = useState(null);

  useEffect(() => {
    const onHash = () => setHash(window.location.hash || '#/login');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return setMe(null);
    api.get('/users/me').then((r) => {
      setMe(r.data.user);
      localStorage.setItem('role', r.data.user.role);
    }).catch(() => setMe(null));
  }, [hash]);

  const nav = useMemo(() => ([
    { href: '#/dashboard', label: 'Dashboard' },
    { href: '#/readings', label: 'Readings' },
    { href: '#/goals', label: 'Goals' },
    { href: '#/alerts', label: 'Alerts' },
    { href: '#/household', label: 'Household' },
    { href: '#/profile', label: 'Profile' },
  ]), []);

  async function logout() {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.hash = '#/login';
  }

  return (
    <div>
      <header>
        <div>Smart Energy</div>
        <nav>
          {me && nav.map((n) => (
            <a key={n.href} href={n.href} className={hash === n.href ? 'active' : ''}>{n.label}</a>
          ))}
        </nav>
        <div>
          {me ? <button onClick={logout}>Logout</button> : <a href="#/login">Login</a>}
        </div>
      </header>
      <div className="container">
        {hash === '#/register' && <Register />}
        {hash === '#/login' && <Login />}
        {hash === '#/forgot' && <ForgotPassword />}
        {hash === '#/reset' && <ResetPassword />}
        <ProtectedRoute>
          {hash === '#/dashboard' && <Dashboard />}
          {hash === '#/readings' && <Readings />}
          {hash === '#/goals' && <Goals />}
          {hash === '#/alerts' && <Alerts />}
          {hash === '#/profile' && <Profile />}
          {hash === '#/household' && <Household />}
        </ProtectedRoute>
      </div>
    </div>
  );
}
