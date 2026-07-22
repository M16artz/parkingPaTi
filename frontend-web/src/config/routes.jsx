import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginView } from '../views/auth/LoginView';
import { HomeView } from '../views/auth/HomeView';
import { RegisterView } from '../views/auth/RegisterView';
import { VerifyEmailView } from '../views/auth/VerifyEmailView';
import { OnboardingView } from '../views/owner/OnboardingView';
import { AdminRoute } from '../views/components/admin/AdminRoute';
import { AdminDashboardView } from '../views/admin/AdminDashboardView';
import { OwnerRoute } from '../views/components/owner/OwnerRoute';
import { OnboardingRoute } from '../views/components/owner/OnboardingRoute';
import { OwnerConfigurationView } from '../views/owner/OwnerConfigurationView';
import { OwnerDashboardView } from '../views/owner/OwnerDashboardView';
import { GhostDashboard } from '../views/public/GhostDashboard';

export const router = createBrowserRouter([
  // 🌐 RUTAS PÚBLICAS
  { path: '/', element: <HomeView /> },
  { path: '/home', element: <Navigate to="/" replace /> },
  { path: '/parqueaderos', element: <GhostDashboard /> },
  { path: '/parkings', element: <Navigate to="/parqueaderos" replace /> },
  { path: '/login', element: <LoginView /> },
  { path: '/register', element: <RegisterView /> },
  { path: '/verify-email', element: <VerifyEmailView /> },

  // 🛡️ RUTAS PROTEGIDAS

  // Onboarding (Propietarios pendientes de registro)
  {
    element: <OnboardingRoute />,
    children: [
      { path: '/owner/onboarding', element: <OnboardingView /> },
    ],
  },

  // Panel de Propietario
  {
    element: <OwnerRoute />,
    children: [
      { path: '/owner/dashboard', element: <OwnerDashboardView /> },
      { path: '/owner/configuration', element: <OwnerConfigurationView /> },
    ],
  },

  // Panel de Administración
  {
    element: <AdminRoute />,
    children: [
      { path: '/admin', element: <AdminDashboardView /> },
      { path: '/admin/dashboard', element: <AdminDashboardView /> },
    ],
  },

  // 🔄 REDIRECCIÓN RUTAS INEXISTENTES
  { path: '*', element: <Navigate to="/" replace /> },
]);