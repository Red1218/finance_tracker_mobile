import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../../../shared/theme';

export type AnalyticsSegment = 'reports' | 'insights';

interface Props {
  readonly activeSegment: AnalyticsSegment;
  readonly onSegmentChange: (segment: AnalyticsSegment) => void;
  readonly disabled?: boolean;
}

export const AnalyticsSegmentedControl: React.FC<Props> = ({
  activeSegment,
  onSegmentChange,
  disabled = false,
}) => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.surfaceSecondary },
        disabled && styles.disabled,
      ]}
      accessibilityRole="tablist"
    >
      <Pressable
        onPress={() => !disabled && onSegmentChange('reports')}
        style={[
          styles.segment,
          activeSegment === 'reports' && { backgroundColor: theme.colors.surfaceElevated },
        ]}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeSegment === 'reports' }}
        accessibilityLabel="Reports and Trends tab"
        disabled={disabled}
      >
        <Text
          style={[
            styles.segmentText,
            {
              color:
                activeSegment === 'reports'
                  ? theme.colors.textPrimary
                  : theme.colors.textSecondary,
              fontWeight: activeSegment === 'reports' ? '700' : '500',
            },
          ]}
        >
          Reports & Trends
        </Text>
      </Pressable>

      <Pressable
        onPress={() => !disabled && onSegmentChange('insights')}
        style={[
          styles.segment,
          activeSegment === 'insights' && { backgroundColor: theme.colors.surfaceElevated },
        ]}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeSegment === 'insights' }}
        accessibilityLabel="AI Insights and Forecasts tab"
        disabled={disabled}
      >
        <Text
          style={[
            styles.segmentText,
            {
              color:
                activeSegment === 'insights'
                  ? theme.colors.textPrimary
                  : theme.colors.textSecondary,
              fontWeight: activeSegment === 'insights' ? '700' : '500',
            },
          ]}
        >
          AI Insights & Forecasts
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    height: 48,
  },
  segment: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    minHeight: 40,
  },
  segmentText: {
    fontSize: 13,
  },
  disabled: {
    opacity: 0.5,
  },
});
