import { describe, it, expect } from 'vitest';
import { Category } from '../entities/Category';
import { CategoryId } from '../value-objects/CategoryId';
import { CategoryName } from '../value-objects/CategoryName';
import { CategoryType } from '../value-objects/CategoryType';
import { CategoryDomainError } from '../errors/CategoryDomainError';

describe('Category', () => {
  const createCategory = (type: CategoryType) => {
    return new Category({
      id: new CategoryId('test-id'),
      name: new CategoryName('Groceries'),
      type,
    });
  };

  describe('validateDeletion', () => {
    it('should throw CategoryDomainError if category is protected', () => {
      const category = createCategory(CategoryType.Protected);

      expect(() => category.validateDeletion()).toThrowError(CategoryDomainError);
      expect(() => category.validateDeletion()).toThrowError('Protected categories cannot be deleted.');
    });

    it('should not throw if category is custom', () => {
      const category = createCategory(CategoryType.Custom);

      expect(() => category.validateDeletion()).not.toThrow();
    });
  });

  describe('rename', () => {
    it('should throw CategoryDomainError if category is protected', () => {
      const category = createCategory(CategoryType.Protected);
      const newName = new CategoryName('New Name');

      expect(() => category.rename(newName)).toThrowError(CategoryDomainError);
      expect(() => category.rename(newName)).toThrowError('Protected categories cannot be renamed.');
    });

    it('should return a new Category instance with the updated name if custom', () => {
      const category = createCategory(CategoryType.Custom);
      const newName = new CategoryName('New Name');

      const updatedCategory = category.rename(newName);

      expect(updatedCategory).not.toBe(category);
      expect(updatedCategory.name.value).toBe('New Name');
      expect(updatedCategory.id).toBe(category.id);
      expect(updatedCategory.type).toBe(category.type);
    });
  });
});
