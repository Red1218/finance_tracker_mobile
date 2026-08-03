import { useSyncExternalStore, useCallback } from 'react';
import { authModule } from '../../composition/AuthModule';
import { AuthCredentials } from '../../application';

export function useAppAuth() {
  const controller = authModule.authController;

  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot
  );

  const login = useCallback(
    async (credentials: AuthCredentials) => {
      return controller.login(credentials);
    },
    [controller]
  );

  const logout = useCallback(async () => {
    return controller.logout();
  }, [controller]);

  return {
    // Maps exactly to what the router and guards expect
    user: state.viewModel.isAuthenticated 
      ? { id: state.viewModel.userId as string, email: state.viewModel.userEmail as string } 
      : null,
    loading: state.isLoading,
    error: state.error,
    login,
    logout,
  };
}
