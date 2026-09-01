import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { Icon } from '../../../../shared/components';

export type NumericKeypadKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '.' | 'backspace';

const KEY_ROWS: NumericKeypadKey[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'backspace'],
];

interface NumericKeypadProps {
  onKeyPress: (key: NumericKeypadKey) => void;
  disabled?: boolean;
}

export function NumericKeypad({ onKeyPress, disabled = false }: NumericKeypadProps) {
  const { colors, radius, spacing } = useTheme();

  return (
    <View style={styles.grid}>
      {KEY_ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={[styles.row, { gap: spacing.space12 }]}>
          {row.map((key) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.key,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderRadius: radius.medium,
                  opacity: disabled ? 0.5 : 1,
                },
              ]}
              onPress={() => onKeyPress(key)}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel={key === 'backspace' ? 'Delete last digit' : key === '.' ? 'Decimal point' : `Digit ${key}`}
            >
              {key === 'backspace' ? (
                <Icon name="Delete" size={22} color={colors.textPrimary} />
              ) : (
                <Text style={[styles.keyText, { color: colors.textPrimary }]}>{key}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
  },
  key: {
    flex: 1,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: 24,
    fontWeight: '500',
  },
});
