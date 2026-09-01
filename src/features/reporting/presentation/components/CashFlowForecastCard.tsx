import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, withAlpha } from '../../../../shared/theme';
import { CashFlowForecast } from '../../../insights/domain';

interface Props {
  readonly forecast: CashFlowForecast | null;
}

export const CashFlowForecastCard: React.FC<Props> = ({ forecast }) => {
  const theme = useTheme();

  if (!forecast) {
    return (
      <View
        style={[styles.panel, { backgroundColor: withAlpha(theme.colors.brandPrimary, 0.08), borderRadius: theme.radius.large }]}
      >
        <Text style={[styles.eyebrow, { color: theme.colors.brandPrimary }]}>✦ FORECAST</Text>
        <Text style={[styles.copy, { color: theme.colors.textSecondary }]}>
          Forecast is unavailable. Generate more transaction history to enable AI cash flow projections.
        </Text>
      </View>
    );
  }

  const confidencePct = Math.round(forecast.confidenceScore.score * 100);
  const isPositive = forecast.projectedSavings >= 0;
  const formattedSavings = `₹${Math.abs(forecast.projectedSavings).toLocaleString('en-IN')}`;

  return (
    <View
      style={[styles.panel, { backgroundColor: withAlpha(theme.colors.brandPrimary, 0.08), borderRadius: theme.radius.large }]}
      accessibilityLabel={`Cash flow forecast. Projected savings: ₹${forecast.projectedSavings}. Confidence: ${confidencePct} percent.`}
    >
      <Text style={[styles.eyebrow, { color: theme.colors.brandPrimary }]}>✦ FORECAST</Text>
      <Text style={[styles.copy, { color: theme.colors.textPrimary }]}>
        At your current pace you will close this period with about{' '}
        <Text style={{ fontWeight: '700', color: isPositive ? theme.colors.success : theme.colors.error }}>
          {isPositive ? '' : '-'}
          {formattedSavings}
        </Text>{' '}
        in net savings ({confidencePct}% confidence).
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    padding: 16,
    marginBottom: 16,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  copy: {
    fontSize: 15,
    lineHeight: 22,
  },
});
