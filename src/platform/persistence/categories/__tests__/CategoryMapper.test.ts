import { describe, it, expect } from 'vitest';
import { CategoryMapper } from '../CategoryMapper';
import { Category, CategoryId, CategoryName, CategoryKind } from '../../../../features/categories/domain';
import { CategoryRow } from '../../../../features/categories/contracts/CategoryRow';

describe('CategoryMapper', () => {
  it('should map from Row (EXPENSE) to Domain entity correctly', () => {
    const row: CategoryRow = {
      id: 'cat-123',
      name: 'Groceries',
      kind: 'EXPENSE',
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

  it('should map from Row (INCOME, system) to Domain entity correctly', () => {
    const row: CategoryRow = {
      id: 'cat-456',
      name: 'Salary',
      kind: 'INCOME',
      is_system: true,
      archived_at: null,
    };

    const entity = CategoryMapper.toDomain(row);

    expect(entity.kind).toBe(CategoryKind.Income);
    expect(entity.isSystem).toBe(true);
    expect(entity.isArchived).toBe(false);
  });

  it('should map from Domain entity (Expense) to Row correctly', () => {
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
      kind: 'EXPENSE',
      is_system: false,
      archived_at: null,
      color_hex: '#EF4444',
      icon_name: 'cart',
    });
  });

  it('should map from Domain entity (Income, system, archived) to Row correctly', () => {
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
      kind: 'INCOME',
      is_system: true,
      archived_at: '2026-07-25T12:00:00.000Z',
      color_hex: null,
      icon_name: null,
    });
  });

  it('should throw for an unrecognised category_kind value from the database', () => {
    const row = {
      id: 'cat-corrupt',
      name: 'Corrupt',
      kind: 'expense', // legacy lowercase value must not be silently coerced
      is_system: false,
      archived_at: null,
    } as unknown as CategoryRow;

    expect(() => CategoryMapper.toDomain(row)).toThrowError(
      'Unknown category_kind value from database: "expense"'
    );
  });

  describe('Round-trip Symmetry', () => {
    it('should maintain round-trip symmetry: Row -> Domain -> Row (EXPENSE)', () => {
      const originalRow: CategoryRow = {
        id: 'cat-rt-1',
        name: 'Dining Out',
        kind: 'EXPENSE',
        is_system: false,
        archived_at: null,
        color_hex: null,
        icon_name: null,
      };

      const entity = CategoryMapper.toDomain(originalRow);
      expect(entity.kind).toBe(CategoryKind.Expense);
      const mappedRow = CategoryMapper.toPersistence(entity);

      expect(mappedRow).toEqual(originalRow);
    });

    it('should maintain round-trip symmetry: Row -> Domain -> Row (INCOME)', () => {
      const originalRow: CategoryRow = {
        id: 'cat-rt-2',
        name: 'Salary',
        kind: 'INCOME',
        is_system: false,
        archived_at: null,
        color_hex: null,
        icon_name: null,
      };

      const entity = CategoryMapper.toDomain(originalRow);
      expect(entity.kind).toBe(CategoryKind.Income);
      const mappedRow = CategoryMapper.toPersistence(entity);

      expect(mappedRow).toEqual(originalRow);
    });

    it('should maintain round-trip symmetry: Domain (Expense) -> Row -> Domain', () => {
      const originalEntity = new Category({
        id: new CategoryId('cat-rt-3'),
        name: new CategoryName('Groceries'),
        kind: CategoryKind.Expense,
        isSystem: false,
        archivedAt: null,
      });

      const row = CategoryMapper.toPersistence(originalEntity);
      expect(row.kind).toBe('EXPENSE');
      const restoredEntity = CategoryMapper.toDomain(row);

      expect(restoredEntity.kind).toBe(CategoryKind.Expense);
    });

    it('should maintain round-trip symmetry: Domain (Income) -> Row -> Domain', () => {
      const freezeTime = new Date('2026-07-25T10:00:00.000Z');
      const originalEntity = new Category({
        id: new CategoryId('cat-rt-4'),
        name: new CategoryName('Investment Income'),
        kind: CategoryKind.Income,
        isSystem: false,
        archivedAt: freezeTime,
      });

      const row = CategoryMapper.toPersistence(originalEntity);
      expect(row.kind).toBe('INCOME');
      const restoredEntity = CategoryMapper.toDomain(row);

      expect(restoredEntity.id.value).toBe(originalEntity.id.value);
      expect(restoredEntity.name.value).toBe(originalEntity.name.value);
      expect(restoredEntity.kind).toBe(originalEntity.kind);
      expect(restoredEntity.isSystem).toBe(originalEntity.isSystem);
      expect(restoredEntity.isArchived).toBe(true);
      expect(restoredEntity.archivedAt?.toISOString()).toBe(freezeTime.toISOString());
    });

    it('an INCOME database row must never be mapped to CategoryKind.Expense', () => {
      const incomeRow: CategoryRow = {
        id: 'cat-income-guard',
        name: 'Salary',
        kind: 'INCOME',
        is_system: false,
        archived_at: null,
      };

      const entity = CategoryMapper.toDomain(incomeRow);

      expect(entity.kind).toBe(CategoryKind.Income);
      expect(entity.kind).not.toBe(CategoryKind.Expense);
    });
  });
});
