import { ICategoryRepository } from '../repositories/ICategoryRepository';
import { Category, CategoryKind } from '../../domain';

export interface ListCategoriesQuery {
  kind?: CategoryKind;
  includeArchived?: boolean;
}

export class ListCategoriesUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {
    Object.freeze(this);
  }

  public async execute(query?: ListCategoriesQuery): Promise<Category[]> {
    const result = await this.categoryRepository.getAll(
      query?.kind,
      query?.includeArchived ?? false
    );

    if (!result.success) {
      throw result.error;
    }

    return result.data;
  }
}
