import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import api from '../api/http.js';

const schema = yup.object({
  meterId: yup.string().required('Select meter'), // [REQ:Validation:presence]
  value: yup.number().typeError('Must be a number').min(0, '>= 0').required('Value required'), // [REQ:Validation:numeric] [REQ:Validation:range]
  recordedAt: yup.date().required('Date required'),
});

function formatLocalDate(value) {
  if (!value) return '';
  const date = new Date(value);
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

export default function Readings() {
  const [households, setHouseholds] = useState([]);
  const [householdId, setHouseholdId] = useState('');
  const [meters, setMeters] = useState([]);
  const [readings, setReadings] = useState([]);
  const [editingReading, setEditingReading] = useState(null);
  const { register, handleSubmit, setError, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({ defaultValues: { recordedAt: new Date().toISOString().slice(0,16) } });

  useEffect(() => {
    api.get('/households/mine').then((r) => {
      const hs = r.data.households || [];
      setHouseholds(hs);
      if (hs[0]) setHouseholdId(hs[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!householdId) return;
    api.get('/meters', { params: { householdId } }).then((r) => setMeters(r.data.meters || []));
  }, [householdId]);

  const selectedMeterId = watch('meterId');

  useEffect(() => {
    if (!selectedMeterId) {
      setReadings([]);
      setEditingReading(null);
      return;
    }
    loadReadings(selectedMeterId);
  }, [selectedMeterId]);

  async function loadReadings(meterId) {
    const res = await api.get(`/readings/by-meter/${meterId}?limit=20`);
    setReadings(res.data.readings || []);
  }

  async function onSubmit(values) {
    try {
      await schema.validate(values, { abortEarly: false });
    } catch (e) {
      e.inner?.forEach((x) => setError(x.path, { message: x.message }));
      return;
    }
    try {
      const payload = { ...values, recordedAt: new Date(values.recordedAt).toISOString() };
      if (editingReading) {
        await api.patch(`/readings/${editingReading._id}`, payload);
      } else {
        await api.post('/readings', payload);
      }
      reset({ meterId: values.meterId, value: '', recordedAt: new Date().toISOString().slice(0,16) });
      setEditingReading(null);
      await loadReadings(values.meterId);
    } catch (e) {
      setError('root', { message: e.message }); // [REQ:Errors:userFriendly]
    }
  }

  return (
    <div className="card">
      <h3>Add Reading</h3>
      <div>
        <label>Household</label>
        <select value={householdId} onChange={(e) => setHouseholdId(e.target.value)}>
          {households.map((h) => <option key={h._id} value={h._id}>{h.name}</option>)}
        </select>
      </div>
      {meters.length === 0 ? (
        <div className="muted" style={{ marginTop: 12 }}>No meters in this household. Create one first.</div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Meter</label>
          <select {...register('meterId')}>
            <option value="">Select</option>
            {meters.map((m) => <option key={m._id} value={m._id}>{m.label} ({m.unit})</option>)}
          </select>
          {errors.meterId && <div className="error">{errors.meterId.message}</div>}

          <label>Value</label>
          <input type="number" step="0.0001" {...register('value')} />
          {errors.value && <div className="error">{errors.value.message}</div>}

          <label>Recorded At</label>
          <input type="datetime-local" {...register('recordedAt')} />
          {errors.recordedAt && <div className="error">{errors.recordedAt.message}</div>}

          {errors.root && <div className="error">{errors.root.message}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button disabled={isSubmitting}>{editingReading ? 'Update Reading' : 'Add'}</button>
            {editingReading && (
              <button type="button" onClick={() => {
                setEditingReading(null);
                reset({ meterId: selectedMeterId, value: '', recordedAt: new Date().toISOString().slice(0,16) });
              }}>Cancel</button>
            )}
          </div>
        </form>
      )}
      {selectedMeterId && readings.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h4>Recent Readings</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th align="left">Value</th>
                <th align="left">Recorded At</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {readings.map((r) => (
                <tr key={r._id}>
                  <td>{r.value}</td>
                  <td>{new Date(r.recordedAt).toLocaleString()}</td>
                  <td><button type="button" onClick={() => {
                    setEditingReading(r);
                    setValue('meterId', r.meterId);
                    setValue('value', r.value);
                    setValue('recordedAt', formatLocalDate(r.recordedAt));
                  }}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
