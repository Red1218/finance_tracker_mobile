import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { Icon, StatusIndicator } from '../../../../shared/components';
import { TransactionViewModel } from '../models/TransactionViewModel';

export interface TransactionDetailSheetProps {
  visible: boolean;
  transaction: TransactionViewModel | null;
  categoryName?: string;
  accountName?: string;
  budgetSummaryLabel?: string | null;
  recordedLabel?: string;
  isLoading?: boolean;
  error?: string | null;
  onEdit?: (transaction: TransactionViewModel) => void;
  onVoid?: (transactionId: string) => Promise<void>;
  onClose: () => void;
}

export interface DefinitionRowProps {
  label: string;
  value: string;
  valueColor?: string;
  isLast?: boolean;
}

// Exported so tests can identify these nodes by type in the returned
// element tree (they're unexpanded {type: DefinitionRow, props} descriptors
// at that point, not yet rendered into their own View/Text output).
export function DefinitionRow({ label, value, valueColor, isLast }: DefinitionRowProps) {
  const { colors, typography } = useTheme();
  return (
    <View style={[styles.metaRow, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.divider }]}>
      <Text style={[styles.metaLabel, { color: colors.textSecondary, fontSize: typography.body.fontSize }]}>{label}</Text>
      <Text
        style={[styles.metaValue, { color: valueColor ?? colors.textPrimary, fontSize: typography.body.fontSize }]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

export function TransactionDetailSheet({
  visible,
  transaction,
  categoryName,
  accountName,
  budgetSummaryLabel,
  recordedLabel,
  isLoading = false,
  error = null,
  onEdit,
  onVoid,
  onClose,
}: TransactionDetailSheetProps) {
  const { colors, typography } = useTheme();

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

  const isPositive = transaction.type === 'INCOME' || transaction.type === 'TRANSFER_IN';
  const isTransfer = transaction.type === 'TRANSFER_OUT' || transaction.type === 'TRANSFER_IN';
  let iconName: 'ArrowDownLeft' | 'ArrowUpRight' | 'ArrowRightLeft' = isPositive ? 'ArrowDownLeft' : 'ArrowUpRight';
  if (isTransfer) iconName = 'ArrowRightLeft';
  let iconColor = isPositive ? colors.success : colors.error;
  if (isTransfer) iconColor = colors.brandPrimary;
  if (transaction.isVoided) iconColor = colors.textMuted;

  const rows: DefinitionRowProps[] = [];
  if (categoryName) rows.push({ label: 'Category', value: categoryName });
  if (accountName) rows.push({ label: 'Account', value: accountName });
  if (budgetSummaryLabel) rows.push({ label: 'Counts against', value: budgetSummaryLabel });
  rows.push({ label: 'Recorded', value: recordedLabel ?? `Synced ${transaction.formattedCreatedTime}` });
  if (transaction.transferGroupId) {
    rows.push({ label: 'Transfer Reference', value: `Group ID: ${transaction.transferGroupId}`, valueColor: colors.warning });
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={[styles.backdrop, { backgroundColor: colors.overlay }]} activeOpacity={1} onPress={onClose} />

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
            <View style={styles.identityHeader}>
              <View style={[styles.iconContainer, { backgroundColor: colors.surfaceElevatedBadge }]}>
                <Icon name={iconName} size={22} color={iconColor} />
              </View>
              <View style={styles.identityText}>
                <Text style={[styles.descriptionText, { color: colors.textPrimary, fontSize: typography.title.fontSize }]} numberOfLines={1}>
                  {transaction.description || 'Transaction'}
                </Text>
                <Text style={[styles.subLabel, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
                  {transaction.typeLabel} · {transaction.formattedDate}
                </Text>
              </View>
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

            <View style={styles.definitionList}>
              {rows.map((row, index) => (
                <DefinitionRow key={row.label} {...row} isLast={index === rows.length - 1} />
              ))}
            </View>
          </ScrollView>

          <View style={styles.actionFooter}>
            <TouchableOpacity
              style={[
                styles.outlineBtn,
                { borderColor: transaction.isVoided ? colors.borderSubtle : colors.brandPrimary },
              ]}
              disabled={transaction.isVoided || isLoading}
              onPress={() => {
                if (onEdit) onEdit(transaction);
              }}
              accessibilityRole="button"
              accessibilityLabel="Edit Transaction"
            >
              <Text
                style={{
                  color: transaction.isVoided ? colors.textMuted : colors.brandPrimary,
                  fontWeight: '600',
                  fontSize: typography.body.fontSize,
                }}
              >
                Edit
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.outlineBtn,
                { borderColor: transaction.isVoided ? colors.borderSubtle : colors.error },
              ]}
              disabled={transaction.isVoided || isLoading}
              onPress={() => {
                if (onVoid) onVoid(transaction.id);
              }}
              accessibilityRole="button"
              accessibilityLabel="Void Transaction"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.error} />
              ) : (
                <Text
                  style={{
                    color: transaction.isVoided ? colors.textMuted : colors.error,
                    fontWeight: '600',
                    fontSize: typography.body.fontSize,
                  }}
                >
                  Void
                </Text>
              )}
            </TouchableOpacity>
          </View>
          {!transaction.isVoided && (
            <Text style={[styles.consequenceCaption, { color: colors.textMuted, fontSize: typography.caption.fontSize }]}>
              Voiding keeps the record and removes it from totals.
            </Text>
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
  identityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  identityText: {
    flex: 1,
    marginRight: 8,
  },
  descriptionText: {
    fontWeight: '700',
    marginBottom: 2,
  },
  subLabel: {},
  amountText: {
    fontWeight: '700',
  },
  definitionList: {
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  metaLabel: {
    fontWeight: '500',
  },
  metaValue: {
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  actionFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  outlineBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consequenceCaption: {
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 20,
  },
});
