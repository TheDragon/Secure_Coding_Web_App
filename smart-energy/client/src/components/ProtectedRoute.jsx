import React from 'react';

export default function ProtectedRoute({ roles = ['user', 'admin'], children }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role') || 'user';
  if (!token) {
    return <div className="card">Please login to continue. {/* [REQ:Auth:jwtRoleSession] */}</div>;
  }
  if (!roles.includes(role)) {
    return <div className="card">You do not have access. {/* [REQ:Auth:userRoles] [REQ:Auth:permissionCheck] */}</div>;
  }
  return children;
}
