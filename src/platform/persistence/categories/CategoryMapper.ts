import { Category, CategoryId, CategoryName, CategoryKind } from '../../../features/categories/domain';
import { CategoryRow } from '../../../features/categories/contracts/CategoryRow';

export class CategoryMapper {
  public static toDomain(row: CategoryRow): Category {
    return new Category({
      id: new CategoryId(row.id),
      name: new CategoryName(row.name),
      kind: row.type === 'income' ? CategoryKind.Income : CategoryKind.Expense,
      isSystem: row.is_system,
      archivedAt: row.archived_at ? new Date(row.archived_at) : null,
      colorHex: row.color_hex ?? null,
      iconName: row.icon_name ?? null,
    });
  }

  public static toPersistence(entity: Category): CategoryRow {
    return {
      id: entity.id.value,
      name: entity.name.value,
      type: entity.kind === CategoryKind.Income ? 'income' : 'expense',
      is_system: entity.isSystem,
      archived_at: entity.archivedAt ? entity.archivedAt.toISOString() : null,
      color_hex: entity.colorHex,
      icon_name: entity.iconName,
    };
  }
}
