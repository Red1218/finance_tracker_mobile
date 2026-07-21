import { Category, CategoryId, CategoryName } from '../../../features/categories/domain';
import { CategoryRow } from '../../../features/categories/contracts';

export class CategoryMapper {
  public static toDomain(row: CategoryRow): Category {
    return new Category({
      id: new CategoryId(row.id),
      name: new CategoryName(row.name),
      type: row.type,
      isArchived: row.is_archived,
    });
  }

  public static toPersistence(entity: Category): CategoryRow {
    return {
      id: entity.id.value,
      name: entity.name.value,
      type: entity.type,
      is_archived: entity.isArchived,
    };
  }
}
