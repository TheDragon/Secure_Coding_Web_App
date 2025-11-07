import React from 'react';

export default function FormField({ label, name, register, type = 'text', errors, ...rest }) {
  return (
    <div>
      <label htmlFor={name}>{label}</label>
      <input id={name} type={type} {...register(name)} {...rest} />
      {errors?.[name] && <div className="error">{errors[name].message}</div>}
    </div>
  );
}
