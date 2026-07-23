import React from 'react';
import { DashboardModule } from '@/src/features/dashboard/integration/DashboardModule';
import { useAuth } from '@/src/platform/authentication';

export default function DashboardScreen() {
  const { user } = useAuth();
  
  return <DashboardModule userId={user?.id || 'mock-user-123'} />;
}
