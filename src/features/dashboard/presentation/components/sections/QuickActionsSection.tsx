import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../../../../shared/theme';
import { Card } from '../../../../../shared/components/Card';
import { Icon } from '../../../../../shared/components/Icon';

export interface QuickActionsSectionProps {
  onAction: (actionType: string) => void;
}

export function QuickActionsSection({ onAction }: QuickActionsSectionProps) {
  const { colors, typography } = useTheme();

  const actions = [
    { id: 'ADD_TRANSACTION', label: 'Add Transaction', iconName: 'PlusCircle' },
    { id: 'MANAGE_BUDGETS', label: 'Manage Budgets', iconName: 'Target' },
  ];

  return (
    <Card variant="elevated" style={styles.cardContainer}>
      <View style={styles.container}>
        {actions.map((action) => (
          <Pressable
            key={action.id}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            onPress={() => onAction(action.id)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={action.label}
          >
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <Icon name={action.iconName} size="md" color={colors.brandPrimary} />
            </View>
            <Text style={[styles.label, { color: colors.textPrimary, fontSize: typography.caption.fontSize }]}>
              {action.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  button: {
    alignItems: 'center',
    minWidth: 100,
    minHeight: 44,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  label: {
    fontWeight: '600',
  },
});
