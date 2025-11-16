import React, { useEffect, useMemo, useState } from 'react';
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
  const [householdId, setHouseholdId] = useState('');
  const [goals, setGoals] = useState([]);
  const [meters, setMeters] = useState([]);
  const [editingGoal, setEditingGoal] = useState(null);
  const { register, handleSubmit, setError, reset, setValue, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    api.get('/households/mine').then((r) => {
      const hs = r.data.households || [];
      setHouseholds(hs);
      if (hs[0]) setHouseholdId(hs[0]._id);
    });
  }, []);

  useEffect(() => { if (householdId) loadHouseholdContext(householdId); }, [householdId]);
  useEffect(() => { if (householdId) setValue('householdId', householdId); }, [householdId, setValue]);

  async function loadHouseholdContext(hid) {
    setGoals([]); // reset to avoid mixing while loading
    setMeters([]);
    const [gRes, mRes] = await Promise.all([
      api.get('/goals', { params: { householdId: hid } }),
      api.get('/meters', { params: { householdId: hid } }),
    ]);
    setGoals(gRes.data.goals || []);
    setMeters(mRes.data.meters || []);
  }

  async function onSubmit(values) {
    try {
      await schema.validate(values, { abortEarly: false });
    } catch (e) {
      e.inner?.forEach((x) => setError(x.path, { message: x.message }));
      return;
    }
    try {
      if (editingGoal) {
        await api.patch(`/goals/${editingGoal._id}`, values);
      } else {
        await api.post('/goals', values);
      }
      reset();
      setValue('householdId', householdId);
      setEditingGoal(null);
      await loadHouseholdContext(values.householdId);
    } catch (e) {
      setError('root', { message: e.message }); // [REQ:Errors:userFriendly]
    }
  }

  function startEdit(goal) {
    setEditingGoal(goal);
    setValue('householdId', householdId);
    setValue('meterType', goal.meterType);
    setValue('period', goal.period);
    setValue('limit', goal.limit);
  }

  return (
    <div className="row">
      <div className="col card">
        <h3>Create Goal</h3>
        <div>
          <label>Household</label>
          <select value={householdId} onChange={(e) => setHouseholdId(e.target.value)}>
            {households.map((h) => <option key={h._id} value={h._id}>{h.name}</option>)}
          </select>
        </div>

        {meters.length === 0 ? (
          <div className="muted" style={{ marginTop: 12 }}>Create a meter for this household first to set goals.</div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* keep form in sync with selected household */}
            {/** Note: react-hook-form prefers setValue over value binding with register */}
            {/** ensure hidden field reflects current household */}
            <input type="hidden" {...register('householdId')} />

            <label>Meter Type</label>
            <select {...register('meterType')} defaultValue={meters.find(Boolean)?.type}>
              {[...new Set(meters.map((m) => m.type))].map((t) => (
                <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>
              ))}
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
            <div style={{ display: 'flex', gap: 8 }}>
              <button disabled={isSubmitting}>{editingGoal ? 'Update Goal' : 'Save'}</button>
              {editingGoal && (
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setEditingGoal(null);
                    setValue('householdId', householdId);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      <div className="col card">
        <h3>Existing Goals</h3>
        <ul>
          {goals.map((g) => (
            <li key={g._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <span>{g.period} {g.meterType} limit: {g.limit}</span>
              <button type="button" onClick={() => startEdit(g)}>Edit</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
