import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Card } from '../../../../shared/components/Card';
import { useTheme } from '../../../../shared/theme';
import { Insight, InsightSeverity, InsightSource } from '../../../insights/domain';

interface Props {
  readonly insight: Insight;
  readonly onDismiss: (insightId: string) => void;
}

export const AIInsightCard: React.FC<Props> = ({ insight, onDismiss }) => {
  const theme = useTheme();

  const getSeverityColor = (severity: InsightSeverity) => {
    switch (severity) {
      case InsightSeverity.CRITICAL:
      case InsightSeverity.HIGH:
        return theme.colors.error;
      case InsightSeverity.MEDIUM:
        return theme.colors.warning;
      case InsightSeverity.LOW:
      case InsightSeverity.INFO:
      default:
        return theme.colors.brandPrimary;
    }
  };

  const providerLabel =
    insight.source === InsightSource.AI_MODEL ? 'AI Generated' : 'Automated Analytics';

  const providerBg =
    insight.source === InsightSource.AI_MODEL ? theme.colors.brandSecondary : theme.colors.surfaceSecondary;

  return (
    <Card
      variant="elevated"
      style={styles.card}
      accessibilityLabel={`${insight.title}. Provider: ${providerLabel}. ${insight.description}`}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.badge, { backgroundColor: getSeverityColor(insight.severity) }]}>
            <Text style={styles.badgeText}>{insight.severity.toUpperCase()}</Text>
          </View>

          <View style={[styles.badge, { backgroundColor: providerBg }]}>
            <Text style={[styles.badgeText, { color: theme.colors.textPrimary }]}>{providerLabel}</Text>
          </View>
        </View>

        <Pressable
          onPress={() => onDismiss(insight.id)}
          style={styles.dismissButton}
          accessibilityRole="button"
          accessibilityLabel="Dismiss insight"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={[styles.dismissText, { color: theme.colors.textMuted }]}>✕</Text>
        </Pressable>
      </View>

      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{insight.title}</Text>
      <Text style={[styles.description, { color: theme.colors.textSecondary }]}>{insight.description}</Text>

      {insight.recommendation && (
        <View style={[styles.recommendationBox, { backgroundColor: theme.colors.surfaceSecondary, borderColor: theme.colors.borderSubtle }]}>
          <Text style={[styles.recommendationLabel, { color: theme.colors.brandPrimary }]}>Recommendation:</Text>
          <Text style={[styles.recommendationText, { color: theme.colors.textPrimary }]}>
            {insight.recommendation.text}
          </Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  dismissButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  recommendationBox: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
  },
  recommendationLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  recommendationText: {
    fontSize: 12,
  },
});
