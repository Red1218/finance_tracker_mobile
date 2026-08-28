import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { Button, Card, Icon, StatusIndicator } from '../../../../shared/components';
import { TransactionViewModel } from '../models/TransactionViewModel';

export interface TransactionDetailSheetProps {
  visible: boolean;
  transaction: TransactionViewModel | null;
  isLoading?: boolean;
  error?: string | null;
  onEdit?: (transaction: TransactionViewModel) => void;
  onVoid?: (transactionId: string) => Promise<void>;
  onClose: () => void;
}

export function TransactionDetailSheet({
  visible,
  transaction,
  isLoading = false,
  error = null,
  onEdit,
  onVoid,
  onClose,
}: TransactionDetailSheetProps) {
  const { colors, typography } = useTheme();
  const [showVoidConfirm, setShowVoidConfirm] = useState(false);

  if (!visible || !transaction) return null;

  const getStatusType = (): 'success' | 'warning' | 'error' | 'info' => {
    if (transaction.isVoided) return 'warning';
    switch (transaction.type) {
      case 'EXPENSE':
        return 'error';
      case 'INCOME':
        return 'success';
      default:
        return 'info';
    }
  };

  const handleConfirmVoid = async () => {
    if (onVoid) {
      await onVoid(transaction.id);
      setShowVoidConfirm(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={[styles.sheetContent, { backgroundColor: colors.surfacePrimary, borderColor: colors.border }]}>
          <View style={[styles.handleBar, { backgroundColor: colors.borderSubtle }]} />

          <View style={styles.headerRow}>
            <StatusIndicator
              status={getStatusType()}
              variant="badge"
              label={transaction.isVoided ? 'Voided' : transaction.typeLabel}
            />
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close Detail Sheet"
            >
              <Icon name="X" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {error && (
            <View style={[styles.errorBanner, { backgroundColor: colors.surfaceSecondary, borderColor: colors.error }]}>
              <Icon name="AlertTriangle" size={18} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          )}

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.amountHeader}>
              <Text
                style={[
                  styles.amountText,
                  {
                    color: transaction.isVoided ? colors.textMuted : colors.textPrimary,
                    fontSize: typography.numericLarge.fontSize,
                    textDecorationLine: transaction.isVoided ? 'line-through' : 'none',
                  },
                ]}
              >
                {transaction.formattedAmount}
              </Text>
            </View>

            <Card style={styles.metadataCard}>
              <View style={styles.metaRow}>
                <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Description</Text>
                <Text style={[styles.metaValue, { color: colors.textPrimary, fontSize: typography.title.fontSize }]}>
                  {transaction.description}
                </Text>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

              <View style={styles.metaRow}>
                <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Date</Text>
                <Text style={[styles.metaValue, { color: colors.textSecondary }]}>
                  {transaction.formattedDate}
                </Text>
              </View>

              {transaction.transferGroupId && (
                <>
                  <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
                  <View style={styles.metaRow}>
                    <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Transfer Reference</Text>
                    <Text style={[styles.metaValue, { color: colors.warning }]}>
                      Group ID: {transaction.transferGroupId}
                    </Text>
                  </View>
                </>
              )}
            </Card>

            {showVoidConfirm && (
              <View style={[styles.confirmCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.error }]}>
                <View style={styles.confirmHeader}>
                  <Icon name="AlertTriangle" size={24} color={colors.error} />
                  <Text style={[styles.confirmTitle, { color: colors.error }]}>Void Transaction?</Text>
                </View>
                <Text style={[styles.confirmMessage, { color: colors.textSecondary }]}>
                  This action marks the transaction as voided and removes its balance impact. It cannot be undone.
                </Text>
                <View style={styles.confirmBtnRow}>
                  <TouchableOpacity
                    style={[styles.confirmCancelBtn, { borderColor: colors.borderSubtle }]}
                    onPress={() => setShowVoidConfirm(false)}
                    disabled={isLoading}
                  >
                    <Text style={{ color: colors.textSecondary }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.confirmVoidBtn, { backgroundColor: colors.error }]}
                    onPress={handleConfirmVoid}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Confirm Void</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>

          {!showVoidConfirm && (
            <View style={styles.actionFooter}>
              <Button
                title="Edit Transaction"
                variant="secondary"
                disabled={transaction.isVoided || isLoading}
                onPress={() => {
                  if (onEdit) onEdit(transaction);
                }}
                style={styles.actionBtn}
              />
              <TouchableOpacity
                style={[
                  styles.voidBtn,
                  {
                    borderColor: transaction.isVoided ? colors.borderSubtle : colors.error,
                    opacity: transaction.isVoided ? 0.5 : 1,
                  },
                ]}
                disabled={transaction.isVoided || isLoading}
                onPress={() => setShowVoidConfirm(true)}
                accessibilityRole="button"
                accessibilityLabel="Void Transaction"
              >
                <Text style={{ color: transaction.isVoided ? colors.textMuted : colors.error, fontWeight: '600' }}>
                  Void
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  sheetContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334155',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  closeBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  amountHeader: {
    alignItems: 'center',
    marginVertical: 16,
  },
  amountText: {
    fontWeight: '700',
  },
  metadataCard: {
    padding: 16,
    marginBottom: 16,
  },
  metaRow: {
    paddingVertical: 4,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  metaValue: {
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#27272A',
    marginVertical: 10,
  },
  confirmCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  confirmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  confirmMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  confirmBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmCancelBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmVoidBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  actionBtn: {
    flex: 1,
  },
  voidBtn: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
