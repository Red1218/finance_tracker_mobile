import { CategoryId } from '../../domain';
import { ICategoryRepository } from '../repositories/ICategoryRepository';
import { RestoreCategoryCommand } from './RestoreCategoryCommand';
import { CategoryNotFoundError } from '../errors/CategoryApplicationError';

export class RestoreCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {
    Object.freeze(this);
  }

  public async execute(command: RestoreCategoryCommand): Promise<void> {
    const targetId = command.categoryId || command.id;
    if (!targetId) {
      throw new CategoryNotFoundError('');
    }
    const categoryId = new CategoryId(targetId);
    const getResult = await this.categoryRepository.getById(categoryId);

    if (!getResult.success || !getResult.data) {
      throw new CategoryNotFoundError(targetId);
    }

    const restoredCategory = getResult.data.restore();
    const saveResult = await this.categoryRepository.save(restoredCategory);
    if (!saveResult.success) {
      throw saveResult.error;
    }
  }
}
