import React from 'react';
import { View, Text } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { useTheme } from '../../../../../shared/theme';
import { CategoryChartViewModel } from '../../mappers/CategoryChartMapper';

interface Props {
  readonly viewModel: CategoryChartViewModel;
}

export const CategoryDonutChart: React.FC<Props> = ({ viewModel }) => {
  const theme = useTheme();
  const { pieData, totalSpend, accessibilitySummary } = viewModel;

  if (pieData.length === 0) {
    return null;
  }

  return (
    <View
      accessible={true}
      accessibilityRole="image"
      accessibilityLabel={accessibilitySummary}
      style={{ alignItems: 'center', marginVertical: theme.spacing.space8 }}
    >
      <PieChart
        data={pieData}
        donut
        radius={75}
        innerRadius={50}
        innerCircleColor={theme.colors.surfaceElevated}
        centerLabelComponent={() => (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 11, color: theme.colors.textMuted, fontWeight: '500' }}>Total</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: theme.colors.textPrimary }}>
              ₹{totalSpend >= 100000 ? `${(totalSpend / 1000).toFixed(0)}k` : totalSpend.toLocaleString('en-IN')}
            </Text>
          </View>
        )}
      />
    </View>
  );
};
