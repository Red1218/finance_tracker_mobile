import { ICategoryRepository } from '../repositories/ICategoryRepository';
import { CategoryId, CategoryDomainError } from '../../domain';

export interface RestoreCategoryCommand {
  id: string;
}

export class RestoreCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {
    Object.freeze(this);
  }

  public async execute(command: RestoreCategoryCommand): Promise<void> {
    const categoryId = new CategoryId(command.id);
    const getResult = await this.categoryRepository.getById(categoryId);

    if (!getResult.success || !getResult.data) {
      throw new CategoryDomainError('CATEGORY_NOT_FOUND', `Category "${command.id}" not found.`);
    }

    const category = getResult.data;
    const restoredCategory = category.restore();

    const saveResult = await this.categoryRepository.save(restoredCategory);
    if (!saveResult.success) {
      throw saveResult.error;
    }
  }
}
