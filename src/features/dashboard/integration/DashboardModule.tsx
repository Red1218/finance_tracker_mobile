import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { DashboardScreen } from '../presentation/screens/DashboardScreen';
import { DashboardContainer } from './DashboardContainer';
import { DashboardBootstrap } from './DashboardBootstrap';
import { environment } from '../../../config/environment';
import { setupDashboardMock } from './development/DashboardMockAPI';
import { supabase } from '../../../database';
import type { DashboardFacade } from '../application/facade/DashboardFacade';

interface DashboardModuleProps {
  userId: string;
  enableMockData?: boolean;
  userAvatarUrl?: string;
  userEmail?: string;
  onAvatarPress?: () => void;
  onNotificationsPress?: () => void;
  onNavigateToSpends?: () => void;
  onNavigateToBudgets?: () => void;
  onNavigateToCreateTransaction?: () => void;
}

/**
 * The public entry point for the Dashboard feature.
 * Lazily bootstraps the Dashboard dependency graph (idempotent) and
 * renders the DashboardScreen once the facade is ready.
 */
export function DashboardModule({
  userId,
  enableMockData,
  userAvatarUrl,
  userEmail,
  onAvatarPress,
  onNotificationsPress,
  onNavigateToSpends,
  onNavigateToBudgets,
  onNavigateToCreateTransaction,
}: DashboardModuleProps) {
  const [facade, setFacade] = useState<DashboardFacade | null>(null);

  useEffect(() => {
    let cancelled = false;
    const isDev = process.env.NODE_ENV !== 'production';
    const shouldUseMockData = isDev && (enableMockData ?? false);

    if (shouldUseMockData) {
      setupDashboardMock();
    }

    DashboardBootstrap.initialize({
      supabaseClient: supabase,
      apiBaseUrl: environment.supabaseUrl
    }).then(() => {
      if (!cancelled) {
        setFacade(DashboardContainer.getFacade());
      }
    });
    return () => { cancelled = true; };
  }, []);

  if (!facade) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <DashboardScreen
      userId={userId}
      facade={facade}
      userAvatarUrl={userAvatarUrl}
      userEmail={userEmail}
      onAvatarPress={onAvatarPress}
      onNotificationsPress={onNotificationsPress}
      onNavigateToSpends={onNavigateToSpends}
      onNavigateToBudgets={onNavigateToBudgets}
      onNavigateToCreateTransaction={onNavigateToCreateTransaction}
    />
  );
}
