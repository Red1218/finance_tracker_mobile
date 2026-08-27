import React from 'react';
import { describe, it, expect } from 'vitest';
import { OfflineStatusBanner } from '../OfflineStatusBanner';

describe('OfflineStatusBanner', () => {
  it('returns null when isVisible is false', () => {
    const node = OfflineStatusBanner({ isVisible: false });
    expect(node).toBeNull();
  });

  it('renders overlay banner with pointerEvents="none" when isVisible is true', () => {
    const node = OfflineStatusBanner({ isVisible: true });
    expect(React.isValidElement(node)).toBe(true);
    expect(node?.props.pointerEvents).toBe('none');
  });
});
