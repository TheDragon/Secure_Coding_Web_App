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
  const [meters, setMeters] = useState([]);
  const { register, handleSubmit, setError, reset, formState: { errors, isSubmitting } } = useForm({ defaultValues: { recordedAt: new Date().toISOString().slice(0,16) } });

  useEffect(() => {
    api.get('/meters').then((r) => setMeters(r.data.meters || []));
  }, []);

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
    </div>
  );
}
