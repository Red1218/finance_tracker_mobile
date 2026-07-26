import { ICategoryRepository } from '../repositories/ICategoryRepository';
import { CategoryId, CategoryDomainError } from '../../domain';

export interface ArchiveCategoryCommand {
  id: string;
  archivedAt?: Date;
}

export class ArchiveCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {
    Object.freeze(this);
  }

  public async execute(command: ArchiveCategoryCommand): Promise<void> {
    const categoryId = new CategoryId(command.id);
    const getResult = await this.categoryRepository.getById(categoryId);

    if (!getResult.success || !getResult.data) {
      throw new CategoryDomainError('CATEGORY_NOT_FOUND', `Category "${command.id}" not found.`);
    }

    const category = getResult.data;
    const archivedCategory = category.archive(command.archivedAt);

    const saveResult = await this.categoryRepository.save(archivedCategory);
    if (!saveResult.success) {
      throw saveResult.error;
    }
  }
}
