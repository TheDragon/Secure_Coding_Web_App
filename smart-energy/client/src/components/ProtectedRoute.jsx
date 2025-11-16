import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ roles = ['user', 'admin'], children, loading: externalLoading }) {
  const { user, loading } = useAuth();
  const isLoading = typeof externalLoading === 'boolean' ? externalLoading : loading;
  if (isLoading) {
    return <div className="card">Checking session...</div>;
  }
  if (!user) {
    return <div className="card">Please login to continue. {/* [REQ:Auth:jwtRoleSession] */}</div>;
  }
  if (!roles.includes(user.role)) {
    return <div className="card">You do not have access. {/* [REQ:Auth:userRoles] [REQ:Auth:permissionCheck] */}</div>;
  }
  return children;
}
