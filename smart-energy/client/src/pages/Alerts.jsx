import React, { useEffect, useState } from 'react';
import api from '../api/http.js';
import DOMPurify from 'dompurify';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  useEffect(() => { api.get('/alerts').then((r) => setAlerts(r.data.alerts || [])); }, []);

  async function ack(id) {
    await api.post(`/alerts/${id}/ack`, { status: 'acknowledged' });
    setAlerts((prev) => prev.map((a) => (a._id === id ? { ...a, status: 'acknowledged' } : a)));
  }

  return (
    <div className="card">
      <h3>Alerts</h3>
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
