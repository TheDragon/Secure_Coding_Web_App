import React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import api from '../api/http.js';
import FormField from '../components/FormField.jsx';

const schema = yup.object({ email: yup.string().email('Valid email required').required('Email required') });

export default function ForgotPassword() {
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm();
  async function onSubmit(values) {
    try {
      await schema.validate(values, { abortEarly: false });
    } catch (e) {
      e.inner?.forEach((x) => setError(x.path, { message: x.message }));
      return;
    }
    try {
      await api.post('/auth/forgot-password', values);
      alert('If the account exists, we sent a reset email.');
      window.location.hash = '#/reset';
    } catch (e) {
      setError('root', { message: e.message });
    }
  }
  return (
    <div className="card">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField label="Email" name="email" type="email" register={register} errors={errors} />
        {errors.root && <div className="error">{errors.root.message}</div>}
        <button disabled={isSubmitting}>Send reset link</button>
      </form>
    </div>
  );
}
