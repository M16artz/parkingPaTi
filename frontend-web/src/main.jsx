import React from 'react';
import 'leaflet/dist/leaflet.css';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './config/routes.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* RouterProvider replaces <App /> to manage all pages dynamically */}
    <RouterProvider router={router} />
  </React.StrictMode>
);