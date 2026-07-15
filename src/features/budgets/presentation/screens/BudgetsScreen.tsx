import React, { useMemo } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { Screen, Loading, Button } from '../../../../shared/components';
import { useTheme } from '../../../../shared/theme';
import { BudgetProgressViewModel } from '../models';
import { BudgetProgressBar } from '../components';
import { useBudgetProgress } from '../hooks';

export function BudgetsScreen() {
  const { colors, spacing, typography, radius } = useTheme();

  const { progressModels, isLoading, error: fetchError, refresh } = useBudgetProgress();

  return (
    <Screen style={styles.container}>
      <View style={[styles.header, { padding: spacing.space16, backgroundColor: colors.surfacePrimary }]}>
        <Text style={[{ color: colors.textPrimary }, typography.title]}>My Budgets</Text>
        <Button title="Refresh" onPress={refresh} disabled={isLoading} />
      </View>

      {fetchError ? (
        <View style={[styles.center, { padding: spacing.space16 }]}>
          <Text style={[{ color: colors.error, textAlign: 'center' }, typography.body]}>
            {fetchError}
          </Text>
          <Button title="Retry" onPress={refresh} style={{ marginTop: spacing.space16 }} />
        </View>
      ) : isLoading && progressModels.length === 0 ? (
        <View style={styles.center}>
          <Loading />
        </View>
      ) : progressModels.length === 0 ? (
        <View style={[styles.center, { padding: spacing.space24 }]}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>No active budgets.</Text>
        </View>
      ) : (
        <ScrollView style={{ padding: spacing.space16 }}>
          {progressModels.map(model => (
            <View 
              key={model.budgetId} 
              style={[
                styles.progressCard, 
                { 
                  backgroundColor: colors.surfacePrimary, 
                  padding: spacing.space16,
                  borderRadius: radius.medium,
                  marginBottom: spacing.space16
                }
              ]}
            >
              <View style={styles.cardHeader}>
                <Text style={[typography.heading, { color: colors.textPrimary }]}>{model.categoryName}</Text>
                <Text style={[typography.body, { color: colors.textSecondary }]}>{model.formattedSpentAmount} of {model.formattedBudgetAmount}</Text>
              </View>
              
              <BudgetProgressBar 
                progressPercentage={model.progressPercentage} 
                isOverBudget={model.isOverBudget} 
              />
              
              <Text style={[typography.caption, { color: model.isOverBudget ? colors.error : colors.textSecondary, marginTop: spacing.space8 }]}>
                {model.isOverBudget 
                  ? `Over budget by ${model.formattedRemainingAmount}` 
                  : `${model.formattedRemainingAmount} remaining`}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCard: {
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  }
});
