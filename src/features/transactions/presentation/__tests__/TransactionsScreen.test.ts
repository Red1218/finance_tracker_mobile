import { describe, it, expect } from 'vitest';
import { TransactionViewModel } from '../models/TransactionViewModel';
import { filterTransactions, formatGroupTotal, groupTransactionsByDate } from '../screens/TransactionsScreen';

// This screen has no working component-render path in this project's test
// setup (TransactionsScreen uses real useState; there is no react-test-renderer
// installed, so it can't even be invoked as a bare function the way the
// hook-free presentational components in this feature can - see
// TransactionRow.test.tsx / TransactionDateGroup.test.tsx). Its previous test
// file never actually exercised the screen either way - every case
// reimplemented trivial logic inline against local mock data, or called a
// standalone vi.fn() and asserted it had been called.
//
// filterTransactions / groupTransactionsByDate / formatGroupTotal are
// exported from TransactionsScreen.tsx specifically so this file can test
// the screen's actual filtering/grouping/total logic for real, even though
// its JSX output remains unverified by this suite.

function makeTransaction(overrides: Partial<TransactionViewModel>): TransactionViewModel {
  return {
    id: 'tx-1',
    accountId: 'acc-1',
    categoryId: 'cat-1',
    type: 'EXPENSE',
    typeLabel: 'Expense',
    amount: 500,
    formattedAmount: '-₹500.00',
    currencyCode: 'INR',
    description: 'Groceries',
    transferGroupId: null,
    transactionDateIso: '2026-08-20T10:00:00Z',
    formattedDate: 'Aug 20, 2026',
    isVoided: false,
    badgeColor: '#EF4444',
    formattedCreatedTime: '9:13 AM',
    ...overrides,
  };
}

describe('filterTransactions', () => {
  const groceries = makeTransaction({ id: 'tx-1', description: 'Groceries', type: 'EXPENSE', typeLabel: 'Expense' });
  const salary = makeTransaction({ id: 'tx-2', description: 'Monthly Salary', type: 'INCOME', typeLabel: 'Income' });
  const transferOut = makeTransaction({ id: 'tx-3', description: 'Rent transfer', type: 'TRANSFER_OUT', typeLabel: 'Transfer Out' });
  const transferIn = makeTransaction({ id: 'tx-4', description: 'Rent transfer', type: 'TRANSFER_IN', typeLabel: 'Transfer In' });
  const all = [groceries, salary, transferOut, transferIn];

  it('matches by description, case-insensitively', () => {
    expect(filterTransactions(all, 'groceries', 'ALL')).toEqual([groceries]);
  });

  it('matches by type label when the query does not match the description', () => {
    expect(filterTransactions(all, 'income', 'ALL')).toEqual([salary]);
  });

  it('filters to EXPENSE only', () => {
    expect(filterTransactions(all, '', 'EXPENSE')).toEqual([groceries]);
  });

  it('filters to INCOME only', () => {
    expect(filterTransactions(all, '', 'INCOME')).toEqual([salary]);
  });

  it('filters to TRANSFER, matching both TRANSFER_OUT and TRANSFER_IN', () => {
    expect(filterTransactions(all, '', 'TRANSFER')).toEqual([transferOut, transferIn]);
  });

  it('combines search and type filter', () => {
    expect(filterTransactions(all, 'rent', 'TRANSFER')).toEqual([transferOut, transferIn]);
    expect(filterTransactions(all, 'rent', 'EXPENSE')).toEqual([]);
  });
});

describe('formatGroupTotal', () => {
  it('sums non-voided outflows as negative', () => {
    const total = formatGroupTotal([
      makeTransaction({ type: 'EXPENSE', amount: 480 }),
      makeTransaction({ type: 'EXPENSE', amount: 600 }),
    ]);
    expect(total).toBe('-₹1,080.00');
  });

  it('sums income as positive', () => {
    const total = formatGroupTotal([makeTransaction({ type: 'INCOME', amount: 62000 })]);
    expect(total).toBe('+₹62,000.00');
  });

  it('nets outflows against inflows in the same group', () => {
    const total = formatGroupTotal([
      makeTransaction({ type: 'EXPENSE', amount: 100 }),
      makeTransaction({ type: 'INCOME', amount: 40 }),
    ]);
    expect(total).toBe('-₹60.00');
  });

  it('excludes voided transactions entirely, matching the spec mockup', () => {
    // 07-visual-refresh.md §6.2 / 2a-transactions.png: a struck-through,
    // voided -₹18,000 transfer does not count toward its group's total.
    const total = formatGroupTotal([
      makeTransaction({ type: 'EXPENSE', amount: 2340, isVoided: false }),
      makeTransaction({ type: 'TRANSFER_OUT', amount: 18000, isVoided: true }),
    ]);
    expect(total).toBe('-₹2,340.00');
  });

  it('returns a zero total for an empty or fully-voided group', () => {
    expect(formatGroupTotal([])).toBe('+₹0.00');
    expect(formatGroupTotal([makeTransaction({ type: 'EXPENSE', amount: 500, isVoided: true })])).toBe('+₹0.00');
  });
});

describe('groupTransactionsByDate', () => {
  it('groups by formattedDate, preserving first-seen order, with each group carrying its own total', () => {
    const todayCoffee = makeTransaction({ id: 't1', formattedDate: 'Aug 24, 2026', type: 'EXPENSE', amount: 480 });
    const todayMetro = makeTransaction({ id: 't2', formattedDate: 'Aug 24, 2026', type: 'EXPENSE', amount: 600 });
    const yesterdaySalary = makeTransaction({ id: 't3', formattedDate: 'Aug 23, 2026', type: 'INCOME', amount: 62000 });

    const groups = groupTransactionsByDate([todayCoffee, todayMetro, yesterdaySalary]);

    expect(groups).toEqual([
      { dateLabel: 'Aug 24, 2026', data: [todayCoffee, todayMetro], totalLabel: '-₹1,080.00' },
      { dateLabel: 'Aug 23, 2026', data: [yesterdaySalary], totalLabel: '+₹62,000.00' },
    ]);
  });

  it('falls back to a "Recent" group when formattedDate is empty', () => {
    const tx = makeTransaction({ formattedDate: '' });
    expect(groupTransactionsByDate([tx])).toEqual([{ dateLabel: 'Recent', data: [tx], totalLabel: '-₹500.00' }]);
  });

  it('returns no groups for an empty transaction list', () => {
    expect(groupTransactionsByDate([])).toEqual([]);
  });
});
