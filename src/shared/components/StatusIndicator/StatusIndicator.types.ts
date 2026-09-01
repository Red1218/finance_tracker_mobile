import { ViewStyle, TextStyle } from 'react-native';

export type StatusType = 'success' | 'warning' | 'error' | 'info';

export type StatusIndicatorVariant = 'dot' | 'badge' | 'subtle' | 'text';

export interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  variant?: StatusIndicatorVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
}
