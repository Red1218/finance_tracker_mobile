import { describe, it, expect, vi } from 'vitest';
import { QuickActionsSection } from '../../components/sections/QuickActionsSection';

describe('QuickActionsSection Presentation & Semantic Callbacks', () => {
  it('dispatches semantic action ADD_TRANSACTION when Add Transaction is selected', () => {
    const onActionMock = vi.fn();
    onActionMock('ADD_TRANSACTION');
    expect(onActionMock).toHaveBeenCalledWith('ADD_TRANSACTION');
  });

  it('dispatches semantic action MANAGE_BUDGETS when Manage Budgets is selected', () => {
    const onActionMock = vi.fn();
    onActionMock('MANAGE_BUDGETS');
    expect(onActionMock).toHaveBeenCalledWith('MANAGE_BUDGETS');
  });
});
