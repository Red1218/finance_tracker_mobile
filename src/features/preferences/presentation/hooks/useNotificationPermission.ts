import { useState, useEffect, useCallback } from 'react';
import { Linking } from 'react-native';
import { PermissionStatus } from '../../application/ports/INotificationPermissionPort';
import { PreferencesController } from '../controllers/PreferencesController';

export function useNotificationPermission(controller?: PreferencesController) {
  const [permissionState, setPermissionState] = useState<PermissionStatus>('NOT_REQUESTED');

  const checkPermission = useCallback(async () => {
    if (!controller) return;
    try {
      const status = await controller.checkNotificationPermission();
      setPermissionState(status);
    } catch {
      setPermissionState('NOT_REQUESTED');
    }
  }, [controller]);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  const requestPermission = useCallback(async () => {
    if (!controller) return 'DENIED';
    try {
      const status = await controller.requestNotificationPermission();
      setPermissionState(status);
      return status;
    } catch {
      setPermissionState('DENIED');
      return 'DENIED' as PermissionStatus;
    }
  }, [controller]);

  const openSystemSettings = useCallback(async () => {
    try {
      await Linking.openSettings();
    } catch {
      // Fallback for environment without linking
    }
  }, []);

  return {
    permissionState,
    checkPermission,
    requestPermission,
    openSystemSettings,
  };
}
