import React from 'react';
import { useRouter } from 'expo-router';
import { DashboardModule } from '@/src/features/dashboard/integration/DashboardModule';
import { useAppAuth as useAuth } from '@/src/features/auth/presentation/hooks/useAppAuth';

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  
  return (
    <DashboardModule
      userId={user?.id || 'mock-user-123'}
      userEmail={user?.email}
      userAvatarUrl={(user as any)?.user_metadata?.avatar_url}
      onNavigateToSpends={() => router.push('/spends')}
      onNavigateToBudgets={() => router.push('/budgets')}
      onNavigateToCreateTransaction={() => router.push({ pathname: '/spends', params: { openModal: 'true' } })}
    />
  );
}
