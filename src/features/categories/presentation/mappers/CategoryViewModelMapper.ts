import { Category, CategoryKind } from '../../domain';
import { CategoryViewModel } from '../models/CategoryViewModel';

export class CategoryViewModelMapper {
  public static mapToViewModel(category: Category): CategoryViewModel {
    return {
      id: category.id.value,
      name: category.name.value,
      kind: category.kind === CategoryKind.Income ? 'INCOME' : 'EXPENSE',
      isSystem: category.isSystem,
      isArchived: category.isArchived,
      archivedAt: category.archivedAt ? category.archivedAt.toISOString() : null,
      colorHex: category.colorHex,
      iconName: category.iconName,
    };
  }

  public static mapToViewModels(categories: Category[]): CategoryViewModel[] {
    return categories.map(CategoryViewModelMapper.mapToViewModel);
  }
}
