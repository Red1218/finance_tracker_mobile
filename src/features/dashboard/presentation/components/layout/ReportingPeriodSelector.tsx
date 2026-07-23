import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

interface ReportingPeriodSelectorProps {
  currentPeriodId: string;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (periodType: string) => void;
}

export function ReportingPeriodSelector({ currentPeriodId, isOpen, onToggle, onSelect }: ReportingPeriodSelectorProps) {
  const label = currentPeriodId === 'CurrentMonth' ? 'This Month' 
              : currentPeriodId === 'PreviousMonth' ? 'Last Month'
              : currentPeriodId === 'YearToDate' ? 'Year to Date'
              : currentPeriodId;

  return (
    <View style={styles.container}>
      <Pressable 
        style={styles.button} 
        onPress={onToggle}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Reporting Period, currently ${label}`}
        accessibilityState={{ expanded: isOpen }}
      >
        <Text style={styles.buttonText}>{label}</Text>
      </Pressable>

      {isOpen && (
        <View style={styles.dropdown}>
          <Pressable style={styles.option} onPress={() => onSelect('CurrentMonth')}>
            <Text style={styles.optionText}>This Month</Text>
          </Pressable>
          <Pressable style={styles.option} onPress={() => onSelect('PreviousMonth')}>
            <Text style={styles.optionText}>Last Month</Text>
          </Pressable>
          <Pressable style={styles.option} onPress={() => onSelect('YearToDate')}>
            <Text style={styles.optionText}>Year to Date</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 10,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    minHeight: 44, // Touch target sizing PC-006
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  dropdown: {
    position: 'absolute',
    top: 50,
    right: 0,
    width: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
    paddingVertical: 8,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  optionText: {
    fontSize: 14,
    color: '#333333',
  }
});
