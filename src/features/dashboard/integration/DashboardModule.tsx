import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { DashboardScreen } from '../presentation/screens/DashboardScreen';
import { DashboardContainer } from './DashboardContainer';
import { DashboardBootstrap } from './DashboardBootstrap';
import { environment } from '../../../config/environment';
import { setupDashboardMock } from './development/DashboardMockAPI';
import type { DashboardFacade } from '../application/facade/DashboardFacade';

interface DashboardModuleProps {
  userId: string;
}

/**
 * The public entry point for the Dashboard feature.
 * Lazily bootstraps the Dashboard dependency graph (idempotent) and
 * renders the DashboardScreen once the facade is ready.
 */
export function DashboardModule({ userId }: DashboardModuleProps) {
  const [facade, setFacade] = useState<DashboardFacade | null>(null);

  useEffect(() => {
    let cancelled = false;
    setupDashboardMock();
    DashboardBootstrap.initialize({ apiBaseUrl: 'mock://' }).then(() => {
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

  return <View />;
}


