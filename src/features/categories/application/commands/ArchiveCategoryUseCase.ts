import { CategoryId } from '../../domain';
import { ICategoryRepository } from '../repositories/ICategoryRepository';
import { ArchiveCategoryCommand } from './ArchiveCategoryCommand';
import { CategoryNotFoundError } from '../errors/CategoryApplicationError';

export class ArchiveCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {
    Object.freeze(this);
  }

  public async execute(command: ArchiveCategoryCommand): Promise<void> {
    const targetId = command.categoryId || command.id;
    if (!targetId) {
      throw new CategoryNotFoundError('');
    }
    const categoryId = new CategoryId(targetId);
    const getResult = await this.categoryRepository.getById(categoryId);

    if (!getResult.success || !getResult.data) {
      throw new CategoryNotFoundError(targetId);
    }

    const archivedCategory = getResult.data.archive(command.archivedAt);
    const saveResult = await this.categoryRepository.save(archivedCategory);
    if (!saveResult.success) {
      throw saveResult.error;
    }
  }
}
