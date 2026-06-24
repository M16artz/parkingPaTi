import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginView } from '../views/auth/LoginView';
import { HomeView } from '../views/auth/HomeView';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginView />,
  },
  {
    path: '/home',
    element: <HomeView />,
  },
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '*',
    element: (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-xl font-bold text-danger">404 - Page Not Found</h1>
      </div>
    ),
  },
]);