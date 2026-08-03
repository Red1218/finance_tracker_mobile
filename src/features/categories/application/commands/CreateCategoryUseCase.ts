import { Category, CategoryId, CategoryName, CategoryKind } from '../../domain';
import { ICategoryRepository } from '../repositories/ICategoryRepository';
import { CreateCategoryCommand } from './CreateCategoryCommand';
import { CategoryDTO } from '../dto/CategoryDTO';
import { CategoryDTOMapper } from '../mappers/CategoryDTOMapper';
import { DuplicateCategoryNameError } from '../errors/CategoryApplicationError';

export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {
    Object.freeze(this);
  }

  public async execute(command: CreateCategoryCommand): Promise<CategoryDTO> {
    const kind = command.kind === 'EXPENSE' ? CategoryKind.Expense : CategoryKind.Income;
    const existsResult = await this.categoryRepository.existsByNameAndKind(command.name, kind);

    if (existsResult.success && existsResult.data) {
      throw new DuplicateCategoryNameError(command.name);
    }

    const category = new Category({
      id: new CategoryId(command.id || crypto.randomUUID()),
      name: new CategoryName(command.name),
      kind,
      isSystem: false,
      colorHex: command.colorHex,
      iconName: command.iconName,
    });

    const saveResult = await this.categoryRepository.save(category);
    if (!saveResult.success) {
      throw saveResult.error;
    }

    return CategoryDTOMapper.toDTO(category);
  }
}
