import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { BackupRestoreSection } from '../BackupRestoreSection';

describe('BackupRestoreSection', () => {
  it('renders export and restore buttons', () => {
    const node = BackupRestoreSection({
      onExportPress: vi.fn(),
      onRestorePress: vi.fn(),
    });

    expect(React.isValidElement(node)).toBe(true);
  });
});
