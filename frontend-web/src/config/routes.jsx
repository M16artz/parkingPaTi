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
import { OwnerConfigurationView } from '../views/owner/OwnerConfigurationView';
import { PublicParkingsView } from '../views/public/PublicParkingsView';

export const router = createBrowserRouter([
  { path: '/home', element: <HomeView /> },
  { path: '/parkings', element: <PublicParkingsView /> },
  { path: '/login', element: <LoginView /> },
  { path: '/register', element: <RegisterView /> },
  { path: '/verify-email', element: <VerifyEmailView /> },
  { path: '/owner/onboarding', element: <OnboardingView /> },
  {
    element: <OwnerRoute />,
    children: [
      { path: '/owner/configuration', element: <OwnerConfigurationView /> },
      { path: '/owner/dashboard', element: <Navigate to="/owner/configuration" replace /> },
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
  
  // CORRECCIÓN: Agregamos la ruta para tu nuevo Dashboard aquí abajo
  
  { path: '/', element: <Navigate to="/parkings" replace /> },
  {
    path: '*',
    element: (
      <div className="min-h-screen flex items-center justify-center bg-sky-50">
        <h1 className="text-xl font-bold text-slate-700">404 - Página No Encontrada</h1>
      </div>
    ),
  },
]);
