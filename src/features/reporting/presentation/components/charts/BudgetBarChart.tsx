import React from 'react';
import { View, Text } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useTheme } from '../../../../../shared/theme';
import { BudgetChartViewModel } from '../../mappers/BudgetChartMapper';

interface Props {
  readonly viewModel: BudgetChartViewModel;
}

export const BudgetBarChart: React.FC<Props> = ({ viewModel }) => {
  const theme = useTheme();
  const { barData, accessibilitySummary } = viewModel;

  if (barData.length === 0) {
    return null;
  }

  return (
    <View
      accessible={true}
      accessibilityRole="image"
      accessibilityLabel={accessibilitySummary}
      style={{ marginVertical: theme.spacing.space8 }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: theme.spacing.space12, marginBottom: theme.spacing.space4, paddingRight: theme.spacing.space4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.space4 }}>
          <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: theme.colors.textMuted }} />
          <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>Budget</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.space4 }}>
          <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: theme.colors.brandPrimary }} />
          <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>Spent</Text>
        </View>
      </View>

      <BarChart
        data={barData}
        height={160}
        barWidth={14}
        initialSpacing={15}
        spacing={12}
        roundedTop
        roundedBottom
        rulesColor={theme.colors.borderSubtle}
        rulesType="solid"
        noOfSections={4}
        yAxisTextStyle={{ color: theme.colors.textMuted, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: theme.colors.textMuted, fontSize: 10 }}
      />
    </View>
  );
};
