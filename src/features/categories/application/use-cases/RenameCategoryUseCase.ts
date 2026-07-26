import { ICategoryRepository } from '../repositories/ICategoryRepository';
import { Category, CategoryId, CategoryName, CategoryDomainError } from '../../domain';

export interface RenameCategoryCommand {
  id: string;
  newName: string;
}

export class RenameCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {
    Object.freeze(this);
  }

  public async execute(command: RenameCategoryCommand): Promise<Category> {
    const categoryId = new CategoryId(command.id);
    const newName = new CategoryName(command.newName);

    const getResult = await this.categoryRepository.getById(categoryId);
    if (!getResult.success || !getResult.data) {
      throw new CategoryDomainError('CATEGORY_NOT_FOUND', `Category "${command.id}" not found.`);
    }

    const category = getResult.data;

    const existsResult = await this.categoryRepository.existsByNameAndKind(
      newName.value,
      category.kind,
      category.id.value
    );

    if (!existsResult.success) {
      throw existsResult.error;
    }

    if (existsResult.data) {
      throw new CategoryDomainError(
        'DUPLICATE_CATEGORY_NAME',
        `A category named "${command.newName}" already exists for ${category.kind}.`
      );
    }

    const updatedCategory = category.rename(newName);
    const saveResult = await this.categoryRepository.save(updatedCategory);
    if (!saveResult.success) {
      throw saveResult.error;
    }

    return updatedCategory;
  }
}
