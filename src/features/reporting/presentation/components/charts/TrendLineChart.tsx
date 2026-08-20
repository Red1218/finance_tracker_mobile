import React from 'react';
import { View, Text } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useTheme } from '../../../../../shared/theme';
import { MonthlyTrendChartViewModel } from '../../mappers/MonthlyTrendChartMapper';

interface Props {
  readonly viewModel: MonthlyTrendChartViewModel;
}

export const TrendLineChart: React.FC<Props> = ({ viewModel }) => {
  const theme = useTheme();
  const { expenseData, incomeData, accessibilitySummary } = viewModel;

  if (expenseData.length === 0) {
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
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.error }} />
          <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>Expenses</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.space4 }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.success }} />
          <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>Income</Text>
        </View>
      </View>

      <LineChart
        data={expenseData}
        data2={incomeData}
        height={180}
        color1={theme.colors.error}
        color2={theme.colors.success}
        thickness={2.5}
        dataPointsColor1={theme.colors.error}
        dataPointsColor2={theme.colors.success}
        dataPointsRadius={3}
        spacing={expenseData.length <= 6 ? 50 : Math.max(25, 280 / expenseData.length)}
        initialSpacing={15}
        endSpacing={15}
        yAxisTextStyle={{ color: theme.colors.textMuted, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: theme.colors.textMuted, fontSize: 10 }}
        rulesColor={theme.colors.borderSubtle}
        rulesType="solid"
        noOfSections={4}
        hideDataPoints={expenseData.length > 20}
        curved={false}
      />
    </View>
  );
};
