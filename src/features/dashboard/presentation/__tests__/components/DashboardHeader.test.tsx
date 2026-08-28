import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { theme } from '../../../../../shared/theme/theme';

vi.mock('../../../../../shared/theme', () => ({
  useTheme: () => theme,
}));

vi.mock('../../../../../shared/components/Icon', () => ({
  Icon: ({ name }: { name: string }) => null,
}));

import { DashboardHeader } from '../../components/layout/DashboardHeader';

describe('DashboardHeader Component Presentation', () => {
  it('renders centered Home title and notification bell button', () => {
    const header = DashboardHeader({ title: 'Home' });
    expect(header.props.accessibilityRole).toBe('header');

    // Title text check
    const titleContainer = header.props.children[1];
    const titleText = titleContainer.props.children;
    expect(titleText.props.children).toBe('Home');

    // Notification bell button check
    const rightActions = header.props.children[2];
    const bellButton = rightActions.props.children[1];
    expect(bellButton.props.accessibilityLabel).toBe('Notifications');
  });

  it('renders user email initial fallback when avatar URL is absent', () => {
    const header = DashboardHeader({ userEmail: 'test@example.com' });
    const avatarButton = header.props.children[0];
    const badgeView = avatarButton.props.children;
    const initialText = badgeView.props.children;
    expect(initialText.props.children).toBe('T');
  });

  it('renders avatar image when userAvatarUrl is provided', () => {
    const header = DashboardHeader({ userAvatarUrl: 'https://example.com/avatar.jpg' });
    const avatarButton = header.props.children[0];
    const image = avatarButton.props.children;
    expect(image.props.source.uri).toBe('https://example.com/avatar.jpg');
  });
});
