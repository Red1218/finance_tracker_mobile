import { describe, it, expect } from 'vitest';
import { Category } from '../entities/Category';
import { CategoryId } from '../value-objects/CategoryId';
import { CategoryName } from '../value-objects/CategoryName';
import { CategoryKind } from '../value-objects/CategoryKind';
import { CategoryDomainError } from '../errors/CategoryDomainError';

describe('Category Aggregate', () => {
  const createCategory = (
    kind: CategoryKind = CategoryKind.Expense,
    isSystem = false,
    archivedAt: Date | null = null,
    colorHex: string | null = '#EF4444',
    iconName: string | null = 'fast-food'
  ) => {
    return new Category({
      id: new CategoryId('test-cat-id'),
      name: new CategoryName('Groceries'),
      kind,
      isSystem,
      archivedAt,
      colorHex,
      iconName,
    });
  };

  it('instantiates active Category with derived isArchived getter returning false', () => {
    const category = createCategory();
    expect(category.isArchived).toBe(false);
    expect(category.archivedAt).toBeNull();
    expect(category.colorHex).toBe('#EF4444');
    expect(category.iconName).toBe('fast-food');
  });

  describe('archive', () => {
    it('returns a new archived Category instance with archivedAt set and derived isArchived true', () => {
      const category = createCategory(CategoryKind.Expense, false, null);
      const freezeTime = new Date('2026-07-25T15:00:00.000Z');

      const archived = category.archive(freezeTime);

      expect(archived).not.toBe(category);
      expect(archived.isArchived).toBe(true);
      expect(archived.archivedAt).toEqual(freezeTime);
      expect(archived.id.value).toBe(category.id.value);
    });

    it('throws SYSTEM_CATEGORY_MODIFICATION if attempting to archive a system category', () => {
      const category = createCategory(CategoryKind.Expense, true, null);
      expect(() => category.archive()).toThrowError('System categories cannot be archived.');
    });

    it('throws CATEGORY_ALREADY_ARCHIVED if category is already archived', () => {
      const category = createCategory(CategoryKind.Expense, false, new Date());
      expect(() => category.archive()).toThrowError('Category is already archived.');
    });
  });

  describe('restore', () => {
    it('returns a new active Category instance from an archived category with archivedAt set to null', () => {
      const category = createCategory(CategoryKind.Expense, false, new Date());

      const restored = category.restore();

      expect(restored).not.toBe(category);
      expect(restored.isArchived).toBe(false);
      expect(restored.archivedAt).toBeNull();
    });

    it('throws SYSTEM_CATEGORY_MODIFICATION if attempting to restore a system category', () => {
      const category = createCategory(CategoryKind.Expense, true, new Date());
      expect(() => category.restore()).toThrowError('System categories cannot be mutated.');
    });

    it('throws CATEGORY_NOT_ARCHIVED if category is not archived', () => {
      const category = createCategory(CategoryKind.Expense, false, null);
      expect(() => category.restore()).toThrowError('Category is not archived.');
    });
  });

  describe('rename', () => {
    it('throws SYSTEM_CATEGORY_MODIFICATION if category is a system category', () => {
      const category = createCategory(CategoryKind.Expense, true, null);
      const newName = new CategoryName('New Name');
      expect(() => category.rename(newName)).toThrowError('System categories cannot be renamed.');
    });

    it('returns a new Category instance with the updated name', () => {
      const category = createCategory(CategoryKind.Income, false, null);
      const newName = new CategoryName('Salary');

      const updatedCategory = category.rename(newName);

      expect(updatedCategory).not.toBe(category);
      expect(updatedCategory.name.value).toBe('Salary');
      expect(updatedCategory.kind).toBe(CategoryKind.Income);
      expect(updatedCategory.isArchived).toBe(false);
    });
  });
});
