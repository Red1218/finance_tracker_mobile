import { TouchableOpacityProps } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive';

export interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  title: string;
}
