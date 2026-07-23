import React, { ReactNode } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../platform/authentication';
import { NavigationLoading } from './NavigationLoading';
import { ROUTES } from './routes';

export type AuthGuardProps = Readonly<{
  children: ReactNode;
}>;

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <NavigationLoading />;
  }

  if (!user) {
    return <Redirect href={ROUTES.AUTH} />;
  }

  return <>{children}</>;
}
