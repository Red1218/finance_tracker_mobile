import { CategoryId, CategoryName } from '../../domain';
import { ICategoryRepository } from '../repositories/ICategoryRepository';
import { RenameCategoryCommand } from './RenameCategoryCommand';
import { CategoryDTO } from '../dto/CategoryDTO';
import { CategoryDTOMapper } from '../mappers/CategoryDTOMapper';
import { CategoryNotFoundError, DuplicateCategoryNameError } from '../errors/CategoryApplicationError';

export class RenameCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {
    Object.freeze(this);
  }

  public async execute(command: RenameCategoryCommand): Promise<CategoryDTO> {
    const targetId = command.categoryId || command.id;
    if (!targetId) {
      throw new CategoryNotFoundError('');
    }
    const categoryId = new CategoryId(targetId);
    const getResult = await this.categoryRepository.getById(categoryId);

    if (!getResult.success || !getResult.data) {
      throw new CategoryNotFoundError(targetId);
    }

    const category = getResult.data;
    const existsResult = await this.categoryRepository.existsByNameAndKind(
      command.newName,
      category.kind,
      command.categoryId
    );

    if (existsResult.success && existsResult.data) {
      throw new DuplicateCategoryNameError(command.newName);
    }

    const updatedCategory = category.rename(new CategoryName(command.newName));
    const saveResult = await this.categoryRepository.save(updatedCategory);
    if (!saveResult.success) {
      throw saveResult.error;
    }

    return CategoryDTOMapper.toDTO(updatedCategory);
  }
}
