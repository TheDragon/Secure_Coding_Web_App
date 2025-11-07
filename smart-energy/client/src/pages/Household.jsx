import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import api from '../api/http.js';

const schema = yup.object({ name: yup.string().required('Name required') }); // [REQ:Validation:presence]
const meterSchema = yup.object({
  householdId: yup.string().required('Household required'), // [REQ:Validation:presence]
  type: yup.string().oneOf(['electricity', 'water']).required('Type required'), // [REQ:Validation:presence]
  unit: yup.string().oneOf(['kWh', 'L']).required('Unit required'), // [REQ:Validation:presence]
  label: yup.string().required('Label required'), // [REQ:Validation:presence]
});

export default function Household() {
  const [households, setHouseholds] = useState([]);
  const { register, handleSubmit, setError, reset, formState: { errors, isSubmitting } } = useForm();
  const { register: registerMeter, handleSubmit: handleSubmitMeter, setError: setMeterError, reset: resetMeter, formState: { errors: meterErrors, isSubmitting: isSubmittingMeter } } = useForm();

  async function load() {
    const r = await api.get('/households/mine');
    setHouseholds(r.data.households || []);
  }

  useEffect(() => { load(); }, []);

  async function addDefaultMeters(household) {
    try {
      const defs = [
        { householdId: household._id, type: 'electricity', unit: 'kWh', label: 'Main Electricity' },
        { householdId: household._id, type: 'water', unit: 'L', label: 'Main Water' },
      ];
      const results = await Promise.allSettled(defs.map((d) => api.post('/meters', d)));
      const failures = results.filter((r) => r.status === 'rejected');
      if (failures.length === 0) {
        alert('Default meters added.');
      } else {
        const msg = failures.map((f) => f.reason?.message || 'Failed').join('; ');
        alert('Some meters may already exist or failed: ' + msg); // [REQ:Errors:userFriendly]
      }
    } catch (e) {
      alert('Unable to add default meters: ' + (e.message || 'Error'));
    }
  }

  async function onSubmit(values) {
    try { await schema.validate(values, { abortEarly: false }); } catch (e) { e.inner?.forEach((x) => setError(x.path, { message: x.message })); return; }
    try {
      await api.post('/households', values);
      reset();
      await load();
    } catch (e) { setError('root', { message: e.message }); }
  }

  async function onSubmitMeter(values) {
    try {
      await meterSchema.validate(values, { abortEarly: false });
    } catch (e) {
      e.inner?.forEach((x) => setMeterError(x.path, { message: x.message }));
      return;
    }
    try {
      await api.post('/meters', values);
      resetMeter();
      alert('Meter created');
    } catch (e) {
      setMeterError('root', { message: e.message }); // [REQ:Errors:userFriendly]
    }
  }

  return (
    <div className="row">
      <div className="col card">
        <h3>Create Household</h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Name</label>
          <input {...register('name')} />
          {errors.name && <div className="error">{errors.name.message}</div>}

          <label>Address</label>
          <input {...register('address')} />

          {errors.root && <div className="error">{errors.root.message}</div>}
          <button disabled={isSubmitting}>Save</button>
        </form>
      </div>
      <div className="col card">
        <h3>My Households</h3>
        <ul>
          {households.map((h) => (
            <li key={h._id} style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{h.name}</span>
              <button onClick={() => addDefaultMeters(h)}>Add Default Meters</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="col card">
        <h3>Create Meter</h3>
        <form onSubmit={handleSubmitMeter(onSubmitMeter)}>
          <label>Household</label>
          <select {...registerMeter('householdId')}>
            <option value="">Select</option>
            {households.map((h) => <option key={h._id} value={h._id}>{h.name}</option>)}
          </select>
          {meterErrors.householdId && <div className="error">{meterErrors.householdId.message}</div>}

          <label>Type</label>
          <select {...registerMeter('type')} defaultValue="electricity">
            <option value="electricity">Electricity</option>
            <option value="water">Water</option>
          </select>
          {meterErrors.type && <div className="error">{meterErrors.type.message}</div>}

          <label>Unit</label>
          <select {...registerMeter('unit')} defaultValue="kWh">
            <option value="kWh">kWh</option>
            <option value="L">L</option>
          </select>
          {meterErrors.unit && <div className="error">{meterErrors.unit.message}</div>}

          <label>Label</label>
          <input {...registerMeter('label')} placeholder="e.g., Main Electricity" />
          {meterErrors.label && <div className="error">{meterErrors.label.message}</div>}

          {meterErrors.root && <div className="error">{meterErrors.root.message}</div>}
          <button disabled={isSubmittingMeter}>Create</button>
        </form>
      </div>
    </div>
  );
}
