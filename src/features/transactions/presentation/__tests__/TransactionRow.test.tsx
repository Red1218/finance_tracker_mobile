import { describe, it, expect, vi } from 'vitest';
import { theme } from '../../../../shared/theme/theme';

vi.mock('@/src/shared/theme', () => ({ useTheme: () => theme }));
vi.mock('@/src/shared/components', () => ({
  Icon: (props: any) => ({ type: 'Icon', key: null, props }),
}));

import { TransactionRow } from '../components/TransactionRow';
import { TransactionViewModel } from '../models/TransactionViewModel';

const baseTransaction: TransactionViewModel = {
  id: 'tx-101',
  accountId: 'acc-1',
  categoryId: 'cat-1',
  type: 'EXPENSE',
  typeLabel: 'Expense',
  amount: 450,
  formattedAmount: '-₹450.00',
  currencyCode: 'INR',
  description: 'Grocery Supermarket',
  transferGroupId: null,
  transactionDateIso: '2026-08-15T10:00:00Z',
  formattedDate: 'Aug 15, 2026',
  isVoided: false,
  badgeColor: '#EF4444',
  formattedCreatedTime: '9:13 AM',
};

// Renders the component as a plain function call and inspects the real
// element tree it returns. No renderer/DOM is set up in this project's
// Vitest config (see vitest.config.ts) — this still exercises the actual
// component code and its real style/prop output, unlike the previous
// version of this file, which only asserted against a standalone mock
// object and never invoked TransactionRow at all.
function renderRow(overrides: Partial<TransactionViewModel> = {}, onPress = vi.fn()) {
  const transaction = { ...baseTransaction, ...overrides };
  const element: any = TransactionRow({ transaction, onPress });
  return { element, transaction, onPress };
}

function flattenStyle(style: any): Record<string, unknown> {
  return Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean).map(flattenStyle)) : style || {};
}

describe('TransactionRow', () => {
  it('is a hairline row, not a bordered card', () => {
    const { element } = renderRow();
    const rootStyle = flattenStyle(element.props.style);

    expect(rootStyle.borderWidth).toBeUndefined();
    expect(rootStyle.backgroundColor).toBeUndefined();
    expect(rootStyle.borderBottomWidth).toBe(1);
    expect(rootStyle.borderBottomColor).toBe(theme.colors.divider);
    expect(rootStyle.minHeight).toBe(56);
  });

  it('renders the description and formatted amount', () => {
    const { element } = renderRow();
    const [, detailsView, amountView] = element.props.children;
    const [descriptionText] = detailsView.props.children;

    expect(descriptionText.props.children).toBe('Grocery Supermarket');
    expect(amountView.props.children.props.children).toBe('-₹450.00');
  });

  it('colors the amount and icon success-green for income', () => {
    const { element } = renderRow({ type: 'INCOME', typeLabel: 'Income', formattedAmount: '+₹1,200.00' });
    const [iconContainer, , amountView] = element.props.children;
    const icon = iconContainer.props.children;
    const amountText = amountView.props.children;

    expect(icon.props.color).toBe(theme.colors.success);
    expect(icon.props.name).toBe('ArrowDownLeft');
    expect(flattenStyle(amountText.props.style).color).toBe(theme.colors.success);
  });

  it('colors the icon brandPrimary for transfers', () => {
    const { element } = renderRow({ type: 'TRANSFER_OUT', typeLabel: 'Transfer Out' });
    const [iconContainer] = element.props.children;

    expect(iconContainer.props.children.props.color).toBe(theme.colors.brandPrimary);
    expect(iconContainer.props.children.props.name).toBe('ArrowRightLeft');
  });

  it('mutes a voided transaction and strikes through the amount, never signaling with color alone', () => {
    const { element } = renderRow({ isVoided: true });
    const [iconContainer, , amountView] = element.props.children;
    const amountText = amountView.props.children;
    const amountStyle = flattenStyle(amountText.props.style);

    expect(iconContainer.props.children.props.color).toBe(theme.colors.textMuted);
    expect(amountStyle.color).toBe(theme.colors.textMuted);
    expect(amountStyle.textDecorationLine).toBe('line-through');
  });

  it('puts the icon badge on the surfaceElevatedBadge ramp step, not a hardcoded fill', () => {
    const { element } = renderRow();
    const [iconContainer] = element.props.children;

    expect(flattenStyle(iconContainer.props.style).backgroundColor).toBe(theme.colors.surfaceElevatedBadge);
  });

  it('invokes onPress with the transaction when pressed', () => {
    const { element, transaction, onPress } = renderRow();
    element.props.onPress();

    expect(onPress).toHaveBeenCalledWith(transaction);
  });

  it('disables the touchable when no onPress handler is provided', () => {
    const transaction = { ...baseTransaction };
    const element: any = TransactionRow({ transaction, onPress: undefined });

    expect(element.props.disabled).toBe(true);
  });

  it('exposes the description and amount as a single accessible label', () => {
    const { element } = renderRow();

    expect(element.props.accessibilityLabel).toBe('Grocery Supermarket, -₹450.00');
  });
});
