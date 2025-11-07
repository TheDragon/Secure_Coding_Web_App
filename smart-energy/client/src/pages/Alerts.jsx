import React, { useEffect, useState } from 'react';
import api from '../api/http.js';
import DOMPurify from 'dompurify';

export default function Alerts() {
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

  return (
    <div className="card">
      <h3>Alerts</h3>
      <label>Household</label>
      <select value={householdId} onChange={(e) => setHouseholdId(e.target.value)}>
        {households.map((h) => <option key={h._id} value={h._id}>{h.name}</option>)}
      </select>
      <ul>
        {alerts.map((a) => (
          <li key={a._id}>
            <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(a.message || '') }} /> {/* [REQ:Sanitization:output] [REQ:XSS:encode] */}
            {' '}({a.status}){' '}
            {a.status !== 'acknowledged' && <button onClick={() => ack(a._id)}>Acknowledge</button>}
          </li>
        ))}
      </ul>
    </div>
  );
}
