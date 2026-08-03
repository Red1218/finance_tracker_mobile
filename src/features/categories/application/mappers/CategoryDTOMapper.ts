import { Category } from '../../domain';
import { CategoryDTO } from '../dto/CategoryDTO';

export class CategoryDTOMapper {
  public static toDTO(category: Category): CategoryDTO {
    return Object.freeze({
      id: category.id.value,
      name: category.name.value,
      kind: category.kind,
      isSystem: category.isSystem,
      isArchived: category.isArchived,
      colorHex: category.colorHex,
      iconName: category.iconName,
      archivedAt: category.archivedAt ? category.archivedAt.toISOString() : null,
    });
  }
}
