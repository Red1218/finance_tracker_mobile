import { describe, it, expect, vi } from 'vitest';
import { theme } from '../../../../shared/theme/theme';

vi.mock('@/src/shared/theme', () => ({ useTheme: () => theme }));
vi.mock('@/src/shared/components', () => ({
  Icon: (props: any) => ({ type: 'Icon', key: null, props }),
  StatusIndicator: (props: any) => ({ type: 'StatusIndicator', key: null, props }),
}));

import { TransactionDetailSheet, DefinitionRow } from '../components/TransactionDetailSheet';
import { TransactionViewModel } from '../models/TransactionViewModel';

const baseTransaction: TransactionViewModel = {
  id: 'tx-200',
  accountId: 'acc-1',
  categoryId: 'cat-1',
  type: 'EXPENSE',
  typeLabel: 'Expense',
  amount: 1250,
  formattedAmount: '-₹1,250.00',
  currencyCode: 'INR',
  description: 'Starbucks Coffee',
  transferGroupId: null,
  transactionDateIso: '2026-08-20T14:30:00Z',
  formattedDate: 'Aug 20, 2026',
  isVoided: false,
  badgeColor: '#EF4444',
  formattedCreatedTime: '9:13 AM',
};

function flattenStyle(style: any): Record<string, unknown> {
  return Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean).map(flattenStyle)) : style || {};
}

// Walks the returned element tree collecting every node's descendants
// (both single children and arrays), regardless of nesting depth.
function collectNodes(root: any): any[] {
  const found: any[] = [];
  function walk(node: any) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) return node.forEach(walk);
    found.push(node);
    if (node.props?.children !== undefined) walk(node.props.children);
  }
  walk(root);
  return found;
}

function findDefinitionRows(sheetElement: any): Array<{ label: string; value: string }> {
  return collectNodes(sheetElement)
    .filter((n) => n.type === DefinitionRow)
    .map((n) => ({ label: n.props.label, value: n.props.value }));
}

function findByAccessibilityLabel(sheetElement: any, label: string): any {
  return collectNodes(sheetElement).find((n) => n.props?.accessibilityLabel === label);
}

describe('TransactionDetailSheet', () => {
  it('returns null when not visible or no transaction is given', () => {
    expect(TransactionDetailSheet({ visible: false, transaction: baseTransaction, onClose: vi.fn() })).toBeNull();
    expect(TransactionDetailSheet({ visible: true, transaction: null, onClose: vi.fn() })).toBeNull();
  });

  it('renders a definition list with Category, Account, and Recorded rows', () => {
    const element = TransactionDetailSheet({
      visible: true,
      transaction: baseTransaction,
      categoryName: 'Food & Drink',
      accountName: 'HDFC Savings',
      onClose: vi.fn(),
    });

    const rows = findDefinitionRows(element);
    expect(rows).toContainEqual({ label: 'Category', value: 'Food & Drink' });
    expect(rows).toContainEqual({ label: 'Account', value: 'HDFC Savings' });
    expect(rows).toContainEqual({ label: 'Recorded', value: 'Synced 9:13 AM' });
  });

  it('adds a "Counts against" row only when a budget summary is supplied', () => {
    const withoutBudget = TransactionDetailSheet({ visible: true, transaction: baseTransaction, onClose: vi.fn() });
    expect(findDefinitionRows(withoutBudget).some((r) => r.label === 'Counts against')).toBe(false);

    const withBudget = TransactionDetailSheet({
      visible: true,
      transaction: baseTransaction,
      budgetSummaryLabel: 'Food & Drink · ₹2,740 left',
      onClose: vi.fn(),
    });
    expect(findDefinitionRows(withBudget)).toContainEqual({
      label: 'Counts against',
      value: 'Food & Drink · ₹2,740 left',
    });
  });

  it('uses the caller-supplied recordedLabel over the default "Synced" fallback', () => {
    const element = TransactionDetailSheet({
      visible: true,
      transaction: baseTransaction,
      recordedLabel: 'Pending sync',
      onClose: vi.fn(),
    });

    expect(findDefinitionRows(element)).toContainEqual({ label: 'Recorded', value: 'Pending sync' });
  });

  it('renders Void as an outline button (no fill), matching the spec: reversible, should not look like deletion', () => {
    const element = TransactionDetailSheet({ visible: true, transaction: baseTransaction, onClose: vi.fn() });

    const voidBtn = findByAccessibilityLabel(element, 'Void Transaction');
    const voidStyle = flattenStyle(voidBtn.props.style);

    expect(voidStyle.backgroundColor).toBeUndefined();
    expect(voidStyle.borderColor).toBe(theme.colors.error);
  });

  it('states the consequence under the actions instead of a confirmation dialog', () => {
    const element = TransactionDetailSheet({ visible: true, transaction: baseTransaction, onClose: vi.fn() });

    const texts = collectNodes(element)
      .map((n) => n.props?.children)
      .filter((c) => typeof c === 'string');

    expect(texts).toContain('Voiding keeps the record and removes it from totals.');
  });

  it('calls onVoid directly on press, with no intermediate confirmation state', () => {
    const onVoid = vi.fn().mockResolvedValue(undefined);
    const element = TransactionDetailSheet({ visible: true, transaction: baseTransaction, onVoid, onClose: vi.fn() });

    const voidBtn = findByAccessibilityLabel(element, 'Void Transaction');
    voidBtn.props.onPress();

    expect(onVoid).toHaveBeenCalledWith('tx-200');
  });

  it('disables Edit and Void once the transaction is voided', () => {
    const voided: TransactionViewModel = { ...baseTransaction, isVoided: true, badgeColor: '#9CA3AF' };
    const element = TransactionDetailSheet({ visible: true, transaction: voided, onClose: vi.fn() });

    expect(findByAccessibilityLabel(element, 'Edit Transaction').props.disabled).toBe(true);
    expect(findByAccessibilityLabel(element, 'Void Transaction').props.disabled).toBe(true);
  });

  it('does not render a Voided transaction as still countable in a caption (no caption once voided)', () => {
    const voided: TransactionViewModel = { ...baseTransaction, isVoided: true, badgeColor: '#9CA3AF' };
    const element = TransactionDetailSheet({ visible: true, transaction: voided, onClose: vi.fn() });

    const texts = collectNodes(element)
      .map((n) => n.props?.children)
      .filter((c) => typeof c === 'string');

    expect(texts).not.toContain('Voiding keeps the record and removes it from totals.');
  });
});
