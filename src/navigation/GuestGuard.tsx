import React, { ReactNode } from 'react';
import { Redirect } from 'expo-router';
import { useAppAuth as useAuth } from '../features/auth/presentation/hooks/useAppAuth';
import { NavigationLoading } from './NavigationLoading';
import { ROUTES } from './routes';

export type GuestGuardProps = Readonly<{
  children: ReactNode;
}>;

export function GuestGuard({ children }: GuestGuardProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <NavigationLoading />;
  }

  if (user) {
    return <Redirect href={ROUTES.HOME} />;
  }

  return <>{children}</>;
}
