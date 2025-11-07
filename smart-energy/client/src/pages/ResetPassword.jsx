import React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import api from '../api/http.js';
import FormField from '../components/FormField.jsx';

const schema = yup.object({
  email: yup.string().email('Valid email required').required('Email required'),
  token: yup.string().required('Token required'), // [REQ:Validation:presence]
  password: yup.string().min(8, 'Min 8 chars').required('Password required'), // [REQ:Validation:range]
});

export default function ResetPassword() {
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm();
  async function onSubmit(values) {
    try {
      await schema.validate(values, { abortEarly: false });
    } catch (e) {
      e.inner?.forEach((x) => setError(x.path, { message: x.message }));
      return;
    }
    try {
      await api.post('/auth/reset-password', values);
      alert('Password has been reset.');
      window.location.hash = '#/login';
    } catch (e) {
      setError('root', { message: e.message });
    }
  }
  return (
    <div className="card">
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField label="Email" name="email" type="email" register={register} errors={errors} />
        <FormField label="Token" name="token" register={register} errors={errors} />
        <FormField label="New Password" name="password" type="password" register={register} errors={errors} />
        {errors.root && <div className="error">{errors.root.message}</div>}
        <button disabled={isSubmitting}>Reset</button>
      </form>
    </div>
  );
}
