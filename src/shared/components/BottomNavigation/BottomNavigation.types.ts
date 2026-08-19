import { ViewStyle } from 'react-native';

export interface NavigationDestination {
  id: string;
  label: string;
  iconName: string;
  badgeCount?: number;
  disabled?: boolean;
}

export interface BottomNavigationProps {
  destinations: NavigationDestination[];
  activeDestinationId: string;
  onDestinationSelect: (id: string) => void;
  style?: ViewStyle;
}
