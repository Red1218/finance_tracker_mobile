import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { ExportBackupModal } from '../ExportBackupModal';

describe('ExportBackupModal', () => {
  it('creates valid React element for ExportBackupModal', () => {
    const element = React.createElement(ExportBackupModal, {
      isVisible: true,
      isGenerating: false,
      onGenerateExport: vi.fn(),
      onCancel: vi.fn(),
    });

    expect(React.isValidElement(element)).toBe(true);
    expect(element.type).toBe(ExportBackupModal);
  });
});
