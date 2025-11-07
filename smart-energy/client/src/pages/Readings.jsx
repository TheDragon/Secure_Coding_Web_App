import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import api from '../api/http.js';

const schema = yup.object({
  meterId: yup.string().required('Select meter'), // [REQ:Validation:presence]
  value: yup.number().typeError('Must be a number').min(0, '>= 0').required('Value required'), // [REQ:Validation:numeric] [REQ:Validation:range]
  recordedAt: yup.date().required('Date required'),
});

export default function Readings() {
  const [households, setHouseholds] = useState([]);
  const [householdId, setHouseholdId] = useState('');
  const [meters, setMeters] = useState([]);
  const { register, handleSubmit, setError, reset, formState: { errors, isSubmitting } } = useForm({ defaultValues: { recordedAt: new Date().toISOString().slice(0,16) } });

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

  async function onSubmit(values) {
    try {
      await schema.validate(values, { abortEarly: false });
    } catch (e) {
      e.inner?.forEach((x) => setError(x.path, { message: x.message }));
      return;
    }
    try {
      await api.post('/readings', { ...values, recordedAt: new Date(values.recordedAt).toISOString() });
      reset();
      alert('Reading added');
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
          <button disabled={isSubmitting}>Add</button>
        </form>
      )}
    </div>
  );
}
