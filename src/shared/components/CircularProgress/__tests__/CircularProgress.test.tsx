import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { theme } from '../../../../shared/theme/theme';

vi.mock('react-native-svg', () => {
  const React = require('react');
  return {
    default: (props: any) => React.createElement('Svg', props, props.children),
    Circle: (props: any) => React.createElement('Circle', props),
  };
});

vi.mock('../../../../shared/theme', () => ({
  useTheme: () => theme,
}));

import { CircularProgress } from '../CircularProgress';

describe('CircularProgress Component Presentation', () => {
  it('renders SVG progress bar with clamped percentage', () => {
    const element = CircularProgress({ percentage: 70 });
    expect(element.props.accessibilityRole).toBe('progressbar');
    expect(element.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 70 });
  });

  it('renders center overlay content when children provided', () => {
    const child = <span id="center-content">70%</span>;
    const element = CircularProgress({ percentage: 70, children: child });
    expect(element.props.children[1]).not.toBeNull();
  });
});
