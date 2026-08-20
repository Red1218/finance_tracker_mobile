import { ViewStyle } from 'react-native';

export type IconSize = 'sm' | 'md' | 'lg' | number;

export interface IconProps {
  name: string;
  size?: IconSize;
  color?: string;
  style?: ViewStyle;
  accessibilityLabel?: string;
}
