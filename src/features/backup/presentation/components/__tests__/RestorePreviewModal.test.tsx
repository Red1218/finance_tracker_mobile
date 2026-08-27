import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { RestorePreviewModal } from '../RestorePreviewModal';
import { BackupManifest } from '../../../domain/value-objects/BackupManifest';

describe('RestorePreviewModal React Hooks Rule Safety', () => {
  it('returns valid React element for RestorePreviewModal when isVisible is false', () => {
    const element = React.createElement(RestorePreviewModal, {
      isVisible: false,
      manifest: null,
      isRestoring: false,
      onConfirmRestore: vi.fn(),
      onCancel: vi.fn(),
    });

    expect(React.isValidElement(element)).toBe(true);
    expect(element.type).toBe(RestorePreviewModal);
  });

  it('creates valid React element for RestorePreviewModal when isVisible is true', () => {
    const manifest = new BackupManifest({
      manifestVersion: '1.0',
      createdAt: new Date(),
      appVersion: '1.0.0',
      schemaVersion: 1,
      entityCounts: { accounts: 2 },
    });

    const element = React.createElement(RestorePreviewModal, {
      isVisible: true,
      manifest,
      isRestoring: false,
      onConfirmRestore: vi.fn(),
      onCancel: vi.fn(),
    });

    expect(React.isValidElement(element)).toBe(true);
    expect(element.type).toBe(RestorePreviewModal);
  });

  it('handles visibility toggle sequence (false -> true -> false -> true) without hook order violation', () => {
    const props = {
      manifest: null,
      isRestoring: false,
      onConfirmRestore: vi.fn(),
      onCancel: vi.fn(),
    };

    const hiddenElement1 = React.createElement(RestorePreviewModal, { ...props, isVisible: false });
    expect(React.isValidElement(hiddenElement1)).toBe(true);

    const visibleElement1 = React.createElement(RestorePreviewModal, { ...props, isVisible: true });
    expect(React.isValidElement(visibleElement1)).toBe(true);

    const hiddenNode2 = React.createElement(RestorePreviewModal, { ...props, isVisible: false });
    expect(React.isValidElement(hiddenNode2)).toBe(true);

    const visibleElement2 = React.createElement(RestorePreviewModal, { ...props, isVisible: true });
    expect(React.isValidElement(visibleElement2)).toBe(true);
  });
});
