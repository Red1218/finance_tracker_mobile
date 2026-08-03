import React from 'react';
import { LoginScreen } from '../src/features/auth/presentation/screens/LoginScreen';
import { GuestGuard } from '../src/navigation/GuestGuard';

export default function AuthRoute() {
  return (
    <GuestGuard>
      <LoginScreen />
    </GuestGuard>
  );
}
