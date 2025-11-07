import React, { useEffect, useState } from 'react';
import api from '../api/http.js';
import ChartCard from '../components/ChartCard.jsx';
import StatCard from '../components/StatCard.jsx';
import DOMPurify from 'dompurify';

export default function Dashboard() {
  const [meters, setMeters] = useState([]);
  const [readings, setReadings] = useState({});
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    api.get('/meters').then((r) => setMeters(r.data.meters || []));
  }, []);

  useEffect(() => {
    async function load() {
      const out = {};
      for (const m of meters) {
        const r = await api.get(`/readings/by-meter/${m._id}?limit=7`);
        out[m._id] = r.data.readings || [];
      }
      setReadings(out);
    }
    if (meters.length) load();
  }, [meters]);

  useEffect(() => {
    api.get('/alerts').then((r) => setAlerts(r.data.alerts || []));
  }, []);

  return (
    <div>
      <div className="grid">
        <StatCard label="Meters" value={meters.length} />
        <StatCard label="Open Alerts" value={alerts.filter((a) => a.status === 'open').length} />
      </div>
      <div className="row">
        {meters.map((m) => {
          const data = readings[m._id] || [];
          const labels = data.map((d) => new Date(d.recordedAt).toLocaleDateString());
          const vals = data.map((d) => d.value);
          return <div className="col" key={m._id}><ChartCard title={`${m.label} (${m.unit})`} labels={labels} data={vals} /></div>;
        })}
      </div>
      <div className="card">
        <h3>Alerts</h3>
        <ul>
          {alerts.map((a) => (
            <li key={a._id}>
              <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(a.message || '') }} /> {/* [REQ:Sanitization:output] [REQ:XSS:encode] */}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
