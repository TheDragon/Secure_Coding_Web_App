import React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import api from '../api/http.js';
import FormField from '../components/FormField.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const schema = yup.object({
  email: yup.string().email('Valid email required').required('Email required'),
  password: yup.string().required('Password required'),
});

export default function Login() {
  const { setAuthState } = useAuth();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm();

  async function onSubmit(values) {
    try {
      await schema.validate(values, { abortEarly: false });
    } catch (e) {
      e.inner?.forEach((x) => setError(x.path, { message: x.message }));
      return;
    }
    try {
      const r = await api.post('/auth/login', values);
      setAuthState({ token: r.data.token, user: r.data.user });
      window.location.hash = '#/dashboard';
    } catch (e) {
      setError('root', { message: e.message });
    }
  }

  return (
    <div className="card">
      <h2>Login</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField label="Email" name="email" type="email" register={register} errors={errors} />
        <FormField label="Password" name="password" type="password" register={register} errors={errors} />
        {errors.root && <div className="error">{errors.root.message}</div>}
        <button disabled={isSubmitting}>Login</button>
      </form>
      <div className="muted"><a href="#/forgot">Forgot password?</a></div>
    </div>
  );
}
