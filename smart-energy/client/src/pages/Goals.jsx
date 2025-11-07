import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import api from '../api/http.js';

const schema = yup.object({
  householdId: yup.string().required('Household required'),
  meterType: yup.string().oneOf(['electricity', 'water']).required('Type required'),
  period: yup.string().oneOf(['daily', 'weekly', 'monthly']).required('Period required'),
  limit: yup.number().typeError('Number required').moreThan(0, '> 0').required('Limit required'), // [REQ:Validation:numeric] [REQ:Validation:range]
});

export default function Goals() {
  const [households, setHouseholds] = useState([]);
  const [goals, setGoals] = useState([]);
  const { register, handleSubmit, setError, reset, watch, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => { api.get('/households/mine').then((r) => setHouseholds(r.data.households || [])); }, []);
  useEffect(() => { if (households[0]) loadGoals(households[0]._id); }, [households]);

  async function loadGoals(householdId) {
    const r = await api.get('/goals', { params: { householdId } });
    setGoals(r.data.goals || []);
  }

  async function onSubmit(values) {
    try {
      await schema.validate(values, { abortEarly: false });
    } catch (e) {
      e.inner?.forEach((x) => setError(x.path, { message: x.message }));
      return;
    }
    try {
      await api.post('/goals', values);
      reset();
      await loadGoals(values.householdId);
    } catch (e) {
      setError('root', { message: e.message }); // [REQ:Errors:userFriendly]
    }
  }

  return (
    <div className="row">
      <div className="col card">
        <h3>Create Goal</h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Household</label>
          <select {...register('householdId')}>
            <option value="">Select</option>
            {households.map((h) => <option key={h._id} value={h._id}>{h.name}</option>)}
          </select>
          {errors.householdId && <div className="error">{errors.householdId.message}</div>}

          <label>Meter Type</label>
          <select {...register('meterType')}>
            <option value="electricity">Electricity</option>
            <option value="water">Water</option>
          </select>
          {errors.meterType && <div className="error">{errors.meterType.message}</div>}

          <label>Period</label>
          <select {...register('period')}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          {errors.period && <div className="error">{errors.period.message}</div>}

          <label>Limit</label>
          <input type="number" step="0.0001" {...register('limit')} />
          {errors.limit && <div className="error">{errors.limit.message}</div>}

          {errors.root && <div className="error">{errors.root.message}</div>}
          <button disabled={isSubmitting}>Save</button>
        </form>
      </div>

      <div className="col card">
        <h3>Existing Goals</h3>
        <ul>
          {goals.map((g) => (
            <li key={g._id}>{g.period} {g.meterType} limit: {g.limit}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
