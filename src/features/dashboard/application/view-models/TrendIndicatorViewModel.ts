export interface TrendIndicatorViewModel {
  readonly direction: 'Positive' | 'Negative' | 'Neutral';
  readonly label: string;
  readonly accessibilityLabel: string;
}
