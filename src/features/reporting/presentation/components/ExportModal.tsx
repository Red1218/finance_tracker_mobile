import React, { useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { ExportFormat, ExportReportRequest } from '../../domain';
import { Button } from '../../../../shared/components/Button';

interface Props {
  readonly visible: boolean;
  readonly selectedPeriodLabel: string;
  readonly isGenerating: boolean;
  readonly error: string | null;
  readonly onClose: () => void;
  readonly onGenerateExport: (request: ExportReportRequest) => void;
}

export const ExportModal: React.FC<Props> = ({
  visible,
  selectedPeriodLabel,
  isGenerating,
  error,
  onClose,
  onGenerateExport,
}) => {
  const theme = useTheme();
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [dateMode, setDateMode] = useState<'current' | 'custom'>('current');

  const handleGenerate = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    const request = new ExportReportRequest({
      format,
      startDate: start,
      endDate: end,
    });

    onGenerateExport(request);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.backdrop, { backgroundColor: theme.colors.overlay }]}>
        <View style={[styles.surface, { backgroundColor: theme.colors.surfacePrimary, borderColor: theme.colors.borderSubtle }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Export Report & Ledger</Text>
            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close export modal"
              disabled={isGenerating}
            >
              <Text style={[styles.closeText, { color: theme.colors.textMuted }]}>✕</Text>
            </Pressable>
          </View>

          {error && (
            <View style={[styles.errorBox, { backgroundColor: theme.colors.surfaceSecondary, borderColor: theme.colors.error }]}>
              <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
            </View>
          )}

          {/* Format Picker */}
          <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>EXPORT FORMAT</Text>
          <View style={[styles.formatPicker, { backgroundColor: theme.colors.surfaceSecondary }]}>
            <Pressable
              onPress={() => !isGenerating && setFormat('pdf')}
              style={[
                styles.formatOption,
                format === 'pdf' && { backgroundColor: theme.colors.brandPrimary },
              ]}
              accessibilityRole="radio"
              accessibilityState={{ checked: format === 'pdf' }}
              disabled={isGenerating}
            >
              <Text style={[styles.formatText, { color: theme.colors.textPrimary }]}>PDF Report</Text>
            </Pressable>

            <Pressable
              onPress={() => !isGenerating && setFormat('csv')}
              style={[
                styles.formatOption,
                format === 'csv' && { backgroundColor: theme.colors.brandPrimary },
              ]}
              accessibilityRole="radio"
              accessibilityState={{ checked: format === 'csv' }}
              disabled={isGenerating}
            >
              <Text style={[styles.formatText, { color: theme.colors.textPrimary }]}>CSV Raw Data</Text>
            </Pressable>
          </View>

          {/* Date Scope */}
          <Text style={[styles.sectionLabel, { color: theme.colors.textMuted, marginTop: 16 }]}>DATE SCOPE</Text>
          <View style={styles.radioGroup}>
            <Pressable
              onPress={() => !isGenerating && setDateMode('current')}
              style={styles.radioRow}
              disabled={isGenerating}
            >
              <View style={[styles.radioCircle, { borderColor: theme.colors.brandPrimary }]}>
                {dateMode === 'current' && <View style={[styles.radioDot, { backgroundColor: theme.colors.brandPrimary }]} />}
              </View>
              <Text style={[styles.radioText, { color: theme.colors.textPrimary }]}>
                Current Period ({selectedPeriodLabel})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => !isGenerating && setDateMode('custom')}
              style={styles.radioRow}
              disabled={isGenerating}
            >
              <View style={[styles.radioCircle, { borderColor: theme.colors.brandPrimary }]}>
                {dateMode === 'custom' && <View style={[styles.radioDot, { backgroundColor: theme.colors.brandPrimary }]} />}
              </View>
              <Text style={[styles.radioText, { color: theme.colors.textPrimary }]}>Last 30 Days (Custom)</Text>
            </Pressable>
          </View>

          {/* Action Button */}
          <View style={styles.actionContainer}>
            <Button
              title={isGenerating ? 'Generating...' : 'Generate & Share'}
              onPress={handleGenerate}
              variant="primary"
              disabled={isGenerating}
              accessibilityLabel="Generate and share export file"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  surface: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 18,
  },
  errorBox: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  formatPicker: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 10,
    height: 44,
  },
  formatOption: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    minHeight: 36,
  },
  formatText: {
    fontSize: 13,
    fontWeight: '600',
  },
  radioGroup: {
    gap: 12,
    marginTop: 4,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  radioText: {
    fontSize: 14,
  },
  actionContainer: {
    marginTop: 20,
  },
});
