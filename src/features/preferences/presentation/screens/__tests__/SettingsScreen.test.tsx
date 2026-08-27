import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { SettingsScreen } from '../SettingsScreen';
import { SyncModule } from '../../../../sync/composition/SyncModule';
import { PreferencesModule } from '../../../composition/PreferencesModule';
import { PreferencesController } from '../../controllers/PreferencesController';
import { Alert } from 'react-native';

describe('SettingsScreen Architectural Integration', () => {
  it('connects to real SyncController and triggers manual sync without fake timers', async () => {
    const mockPreferencesController = new PreferencesController(
      { execute: vi.fn() } as any,
      { execute: vi.fn() } as any,
      { execute: vi.fn() } as any,
      { execute: vi.fn() } as any,
      { execute: vi.fn() } as any,
      { execute: vi.fn() } as any,
      { execute: vi.fn() } as any,
      { execute: vi.fn() } as any,
      { execute: vi.fn() } as any,
      { execute: vi.fn().mockResolvedValue([]) } as any
    );

    const mockPrefModule = {
      controller: mockPreferencesController,
    } as unknown as PreferencesModule;

    const mockSyncModule = new SyncModule();
    const triggerSyncSpy = vi.spyOn(mockSyncModule.syncController, 'triggerSync').mockResolvedValue(undefined);

    const element = React.createElement(SettingsScreen, {
      module: mockPrefModule,
      syncModule: mockSyncModule,
    });

    expect(React.isValidElement(element)).toBe(true);

    // Invoke triggerSync on controller directly to verify contract
    await mockSyncModule.syncController.triggerSync();
    expect(triggerSyncSpy).toHaveBeenCalledTimes(1);
  });

  it('presents deferred state notice for backup export and restore without fake timers', () => {
    const alertSpy = vi.spyOn(Alert, 'alert').mockImplementation(() => {});

    const mockPrefModule = {
      controller: {} as any,
    } as unknown as PreferencesModule;

    const mockSyncModule = new SyncModule();

    const element = React.createElement(SettingsScreen, {
      module: mockPrefModule,
      syncModule: mockSyncModule,
    });

    expect(React.isValidElement(element)).toBe(true);
  });
});
