import { describe, it, expect } from 'vitest';
import { CategoryMapper } from '../CategoryMapper';
import { Category, CategoryId, CategoryName, CategoryKind } from '../../../../features/categories/domain';
import { CategoryRow } from '../../../../features/categories/contracts/CategoryRow';

describe('CategoryMapper', () => {
  it('should map from Row (expense) to Domain entity correctly', () => {
    const row: CategoryRow = {
      id: 'cat-123',
      name: 'Groceries',
      type: 'expense',
      is_system: false,
      archived_at: null,
      color_hex: '#EF4444',
      icon_name: 'cart',
    };

    const entity = CategoryMapper.toDomain(row);

    expect(entity).toBeInstanceOf(Category);
    expect(entity.id.value).toBe('cat-123');
    expect(entity.name.value).toBe('Groceries');
    expect(entity.kind).toBe(CategoryKind.Expense);
    expect(entity.isSystem).toBe(false);
    expect(entity.isArchived).toBe(false);
    expect(entity.archivedAt).toBeNull();
    expect(entity.colorHex).toBe('#EF4444');
    expect(entity.iconName).toBe('cart');
  });

  it('should map from Row (income, system) to Domain entity correctly', () => {
    const row: CategoryRow = {
      id: 'cat-456',
      name: 'Salary',
      type: 'income',
      is_system: true,
      archived_at: null,
    };

    const entity = CategoryMapper.toDomain(row);

    expect(entity.kind).toBe(CategoryKind.Income);
    expect(entity.isSystem).toBe(true);
    expect(entity.isArchived).toBe(false);
  });

  it('should map from Domain entity (expense) to Row correctly', () => {
    const entity = new Category({
      id: new CategoryId('cat-123'),
      name: new CategoryName('Groceries'),
      kind: CategoryKind.Expense,
      isSystem: false,
      archivedAt: null,
      colorHex: '#EF4444',
      iconName: 'cart',
    });

    const row = CategoryMapper.toPersistence(entity);

    expect(row).toEqual({
      id: 'cat-123',
      name: 'Groceries',
      type: 'expense',
      is_system: false,
      archived_at: null,
      color_hex: '#EF4444',
      icon_name: 'cart',
    });
  });

  it('should map from Domain entity (income, system, archived) to Row correctly', () => {
    const freezeTime = new Date('2026-07-25T12:00:00.000Z');
    const entity = new Category({
      id: new CategoryId('cat-system'),
      name: new CategoryName('System Income'),
      kind: CategoryKind.Income,
      isSystem: true,
      archivedAt: freezeTime,
    });

    const row = CategoryMapper.toPersistence(entity);

    expect(row).toEqual({
      id: 'cat-system',
      name: 'System Income',
      type: 'income',
      is_system: true,
      archived_at: '2026-07-25T12:00:00.000Z',
      color_hex: null,
      icon_name: null,
    });
  });

  describe('Round-trip Symmetry', () => {
    it('should maintain round-trip symmetry: Row -> Domain -> Row (Expense)', () => {
      const originalRow: CategoryRow = {
        id: 'cat-rt-1',
        name: 'Dining Out',
        type: 'expense',
        is_system: false,
        archived_at: null,
        color_hex: null,
        icon_name: null,
      };

      const entity = CategoryMapper.toDomain(originalRow);
      const mappedRow = CategoryMapper.toPersistence(entity);

      expect(mappedRow).toEqual(originalRow);
    });

    it('should maintain round-trip symmetry: Domain -> Row -> Domain', () => {
      const freezeTime = new Date('2026-07-25T10:00:00.000Z');
      const originalEntity = new Category({
        id: new CategoryId('cat-rt-3'),
        name: new CategoryName('Investment Income'),
        kind: CategoryKind.Income,
        isSystem: false,
        archivedAt: freezeTime,
      });

      const row = CategoryMapper.toPersistence(originalEntity);
      const restoredEntity = CategoryMapper.toDomain(row);

      expect(restoredEntity.id.value).toBe(originalEntity.id.value);
      expect(restoredEntity.name.value).toBe(originalEntity.name.value);
      expect(restoredEntity.kind).toBe(originalEntity.kind);
      expect(restoredEntity.isSystem).toBe(originalEntity.isSystem);
      expect(restoredEntity.isArchived).toBe(true);
      expect(restoredEntity.archivedAt?.toISOString()).toBe(freezeTime.toISOString());
    });
  });
});
