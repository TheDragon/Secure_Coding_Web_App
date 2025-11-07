import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import api from '../api/http.js';
import FormField from '../components/FormField.jsx';

const schema = yup.object({ email: yup.string().email('Valid email required').required('Email required') });

export default function ForgotPassword() {
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm();
  const [sentInfo, setSentInfo] = useState(null);
  async function onSubmit(values) {
    try {
      await schema.validate(values, { abortEarly: false });
    } catch (e) {
      e.inner?.forEach((x) => setError(x.path, { message: x.message }));
      return;
    }
    try {
      const r = await api.post('/auth/forgot-password', values);
      localStorage.setItem('resetEmail', values.email);
      setSentInfo({ email: values.email, message: r?.data?.message || 'Email sent.' });
    } catch (e) {
      setError('root', { message: e.message });
    }
  }
  return (
    <div className="card">
      <h2>Forgot Password</h2>
      {sentInfo ? (
        <div>
          <p>{sentInfo.message}</p>
          <p className="muted">To: {sentInfo.email}</p>
          <button onClick={() => (window.location.hash = '#/reset')}>Continue to Reset</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormField label="Email" name="email" type="email" register={register} errors={errors} />
          {errors.root && <div className="error">{errors.root.message}</div>}
          <button disabled={isSubmitting}>Send reset link</button>
        </form>
      )}
    </div>
  );
}
