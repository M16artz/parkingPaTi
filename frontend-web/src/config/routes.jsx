import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginView } from '../views/auth/LoginView';
import { HomeView } from '../views/auth/HomeView';
// Importa el componente RegisterView desde el archivo RegisterView
import { RegisterView } from '../views/auth/RegisterView'; 

export const router = createBrowserRouter([
  { path: '/home', element: <HomeView /> },
  { path: '/login', element: <LoginView /> },
  { path: '/register', element: <RegisterView /> },
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