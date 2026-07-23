import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

interface QuickActionsSectionProps {
  onAction: (actionType: string) => void;
}

export function QuickActionsSection({ onAction }: QuickActionsSectionProps) {
  const actions = [
    { id: 'AddTransaction', label: 'Add Transaction', icon: '+$' },
    { id: 'AdjustBudget', label: 'Adjust Budget', icon: '📊' }
  ];

  return (
    <View style={styles.container}>
      {actions.map(action => (
        <Pressable 
          key={action.id}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          onPress={() => onAction(action.id)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={action.label}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{action.icon}</Text>
          </View>
          <Text style={styles.label}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  button: {
    alignItems: 'center',
    minWidth: 80,
    minHeight: 44,
  },
  pressed: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  }
});
