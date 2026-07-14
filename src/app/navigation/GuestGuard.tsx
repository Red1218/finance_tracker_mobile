import React, { ReactNode } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../../platform/authentication';
import { NavigationLoading } from './NavigationLoading';
import { ROUTES } from './routes';

export type GuestGuardProps = Readonly<{
  children: ReactNode;
}>;

export function GuestGuard({ children }: GuestGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <NavigationLoading />;
  }

  if (user) {
    return <Redirect href={ROUTES.HOME} />;
  }

  return <>{children}</>;
}
