import { describe, it, expect } from 'vitest';
import { CategoryMapper } from '../CategoryMapper';
import { Category, CategoryId, CategoryName, CategoryType } from '../../../../features/categories/domain';
import { CategoryRow } from '../../../../features/categories/contracts';

describe('CategoryMapper', () => {
  it('should map from Row to Entity correctly', () => {
    const row: CategoryRow = {
      id: 'test-id-123',
      name: 'Groceries',
      type: CategoryType.Custom,
    };

    const entity = CategoryMapper.toDomain(row);

    expect(entity).toBeInstanceOf(Category);
    expect(entity.id.value).toBe('test-id-123');
    expect(entity.name.value).toBe('Groceries');
    expect(entity.type).toBe(CategoryType.Custom);
  });

  it('should map from Entity to Row correctly', () => {
    const entity = new Category({
      id: new CategoryId('test-id-123'),
      name: new CategoryName('Groceries'),
      type: CategoryType.Custom,
    });

    const row = CategoryMapper.toPersistence(entity);

    expect(row).toEqual({
      id: 'test-id-123',
      name: 'Groceries',
      type: CategoryType.Custom,
    });
  });

  it('should map from Row to Entity correctly for Protected categories', () => {
    const row: CategoryRow = {
      id: 'test-id-protected',
      name: 'Transfer',
      type: CategoryType.Protected,
    };

    const entity = CategoryMapper.toDomain(row);

    expect(entity.type).toBe(CategoryType.Protected);
  });

  it('should map from Entity to Row correctly for Protected categories', () => {
    const entity = new Category({
      id: new CategoryId('test-id-protected'),
      name: new CategoryName('Transfer'),
      type: CategoryType.Protected,
    });

    const row = CategoryMapper.toPersistence(entity);

    expect(row).toEqual({
      id: 'test-id-protected',
      name: 'Transfer',
      type: CategoryType.Protected,
    });
  });

  it('should maintain symmetry (Entity -> Row -> Entity)', () => {
    const originalEntity = new Category({
      id: new CategoryId('symmetric-id'),
      name: new CategoryName('Symmetric Name'),
      type: CategoryType.Custom,
    });

    const row = CategoryMapper.toPersistence(originalEntity);
    const restoredEntity = CategoryMapper.toDomain(row);

    expect(restoredEntity.id.value).toBe(originalEntity.id.value);
    expect(restoredEntity.name.value).toBe(originalEntity.name.value);
    expect(restoredEntity.type).toBe(originalEntity.type);
  });
});
