import { ViewProps } from 'react-native';

export type CardVariant = 'default' | 'outlined' | 'elevated';

export interface CardProps extends ViewProps {
  variant?: CardVariant;
}
