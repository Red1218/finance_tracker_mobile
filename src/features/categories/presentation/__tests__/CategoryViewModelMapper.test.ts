import { describe, it, expect } from 'vitest';
import { CategoryViewModelMapper } from '../mappers/CategoryViewModelMapper';
import { Category, CategoryId, CategoryName, CategoryKind } from '../../domain';

describe('CategoryViewModelMapper', () => {
  it('maps active custom category aggregate to view model correctly', () => {
    const category = new Category({
      id: new CategoryId('cat-1'),
      name: new CategoryName('Groceries'),
      kind: CategoryKind.Expense,
      isSystem: false,
      archivedAt: null,
      colorHex: '#EF4444',
      iconName: 'cart',
    });

    const vm = CategoryViewModelMapper.mapToViewModel(category);

    expect(vm).toEqual({
      id: 'cat-1',
      name: 'Groceries',
      kind: 'EXPENSE',
      isSystem: false,
      isArchived: false,
      archivedAt: null,
      colorHex: '#EF4444',
      iconName: 'cart',
    });
  });

  it('maps archived system category aggregate to view model correctly', () => {
    const freezeTime = new Date('2026-07-25T16:00:00.000Z');
    const category = new Category({
      id: new CategoryId('cat-sys'),
      name: new CategoryName('Uncategorized Income'),
      kind: CategoryKind.Income,
      isSystem: true,
      archivedAt: freezeTime,
    });

    const vm = CategoryViewModelMapper.mapToViewModel(category);

    expect(vm).toEqual({
      id: 'cat-sys',
      name: 'Uncategorized Income',
      kind: 'INCOME',
      isSystem: true,
      isArchived: true,
      archivedAt: '2026-07-25T16:00:00.000Z',
      colorHex: null,
      iconName: null,
    });
  });

  it('maps an array of categories using mapToViewModels', () => {
    const list = [
      new Category({
        id: new CategoryId('cat-1'),
        name: new CategoryName('Food'),
        kind: CategoryKind.Expense,
        isSystem: false,
        archivedAt: null,
      }),
      new Category({
        id: new CategoryId('cat-2'),
        name: new CategoryName('Salary'),
        kind: CategoryKind.Income,
        isSystem: false,
        archivedAt: null,
      }),
    ];

    const vms = CategoryViewModelMapper.mapToViewModels(list);
    expect(vms).toHaveLength(2);
    expect(vms[0].kind).toBe('EXPENSE');
    expect(vms[1].kind).toBe('INCOME');
  });
});
