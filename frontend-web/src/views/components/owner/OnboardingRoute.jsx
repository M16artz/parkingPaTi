import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../../../services/authService';
import { destinoSesion, esSesionAdministradora } from '../../../utils/adminAccess';

export const OnboardingRoute = () => {
  const session = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.me,
    retry: false,
  });

  if (session.isPending) {
    return <main className="min-h-screen grid place-items-center">Validando sesión...</main>;
  }
  if (session.isError) return <Navigate to="/login" replace />;
  if (esSesionAdministradora(session.data)) return <Navigate to="/admin/applications" replace />;
  if (['CONFIGURACION_PENDIENTE', 'ACTIVO'].includes(session.data.onboarding_estado)) {
    return <Navigate to={destinoSesion(session.data)} replace />;
  }
  return <Outlet />;
};
