import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import api from '../api/http.js';
import { useAuth } from '../context/AuthContext.jsx';

const adminSchema = yup.object({
  name: yup.string().required('Name required'), // [REQ:Validation:presence]
  residentName: yup.string().required('Resident name required'),
  residentEmail: yup.string().email('Valid email required').required('Resident email required'),
  address: yup.string().nullable(),
});
const meterSchema = yup.object({
  householdId: yup.string().required('Household required'), // [REQ:Validation:presence]
  type: yup.string().oneOf(['electricity', 'water']).required('Type required'), // [REQ:Validation:presence]
  unit: yup.string().oneOf(['kWh', 'L']).required('Unit required'), // [REQ:Validation:presence]
  label: yup.string().required('Label required'), // [REQ:Validation:presence]
});

export default function Household() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [households, setHouseholds] = useState([]);
  const validationSchema = useMemo(() => adminSchema, []);
  const { register, handleSubmit, setError, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { name: '', address: '', residentName: '', residentEmail: '' },
  });
  const { register: registerMeter, handleSubmit: handleSubmitMeter, setError: setMeterError, reset: resetMeter, watch: watchMeter, setValue: setMeterValue, formState: { errors: meterErrors, isSubmitting: isSubmittingMeter } } = useForm({ defaultValues: { type: 'electricity', unit: 'kWh' } });

  async function load() {
    const r = await api.get('/households/mine');
    setHouseholds(r.data.households || []);
  }

  useEffect(() => { load(); }, []);

  // Sync unit with type to avoid invalid combos
  const meterType = watchMeter('type');
  useEffect(() => {
    if (meterType === 'electricity') setMeterValue('unit', 'kWh');
    if (meterType === 'water') setMeterValue('unit', 'L');
  }, [meterType, setMeterValue]);

  async function onSubmit(values) {
    try {
      await validationSchema.validate(values, { abortEarly: false });
    } catch (e) {
      e.inner?.forEach((x) => setError(x.path, { message: x.message }));
      return;
    }
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
        {isAdmin ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <label>Name</label>
            <input {...register('name')} />
            {errors.name && <div className="error">{errors.name.message}</div>}

            <label>Address</label>
            <input {...register('address')} />

            <label>Resident Name</label>
            <input {...register('residentName')} />
            {errors.residentName && <div className="error">{errors.residentName.message}</div>}

            <label>Resident Email</label>
            <input type="email" {...register('residentEmail')} />
            {errors.residentEmail && <div className="error">{errors.residentEmail.message}</div>}

            <div className="muted">A household user account will be created automatically and temporary credentials will be emailed to the resident.</div>

            {errors.root && <div className="error">{errors.root.message}</div>}
            <button disabled={isSubmitting}>Save</button>
          </form>
        ) : (
          <div className="muted">Households are created by administrators. You can manage the households assigned to you below.</div>
        )}
      </div>
      <div className="col card">
        <h3>My Households</h3>
        <ul>
          {households.map((h) => (
            <li key={h._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <span>{h.name}</span>
              {isAdmin && (
                <button
                  type="button"
                  onClick={async () => {
                    if (!window.confirm('Delete this household?')) return;
                    try {
                      await api.delete(`/households/${h._id}`);
                      await load();
                    } catch (err) {
                      alert(err.message);
                    }
                  }}
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
      {isAdmin && (
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
            <select {...registerMeter('type')}>
              <option value="electricity">Electricity</option>
              <option value="water">Water</option>
            </select>
            {meterErrors.type && <div className="error">{meterErrors.type.message}</div>}

            <label>Unit</label>
            <select {...registerMeter('unit')} disabled>
              {meterType === 'electricity' && <option value="kWh">kWh</option>}
              {meterType === 'water' && <option value="L">L</option>}
            </select>
            {meterErrors.unit && <div className="error">{meterErrors.unit.message}</div>}

            <label>Label</label>
            <input {...registerMeter('label')} placeholder="e.g., Main Electricity" />
            {meterErrors.label && <div className="error">{meterErrors.label.message}</div>}

            {meterErrors.root && <div className="error">{meterErrors.root.message}</div>}
            <button disabled={isSubmittingMeter}>Create</button>
          </form>
        </div>
      )}
    </div>
  );
}
