import React from 'react';
import { View, Text } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useTheme } from '../../../../../shared/theme';
import { MonthlyTrendBarChartViewModel } from '../../mappers/MonthlyTrendChartMapper';

interface Props {
  readonly viewModel: MonthlyTrendBarChartViewModel;
}

export const MonthlyTrendBarChart: React.FC<Props> = ({ viewModel }) => {
  const theme = useTheme();
  const { barData, accessibilitySummary } = viewModel;

  if (barData.length === 0) {
    return null;
  }

  const coloredBarData = barData.map((point, index) => ({
    ...point,
    frontColor: index % 2 === 0 ? theme.colors.success : theme.colors.error,
  }));

  return (
    <View
      accessible={true}
      accessibilityRole="image"
      accessibilityLabel={accessibilitySummary}
      style={{ marginVertical: theme.spacing.space8 }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: theme.spacing.space12, marginBottom: theme.spacing.space4, paddingRight: theme.spacing.space4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.space4 }}>
          <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: theme.colors.success }} />
          <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>Income</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.space4 }}>
          <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: theme.colors.error }} />
          <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>Expenses</Text>
        </View>
      </View>

      <BarChart
        data={coloredBarData}
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
