import { Category, CategoryKind } from '../../domain';
import { CategoryDTO } from '../../application/dto/CategoryDTO';
import { CategoryViewModel } from '../models/CategoryViewModel';

export class CategoryViewModelMapper {
  public static mapToViewModel(input: Category | CategoryDTO): CategoryViewModel {
    if (!input) return null as any;

    const isDto = typeof input.id === 'string' && typeof input.name === 'string';

    const idStr = isDto ? (input as CategoryDTO).id : (input as Category).id.value;
    const nameStr = isDto ? (input as CategoryDTO).name : (input as Category).name.value;
    const kindStr = isDto
      ? (input as CategoryDTO).kind
      : (input as Category).kind === CategoryKind.Income ? 'INCOME' : 'EXPENSE';
    const isSystemBool = isDto ? (input as CategoryDTO).isSystem : (input as Category).isSystem;
    const isArchivedBool = isDto ? (input as CategoryDTO).isArchived : (input as Category).isArchived;
    const archivedAtIso = isDto
      ? (input as CategoryDTO).archivedAt
      : ((input as Category).archivedAt ? (input as Category).archivedAt!.toISOString() : null);

    return {
      id: idStr,
      name: nameStr,
      kind: kindStr as 'INCOME' | 'EXPENSE',
      isSystem: isSystemBool,
      isArchived: isArchivedBool,
      archivedAt: archivedAtIso,
      colorHex: input.colorHex,
      iconName: input.iconName,
    };
  }

  public static mapToViewModels(categories: (Category | CategoryDTO)[]): CategoryViewModel[] {
    return categories.map((c) => CategoryViewModelMapper.mapToViewModel(c));
  }
}
