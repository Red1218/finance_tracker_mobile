import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/src/shared/theme';
import { Icon } from '@/src/shared/components';

export interface TransactionSearchProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function TransactionSearch({ value, onChangeText, placeholder = 'Search transactions...' }: TransactionSearchProps) {
  const { colors, radius, typography } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceSecondary, borderColor: colors.borderSubtle, borderRadius: radius.medium }]}>
      <Icon name="Search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
      <TextInput
        style={[styles.input, { color: colors.textPrimary, fontSize: typography.body.fontSize }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel="Search transactions input"
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText('')}
          style={styles.clearBtn}
          accessibilityRole="button"
          accessibilityLabel="Clear search input"
        >
          <Icon name="X" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    padding: 0,
  },
  clearBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -8,
  },
});
