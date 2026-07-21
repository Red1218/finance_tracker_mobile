import { describe, it, expect } from 'vitest';
import { Category } from '../entities/Category';
import { CategoryId } from '../value-objects/CategoryId';
import { CategoryName } from '../value-objects/CategoryName';
import { CategoryType } from '../value-objects/CategoryType';
import { CategoryDomainError } from '../errors/CategoryDomainError';

describe('Category', () => {
  const createCategory = (type: CategoryType, isArchived = false) => {
    return new Category({
      id: new CategoryId('test-id'),
      name: new CategoryName('Groceries'),
      type,
      isArchived,
    });
  };

  describe('archive', () => {
    it('should return a new archived Category instance for a custom category', () => {
      const category = createCategory(CategoryType.Custom, false);

      const archived = category.archive();

      expect(archived).not.toBe(category);
      expect(archived.isArchived).toBe(true);
      expect(archived.id).toBe(category.id);
      expect(archived.name).toBe(category.name);
      expect(archived.type).toBe(category.type);
    });

    it('should throw PROTECTED_CATEGORY_MODIFICATION if category is protected', () => {
      const category = createCategory(CategoryType.Protected);

      expect(() => category.archive()).toThrowError(CategoryDomainError);
      expect(() => category.archive()).toThrowError('Protected categories cannot be archived.');
    });

    it('should throw CATEGORY_ALREADY_ARCHIVED if category is already archived', () => {
      const category = createCategory(CategoryType.Custom, true);

      expect(() => category.archive()).toThrowError(CategoryDomainError);
      expect(() => category.archive()).toThrowError('Category is already archived.');
    });
  });

  describe('restore', () => {
    it('should return a new active Category instance from an archived category', () => {
      const category = createCategory(CategoryType.Custom, true);

      const restored = category.restore();

      expect(restored).not.toBe(category);
      expect(restored.isArchived).toBe(false);
      expect(restored.id).toBe(category.id);
      expect(restored.name).toBe(category.name);
      expect(restored.type).toBe(category.type);
    });

    it('should throw CATEGORY_NOT_ARCHIVED if category is not archived', () => {
      const category = createCategory(CategoryType.Custom, false);

      expect(() => category.restore()).toThrowError(CategoryDomainError);
      expect(() => category.restore()).toThrowError('Category is not archived.');
    });
  });

  describe('rename', () => {
    it('should throw PROTECTED_CATEGORY_MODIFICATION if category is protected', () => {
      const category = createCategory(CategoryType.Protected);
      const newName = new CategoryName('New Name');

      expect(() => category.rename(newName)).toThrowError(CategoryDomainError);
      expect(() => category.rename(newName)).toThrowError('Protected categories cannot be renamed.');
    });

    it('should return a new Category instance with the updated name', () => {
      const category = createCategory(CategoryType.Custom);
      const newName = new CategoryName('New Name');

      const updatedCategory = category.rename(newName);

      expect(updatedCategory).not.toBe(category);
      expect(updatedCategory.name.value).toBe('New Name');
      expect(updatedCategory.id).toBe(category.id);
      expect(updatedCategory.type).toBe(category.type);
      expect(updatedCategory.isArchived).toBe(category.isArchived);
    });
  });
});
