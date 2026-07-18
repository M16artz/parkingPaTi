import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export const useLogoutController = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return async () => {
    // Detiene polling y elimina datos privados antes de abandonar el módulo.
    queryClient.clear();
    try {
      await authService.logout();
    } finally {
      queryClient.clear();
      navigate('/login', { replace: true });
    }
  };
};
