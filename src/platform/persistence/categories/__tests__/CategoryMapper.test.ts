import { describe, it, expect } from 'vitest';
import { CategoryMapper } from '../CategoryMapper';
import { Category, CategoryId, CategoryName, CategoryType } from '../../../../features/categories/domain';
import { CategoryRow } from '../../../../features/categories/contracts';

describe('CategoryMapper', () => {
  it('should map from Row to Entity correctly (active)', () => {
    const row: CategoryRow = {
      id: 'test-id-123',
      name: 'Groceries',
      type: CategoryType.Custom,
      is_archived: false,
    };

    const entity = CategoryMapper.toDomain(row);

    expect(entity).toBeInstanceOf(Category);
    expect(entity.id.value).toBe('test-id-123');
    expect(entity.name.value).toBe('Groceries');
    expect(entity.type).toBe(CategoryType.Custom);
    expect(entity.isArchived).toBe(false);
  });

  it('should map from Row to Entity correctly (archived)', () => {
    const row: CategoryRow = {
      id: 'test-id-archived',
      name: 'Old Transport',
      type: CategoryType.Custom,
      is_archived: true,
    };

    const entity = CategoryMapper.toDomain(row);

    expect(entity.isArchived).toBe(true);
  });

  it('should map from Entity to Row correctly (active)', () => {
    const entity = new Category({
      id: new CategoryId('test-id-123'),
      name: new CategoryName('Groceries'),
      type: CategoryType.Custom,
      isArchived: false,
    });

    const row = CategoryMapper.toPersistence(entity);

    expect(row).toEqual({
      id: 'test-id-123',
      name: 'Groceries',
      type: CategoryType.Custom,
      is_archived: false,
    });
  });

  it('should map from Entity to Row correctly (archived)', () => {
    const entity = new Category({
      id: new CategoryId('test-id-archived'),
      name: new CategoryName('Old Transport'),
      type: CategoryType.Custom,
      isArchived: true,
    });

    const row = CategoryMapper.toPersistence(entity);

    expect(row.is_archived).toBe(true);
  });

  it('should map Protected categories correctly', () => {
    const row: CategoryRow = {
      id: 'test-id-protected',
      name: 'Transfer',
      type: CategoryType.Protected,
      is_archived: false,
    };

    const entity = CategoryMapper.toDomain(row);

    expect(entity.type).toBe(CategoryType.Protected);
    expect(entity.isArchived).toBe(false);
  });

  it('should maintain symmetry (Entity → Row → Entity)', () => {
    const originalEntity = new Category({
      id: new CategoryId('symmetric-id'),
      name: new CategoryName('Symmetric Name'),
      type: CategoryType.Custom,
      isArchived: false,
    });

    const row = CategoryMapper.toPersistence(originalEntity);
    const restoredEntity = CategoryMapper.toDomain(row);

    expect(restoredEntity.id.value).toBe(originalEntity.id.value);
    expect(restoredEntity.name.value).toBe(originalEntity.name.value);
    expect(restoredEntity.type).toBe(originalEntity.type);
    expect(restoredEntity.isArchived).toBe(originalEntity.isArchived);
  });
});
