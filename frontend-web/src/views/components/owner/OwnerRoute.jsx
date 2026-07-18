import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { authService } from '../../../services/authService';
import { redireccionRutaPropietario } from '../../../utils/adminAccess';

export const OwnerRoute = () => {
  const location = useLocation();
  const session = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.me,
    retry: false,
    staleTime: 30_000,
  });
  if (session.isPending) return <main className="min-h-screen grid place-items-center">Validando sesión...</main>;
  if (session.isError) return <Navigate to="/login" replace />;
  if (session.data.rol !== 'PROPIETARIO') return <Navigate to="/admin/applications" replace />;
  const redireccion = redireccionRutaPropietario(session.data, location.pathname);
  if (redireccion) return <Navigate to={redireccion} replace />;
  return <Outlet />;
};
