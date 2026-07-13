import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../../../services/authService';
import { esSesionAdministradora } from '../../../utils/adminAccess';

export const AdminRoute = () => {
  const session = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.me,
    retry: false,
    staleTime: 30_000,
  });

  if (session.isPending) {
    return <main className="min-h-screen grid place-items-center bg-slate-50">Validando sesión...</main>;
  }
  if (session.isError) return <Navigate to="/login" replace />;
  if (!esSesionAdministradora(session.data)) return <Navigate to="/owner/onboarding" replace />;
  return <Outlet />;
};
