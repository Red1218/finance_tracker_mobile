import { describe, it, expect, vi } from 'vitest';
import { theme } from '../../../../../shared/theme/theme';

vi.mock('expo-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));
vi.mock('../../../../../shared/theme', () => ({
  useTheme: () => theme,
}));



vi.mock('../../../../../shared/components/Icon', () => ({
  Icon: ({ name }: { name: string }) => null,
}));
import { QuickActionsSection } from '../../components/sections/QuickActionsSection';

describe('QuickActionsSection Component Presentation', () => {
  it('renders Card primitive with Add Transaction and Manage Budgets action buttons', () => {
    const onActionMock = vi.fn();
    const cardElement = QuickActionsSection({ onAction: onActionMock });

    expect(cardElement.type.name).toBe('Card');
    expect(cardElement.props.variant).toBe('elevated');

    const container = cardElement.props.children;
    const buttons = container.props.children;

    expect(buttons).toHaveLength(2);

    // 1. Add Transaction
    const addTxButton = buttons[0];
    expect(addTxButton.props.accessibilityLabel).toBe('Add Transaction');
    expect(addTxButton.props.accessibilityRole).toBe('button');
    expect(addTxButton.key).toBe('ADD_TRANSACTION');

    // 2. Manage Budgets
    const manageBudgetsButton = buttons[1];
    expect(manageBudgetsButton.props.accessibilityLabel).toBe('Manage Budgets');
    expect(manageBudgetsButton.props.accessibilityRole).toBe('button');
    expect(manageBudgetsButton.key).toBe('MANAGE_BUDGETS');
  });

  it('triggers router navigation for Add Transaction when pressed', () => {
    const cardElement = QuickActionsSection({});
    const buttons = cardElement.props.children.props.children;

    buttons[0].props.onPress();
  });


  it('triggers onNavigateToCreateTransaction when pressed if provided and bypasses onAction', () => {
    const onNavigateMock = vi.fn();
    const onActionMock = vi.fn();
    const cardElement = QuickActionsSection({
      onNavigateToCreateTransaction: onNavigateMock,
      onAction: onActionMock,
    });
    const buttons = cardElement.props.children.props.children;

    buttons[0].props.onPress();
    expect(onNavigateMock).toHaveBeenCalled();
    expect(onActionMock).not.toHaveBeenCalled();
  });

  it('triggers onNavigateToBudgets when pressed if provided and bypasses onAction', () => {
    const onNavigateMock = vi.fn();
    const onActionMock = vi.fn();
    const cardElement = QuickActionsSection({
      onNavigateToBudgets: onNavigateMock,
      onAction: onActionMock,
    });
    const buttons = cardElement.props.children.props.children;

    buttons[1].props.onPress();
    expect(onNavigateMock).toHaveBeenCalled();
    expect(onActionMock).not.toHaveBeenCalled();
  });
});
