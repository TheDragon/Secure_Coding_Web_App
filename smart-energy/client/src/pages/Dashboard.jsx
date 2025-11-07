import React, { useEffect, useState } from 'react';
import api from '../api/http.js';
import ChartCard from '../components/ChartCard.jsx';
import StatCard from '../components/StatCard.jsx';
import DOMPurify from 'dompurify';

export default function Dashboard() {
  const [households, setHouseholds] = useState([]);
  const [byHousehold, setByHousehold] = useState({}); // { householdId: { meters: [], readings: {meterId: []}, alerts: [] } }
  const [expanded, setExpanded] = useState({}); // collapsed by default

  useEffect(() => {
    api.get('/households/mine').then(async (r) => {
      const hs = r.data.households || [];
      setHouseholds(hs);
      const map = {};
      for (const h of hs) {
        // meters
        const mRes = await api.get('/meters', { params: { householdId: h._id } });
        const meters = mRes.data.meters || [];
        // readings per meter
        const readings = {};
        for (const m of meters) {
          const rRes = await api.get(`/readings/by-meter/${m._id}?limit=7`);
          readings[m._id] = rRes.data.readings || [];
        }
        // alerts for this household
        const aRes = await api.get('/alerts', { params: { householdId: h._id } });
        const alerts = aRes.data.alerts || [];
        map[h._id] = { meters, readings, alerts };
      }
      setByHousehold(map);
      // initialize collapsed state
      const exp = {};
      hs.forEach((h) => (exp[h._id] = false));
      setExpanded(exp);
    });
  }, []);

  return (
    <div>
      {households.length === 0 && (
        <div className="card">
          <h3>Welcome!</h3>
          <p className="muted">To get started:</p>
          <ol>
            <li>Create a household in the Household page.</li>
            <li>Add a meter (Electricity or Water) to that household.</li>
            <li>Set a goal (e.g., Daily Electricity limit).</li>
            <li>Add readings; alerts will trigger when usage exceeds a goal.</li>
          </ol>
          <div><a href="#/household">Go to Household</a> · <a href="#/goals">Set Goals</a> · <a href="#/readings">Add Readings</a></div>
        </div>
      )}
      {households.map((h) => {
        const data = byHousehold[h._id] || { meters: [], readings: {}, alerts: [] };
        const openAlertCount = data.alerts.filter((a) => a.status === 'open').length;
        return (
          <div key={h._id} className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setExpanded((prev) => ({ ...prev, [h._id]: !prev[h._id] }))}>
              <h3 style={{ margin: 0 }}>{h.name}</h3>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span className="muted">{expanded[h._id] ? 'Hide' : 'Show'} details</span>
              </div>
            </div>
            <div className="grid" style={{ marginTop: 12 }}>
              <StatCard label="Meters" value={data.meters.length} />
              <StatCard label="Open Alerts" value={openAlertCount} />
            </div>
            {expanded[h._id] && (
              <>
                <div className="row">
                  {data.meters.map((m) => {
                    const r = data.readings[m._id] || [];
                    const labels = r.map((d) => new Date(d.recordedAt).toLocaleDateString());
                    const vals = r.map((d) => d.value);
                    return <div className="col" key={m._id}><ChartCard title={`${m.label} (${m.unit})`} labels={labels} data={vals} /></div>;
                  })}
                </div>
                {data.alerts.length > 0 && (
                  <div className="muted">
                    Alerts:
                    <ul>
                      {data.alerts.map((a) => (
                        <li key={a._id}><span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(a.message || '') }} /></li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
