import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/http.js';
import DOMPurify from 'dompurify';
import { useAuth } from '../context/AuthContext.jsx';

export default function Alerts() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [alerts, setAlerts] = useState([]);
  const [households, setHouseholds] = useState([]);
  const [householdId, setHouseholdId] = useState('');

  useEffect(() => {
    api.get('/households/mine').then((r) => {
      const hs = r.data.households || [];
      setHouseholds(hs);
      if (hs[0]) setHouseholdId(hs[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!householdId) return;
    api.get('/alerts', { params: { householdId } }).then((r) => setAlerts(r.data.alerts || []));
  }, [householdId]);

  async function ack(id) {
    await api.post(`/alerts/${id}/ack`, { status: 'acknowledged' });
    setAlerts((prev) => prev.map((a) => (a._id === id ? { ...a, status: 'acknowledged' } : a)));
  }

  const visibleAlerts = useMemo(() => {
    if (isAdmin) return alerts;
    return alerts.filter((a) => a.status === 'acknowledged');
  }, [alerts, isAdmin]);

  return (
    <div className="card">
      <h3>Alerts</h3>
      <label>Household</label>
      <select value={householdId} onChange={(e) => setHouseholdId(e.target.value)}>
        {households.map((h) => <option key={h._id} value={h._id}>{h.name}</option>)}
      </select>
      {!isAdmin && <div className="muted">Alerts appear here once an administrator acknowledges them.</div>}
      <ul>
        {visibleAlerts.map((a) => (
          <li key={a._id}>
            <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(a.message || '') }} /> {/* [REQ:Sanitization:output] [REQ:XSS:encode] */}
            {' '}({a.status}){' '}
            {isAdmin && a.status !== 'acknowledged' && <button onClick={() => ack(a._id)}>Acknowledge</button>}
          </li>
        ))}
      </ul>
    </div>
  );
}
