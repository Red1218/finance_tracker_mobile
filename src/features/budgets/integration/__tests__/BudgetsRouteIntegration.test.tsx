import React from 'react';
import { describe, it, expect, vi } from 'vitest';



import { BudgetsRouteContainer } from '../BudgetsRouteContainer';
import { BudgetsModule } from '../../composition/BudgetsModule';
import { InMemoryBudgetRepository } from '../../application/__tests__/InMemoryBudgetRepository';
import { InMemoryCategoryRepository } from '../../../categories/application/__tests__/InMemoryCategoryRepository';
import { InMemoryTransactionRepository } from '../../../transactions/application/__tests__/InMemoryTransactionRepository';

vi.mock('@react-native-community/datetimepicker', () => ({
  default: () => null,
}));

vi.mock('@/src/shared/components', () => ({
  AppBar: ({ title }: { title: string }) => <>{title}</>,
  Card: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  FAB: ({ onPress }: { onPress: () => void }) => <>{'FAB'}</>,
  Icon: () => null,
  StatusIndicator: ({ label }: { label: string }) => <>{label}</>,
}));

describe('BudgetsRouteIntegration Container Wiring', () => {
  it('instantiates BudgetsRouteContainer with BudgetsModule dependency boundary', () => {
    const budgetRepo = new InMemoryBudgetRepository();
    const categoryRepo = new InMemoryCategoryRepository();
    const txRepo = new InMemoryTransactionRepository();
    const module = new BudgetsModule(budgetRepo, categoryRepo, txRepo);

    const container = BudgetsRouteContainer({ module }) as React.ReactElement<any>;
    expect(container).toBeTruthy();
    expect(container.props.module).toBe(module);


  });
});
