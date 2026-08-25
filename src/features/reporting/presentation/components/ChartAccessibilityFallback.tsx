import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../../../shared/theme';

interface TableRow {
  label: string;
  value: string;
}

interface Props {
  readonly summaryText: string;
  readonly tableData: TableRow[];
}

export const ChartAccessibilityFallback: React.FC<Props> = ({ summaryText, tableData }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.container} accessibilityRole="summary" accessibilityLabel={summaryText}>
      <Pressable
        onPress={() => setExpanded(!expanded)}
        style={styles.toggleButton}
        accessibilityRole="button"
        accessibilityLabel={expanded ? 'Hide accessible data table' : 'View accessible data table'}
      >
        <Text style={[styles.toggleText, { color: theme.colors.brandPrimary }]}>
          {expanded ? '▼ Hide Data Table' : '▶ View Data Table (Accessible)'}
        </Text>
      </Pressable>

      {expanded && (
        <View
          style={[styles.table, { backgroundColor: theme.colors.surfaceSecondary, borderColor: theme.colors.borderSubtle }]}
        >
          {tableData.map((row, idx) => (
            <View key={idx} style={styles.row}>
              <Text style={[styles.cellLabel, { color: theme.colors.textSecondary }]}>
                {row.label}
              </Text>
              <Text style={[styles.cellValue, { color: theme.colors.textPrimary }]}>
                {row.value}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  toggleButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  table: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  cellLabel: {
    fontSize: 12,
  },
  cellValue: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
