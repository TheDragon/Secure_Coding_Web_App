import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import api from '../api/http.js';

const schema = yup.object({
  username: yup.string().optional().matches(/^[a-z0-9._-]+$/, 'Invalid format'), // [REQ:Validation:format]
  email: yup.string().optional().email('Valid email required'), // [REQ:Validation:format]
});

export default function Profile() {
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm();
  const [me, setMe] = useState(null);
  useEffect(() => { api.get('/users/me').then((r) => { setMe(r.data.user); reset({ username: r.data.user.username, email: r.data.user.email }); }); }, [reset]);

  async function onSubmit(values) {
    try { await schema.validate(values, { abortEarly: false }); } catch (e) { e.inner?.forEach((x) => setError(x.path, { message: x.message })); return; }
    try {
      const r = await api.patch('/users/me', values);
      setMe(r.data.user);
      alert('Profile updated');
    } catch (e) {
      setError('root', { message: e.message });
    }
  }

  if (!me) return <div className="card">Loading...</div>;
  return (
    <div className="card">
      <h3>My Profile</h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>Username</label>
        <input {...register('username')} />
        {errors.username && <div className="error">{errors.username.message}</div>}

        <label>Email</label>
        <input type="email" {...register('email')} />
        {errors.email && <div className="error">{errors.email.message}</div>}

        {errors.root && <div className="error">{errors.root.message}</div>}
        <button disabled={isSubmitting}>Save</button>
      </form>
    </div>
  );
}
