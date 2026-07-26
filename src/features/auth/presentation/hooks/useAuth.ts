import { useState, useEffect, useCallback } from 'react';
import { AuthController, AuthState } from '../controllers/AuthController';
import { AuthCredentials } from '../../application';

export function useAuth(controller: AuthController) {
  const [state, setState] = useState<AuthState>(controller.getState());

  useEffect(() => {
    const unsubscribe = controller.subscribe(setState);
    return () => unsubscribe();
  }, [controller]);

  const login = useCallback(
    async (credentials: AuthCredentials) => {
      return controller.login(credentials);
    },
    [controller]
  );

  const logout = useCallback(async () => {
    return controller.logout();
  }, [controller]);

  const restoreSession = useCallback(async () => {
    return controller.restoreSession();
  }, [controller]);

  const refreshSession = useCallback(async () => {
    return controller.refreshSession();
  }, [controller]);

  return {
    viewModel: state.viewModel,
    isLoading: state.isLoading,
    error: state.error,
    login,
    logout,
    restoreSession,
    refreshSession,
  };
}
