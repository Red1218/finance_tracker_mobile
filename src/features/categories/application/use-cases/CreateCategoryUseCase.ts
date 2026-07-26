import { ICategoryRepository } from '../repositories/ICategoryRepository';
import { Category, CategoryId, CategoryName, CategoryKind, CategoryDomainError } from '../../domain';
import { Result } from '../../../../platform/persistence';
import { generateUUID } from '../../../../core/utils/uuid';

export interface CreateCategoryCommand {
  id?: string;
  name: string;
  kind: CategoryKind;
  colorHex?: string | null;
  iconName?: string | null;
}

export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {
    Object.freeze(this);
  }

  public async execute(command: CreateCategoryCommand): Promise<Category> {
    const categoryId = new CategoryId(command.id ?? generateUUID());
    const categoryName = new CategoryName(command.name);

    const existsResult = await this.categoryRepository.existsByNameAndKind(categoryName.value, command.kind);
    if (!existsResult.success) {
      throw existsResult.error;
    }

    if (existsResult.data) {
      throw new CategoryDomainError(
        'DUPLICATE_CATEGORY_NAME',
        `A category named "${command.name}" already exists for ${command.kind}.`
      );
    }

    const category = new Category({
      id: categoryId,
      name: categoryName,
      kind: command.kind,
      isSystem: false,
      archivedAt: null,
      colorHex: command.colorHex,
      iconName: command.iconName,
    });

    const saveResult = await this.categoryRepository.save(category);
    if (!saveResult.success) {
      throw saveResult.error;
    }

    return category;
  }
}
