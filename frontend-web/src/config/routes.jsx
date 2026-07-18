import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginView } from '../views/auth/LoginView';
import { HomeView } from '../views/auth/HomeView';
import { RegisterView } from '../views/auth/RegisterView';
import { VerifyEmailView } from '../views/auth/VerifyEmailView';
import { OnboardingView } from '../views/owner/OnboardingView';
import { AdminRoute } from '../views/components/admin/AdminRoute';
import { AdminLayout } from '../views/admin/AdminLayout';
import { AdminApplicationsView } from '../views/admin/AdminApplicationsView';
import { AdminApplicationDetailView } from '../views/admin/AdminApplicationDetailView';
import { AdminAccountsView } from '../views/admin/AdminAccountsView';
import { OwnerRoute } from '../views/components/owner/OwnerRoute';
import { OnboardingRoute } from '../views/components/owner/OnboardingRoute';
import { OwnerConfigurationView } from '../views/owner/OwnerConfigurationView';
import { OwnerDashboardView } from '../views/owner/OwnerDashboardView';
import { GhostDashboard } from '../views/public/GhostDashboard';

export const router = createBrowserRouter([
  { path: '/', element: <HomeView /> },
  { path: '/home', element: <Navigate to="/" replace /> },
  { path: '/parqueaderos', element: <GhostDashboard /> },
  { path: '/parkings', element: <Navigate to="/parqueaderos" replace /> },
  { path: '/login', element: <LoginView /> },
  { path: '/register', element: <RegisterView /> },
  { path: '/verify-email', element: <VerifyEmailView /> },
  {
    element: <OnboardingRoute />,
    children: [{ path: '/owner/onboarding', element: <OnboardingView /> }],
  },
  {
    element: <OwnerRoute />,
    children: [
      { path: '/owner/configuration', element: <OwnerConfigurationView /> },
      { path: '/owner/dashboard', element: <OwnerDashboardView /> },
    ],
  },
  {
    element: <AdminRoute />,
    children: [{
      element: <AdminLayout />,
      children: [
        { path: '/admin/applications', element: <AdminApplicationsView /> },
        { path: '/admin/applications/:cuentaId', element: <AdminApplicationDetailView /> },
        { path: '/admin/accounts', element: <AdminAccountsView /> },
      ],
    }],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
