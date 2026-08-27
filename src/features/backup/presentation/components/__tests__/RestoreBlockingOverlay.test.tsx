import React from 'react';
import { describe, it, expect } from 'vitest';
import { RestoreBlockingOverlay } from '../RestoreBlockingOverlay';

describe('RestoreBlockingOverlay', () => {
  it('returns null when isVisible is false', () => {
    const node = RestoreBlockingOverlay({ isVisible: false });
    expect(node).toBeNull();
  });

  it('renders blocking overlay modal when isVisible is true', () => {
    const node = RestoreBlockingOverlay({ isVisible: true, progressMessage: 'Restoring database...' });
    expect(React.isValidElement(node)).toBe(true);
  });
});
