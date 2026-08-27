import { useEffect, useState, type ReactNode } from 'react';
import { authModule as defaultAuthModule, type AuthModule } from '../features/auth/composition/AuthModule';

export type AuthSessionProviderProps = Readonly<{
  children: ReactNode;
  authModule?: AuthModule;
}>;

export async function restoreAuthSession(authModule: AuthModule): Promise<void> {
  await authModule.authController.restoreSession();
}

/**
 * Hydrates the presentation auth state from the provider's persisted session
 * before any navigation guard is allowed to evaluate it.
 */
export function AuthSessionProvider({
  children,
  authModule = defaultAuthModule,
}: AuthSessionProviderProps) {
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      await restoreAuthSession(authModule);

      if (isMounted) {
        setIsRestored(true);
      }
    }

    void restoreSession();

    return () => {
      isMounted = false;
    };
  }, [authModule]);

  if (!isRestored) {
    return null;
  }

  return <>{children}</>;
}
