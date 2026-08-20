import { ViewStyle } from 'react-native';

export type FABVariant = 'standard' | 'extended' | 'mini';

export interface FABProps {
  iconName: string;
  label?: string;
  onPress: () => void;
  variant?: FABVariant;
  visible?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
}
