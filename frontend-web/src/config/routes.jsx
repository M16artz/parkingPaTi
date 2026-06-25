import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginView } from '../views/auth/LoginView';
import { HomeView } from '../views/auth/HomeView';
import { OwnerDashboardView } from '../views/owner/OwnerDashboardView';
import { RegisterView } from '../views/auth/RegisterView'; 

export const router = createBrowserRouter([
  { path: '/home', element: <HomeView /> },
  { path: '/login', element: <LoginView /> },
  { path: '/register', element: <RegisterView /> },
  
  // CORRECCIÓN: Agregamos la ruta para tu nuevo Dashboard aquí abajo
  { path: '/owner/dashboard', element: <OwnerDashboardView /> },
  
  { path: '/', element: <Navigate to="/home" replace /> },
  {
    path: '*',
    element: (
      <div className="min-h-screen flex items-center justify-center bg-sky-50">
        <h1 className="text-xl font-bold text-slate-700">404 - Página No Encontrada</h1>
      </div>
    ),
  },
]);