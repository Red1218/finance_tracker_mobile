import { ViewStyle } from 'react-native';

export interface SegmentedControlOption {
  readonly id: string;
  readonly label: string;
  readonly accessibilityLabel?: string;
}

export interface SegmentedControlProps {
  readonly options: SegmentedControlOption[];
  readonly selectedId: string;
  readonly onChange: (id: string) => void;
  readonly disabled?: boolean;
  readonly style?: ViewStyle;
  readonly accessibilityLabel?: string;
}
