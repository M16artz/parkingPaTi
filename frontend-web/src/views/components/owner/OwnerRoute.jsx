import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../../../services/authService';

export const OwnerRoute = () => {
  const session = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.me,
    retry: false,
    staleTime: 30_000,
  });
  if (session.isPending) return <main className="min-h-screen grid place-items-center">Validando sesión...</main>;
  if (session.isError) return <Navigate to="/login" replace />;
  if (session.data.rol !== 'PROPIETARIO') return <Navigate to="/admin/applications" replace />;
  if (!['CONFIGURACION_PENDIENTE', 'ACTIVO'].includes(session.data.onboarding_estado)) {
    return <Navigate to="/owner/onboarding" replace />;
  }
  return <Outlet />;
};
