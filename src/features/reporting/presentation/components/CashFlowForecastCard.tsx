import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../../../shared/components/Card';
import { useTheme } from '../../../../shared/theme';
import { CashFlowForecast } from '../../../insights/domain';

interface Props {
  readonly forecast: CashFlowForecast | null;
}

export const CashFlowForecastCard: React.FC<Props> = ({ forecast }) => {
  const theme = useTheme();

  if (!forecast) {
    return (
      <Card variant="elevated" style={styles.card}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>30-Day Cash Flow Forecast</Text>
        <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
          Forecast is unavailable. Generate more transaction history to enable AI cash flow projections.
        </Text>
      </Card>
    );
  }

  const confidencePct = Math.round(forecast.confidenceScore.score * 100);

  return (
    <Card
      variant="elevated"
      style={styles.card}
      accessibilityLabel={`30 day cash flow forecast. Projected savings: ₹${forecast.projectedSavings}. Confidence: ${confidencePct}%`}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>30-Day Cash Flow Forecast</Text>
        <View style={[styles.badge, { backgroundColor: theme.colors.brandSecondary }]}>
          <Text style={styles.badgeText}>{confidencePct}% Confidence</Text>
        </View>
      </View>

      <View style={styles.heroBox}>
        <Text style={[styles.heroLabel, { color: theme.colors.textMuted }]}>Projected Net Savings</Text>
        <Text
          style={[
            styles.heroAmount,
            { color: forecast.projectedSavings >= 0 ? theme.colors.success : theme.colors.error },
          ]}
        >
          ₹{forecast.projectedSavings.toLocaleString('en-IN')}
        </Text>
      </View>

      <View style={styles.tilesRow}>
        <View style={[styles.tile, { backgroundColor: theme.colors.surfacePrimary, borderColor: theme.colors.borderSubtle }]}>
          <Text style={[styles.tileLabel, { color: theme.colors.textMuted }]}>Projected Income</Text>
          <Text style={[styles.tileAmount, { color: theme.colors.success }]}>
            ₹{forecast.predictedIncome.toLocaleString('en-IN')}
          </Text>
        </View>

        <View style={[styles.tile, { backgroundColor: theme.colors.surfacePrimary, borderColor: theme.colors.borderSubtle }]}>
          <Text style={[styles.tileLabel, { color: theme.colors.textMuted }]}>Projected Expenses</Text>
          <Text style={[styles.tileAmount, { color: theme.colors.error }]}>
            ₹{forecast.predictedExpense.toLocaleString('en-IN')}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 13,
    marginTop: 8,
  },
  heroBox: {
    marginBottom: 12,
  },
  heroLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  heroAmount: {
    fontSize: 26,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  tilesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  tile: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  tileLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  tileAmount: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
