import { CategoryKind } from '../../domain';
import { ICategoryRepository } from '../repositories/ICategoryRepository';
import { CategoryDTO } from '../dto/CategoryDTO';
import { CategoryDTOMapper } from '../mappers/CategoryDTOMapper';

export class ListCategoriesQueryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {
    Object.freeze(this);
  }

  public async execute(
    kindOrFilter?: 'INCOME' | 'EXPENSE' | { kind?: any; includeArchived?: boolean },
    includeArchived: boolean = false
  ): Promise<CategoryDTO[]> {
    let domainKind: CategoryKind | undefined;
    let incArchived = includeArchived;

    if (typeof kindOrFilter === 'string') {
      domainKind = kindOrFilter === 'EXPENSE' ? CategoryKind.Expense : CategoryKind.Income;
    } else if (kindOrFilter && typeof kindOrFilter === 'object') {
      if (typeof kindOrFilter.kind === 'string') {
        domainKind = kindOrFilter.kind === 'EXPENSE' ? CategoryKind.Expense : CategoryKind.Income;
      } else {
        domainKind = kindOrFilter.kind;
      }
      incArchived = kindOrFilter.includeArchived ?? false;
    }

    const result = typeof (this.categoryRepository as any).getAll === 'function'
      ? await (this.categoryRepository as any).getAll(domainKind, incArchived)
      : await this.categoryRepository.list(incArchived, domainKind);

    if (!result.success) {
      throw result.error;
    }

    return result.data.map((cat: any) => CategoryDTOMapper.toDTO(cat));
  }
}
