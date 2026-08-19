import { ViewStyle } from 'react-native';

export interface AppBarAction {
  id: string;
  iconName: string;
  label: string;
  onPress: () => void;
  badgeCount?: number;
  disabled?: boolean;
}

export interface AppBarProps {
  title: string;
  subtitle?: string;
  leadingAction?: AppBarAction;
  trailingActions?: AppBarAction[];
  style?: ViewStyle;
}
