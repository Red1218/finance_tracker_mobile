import React from 'react';
import { StyleSheet } from 'react-native';
import { SegmentedControl } from '../../../../shared/components/SegmentedControl';

export type AnalyticsSegment = 'reports' | 'insights';

interface Props {
  readonly activeSegment: AnalyticsSegment;
  readonly onSegmentChange: (segment: AnalyticsSegment) => void;
  readonly disabled?: boolean;
}

const OPTIONS = [
  { id: 'reports', label: 'Reports & Trends', accessibilityLabel: 'Reports and Trends tab' },
  { id: 'insights', label: 'AI Insights & Forecasts', accessibilityLabel: 'AI Insights and Forecasts tab' },
];

export const AnalyticsSegmentedControl: React.FC<Props> = ({
  activeSegment,
  onSegmentChange,
  disabled = false,
}) => {
  return (
    <SegmentedControl
      options={OPTIONS}
      selectedId={activeSegment}
      onChange={(id) => onSegmentChange(id as AnalyticsSegment)}
      disabled={disabled}
      style={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
});
