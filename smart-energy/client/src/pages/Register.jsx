import React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import api from '../api/http.js';
import FormField from '../components/FormField.jsx';

const schema = yup.object({
  username: yup.string().required('Username required').min(3).max(32).matches(/^[a-z0-9._-]+$/, 'Invalid format'), // [REQ:Validation:presence] [REQ:Validation:range] [REQ:Validation:format]
  email: yup.string().email('Valid email required').required('Email required'), // [REQ:Validation:format]
  password: yup.string().min(8, 'Min 8 chars').required('Password required'), // [REQ:Validation:range]
});

export default function Register() {
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm();

  async function onSubmit(values) {
    try {
      await schema.validate(values, { abortEarly: false }); // mirror backend validation
    } catch (e) {
      e.inner?.forEach((x) => setError(x.path, { message: x.message }));
      return;
    }
    try {
      const r = await api.post('/auth/register', values);
      localStorage.setItem('token', r.data.token);
      localStorage.setItem('role', r.data.user.role);
      window.location.hash = '#/dashboard';
    } catch (e) {
      setError('root', { message: e.message });
    }
  }

  return (
    <div className="card">
      <h2>Create account</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField label="Username" name="username" register={register} errors={errors} />
        <FormField label="Email" name="email" type="email" register={register} errors={errors} />
        <FormField label="Password" name="password" type="password" register={register} errors={errors} />
        {errors.root && <div className="error">{errors.root.message}</div>}
        <button disabled={isSubmitting}>Register</button>
      </form>
      <div className="muted">Already have an account? <a href="#/login">Login</a></div>
    </div>
  );
}
