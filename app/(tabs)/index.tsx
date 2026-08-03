import React from 'react';
import { DashboardModule } from '@/src/features/dashboard/integration/DashboardModule';
import { useAppAuth as useAuth } from '@/src/features/auth/presentation/hooks/useAppAuth';

export default function DashboardScreen() {
  const { user } = useAuth();
  
  return <DashboardModule userId={user?.id || 'mock-user-123'} />;
}
