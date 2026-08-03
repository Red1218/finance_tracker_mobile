import {
  CreateCategoryUseCase,
  CreateCategoryCommand,
  RenameCategoryUseCase,
  RenameCategoryCommand,
  ArchiveCategoryUseCase,
  ArchiveCategoryCommand,
  RestoreCategoryUseCase,
  RestoreCategoryCommand,
  ListCategoriesUseCase,
  CategoryValidationService,
  ICategoryRepository,
} from '../../application';
import { CategoryKind, CategoryId } from '../../domain';
import { CategoryViewModel } from '../models/CategoryViewModel';
import { CategoryViewModelMapper } from '../mappers/CategoryViewModelMapper';
import { CategoryNotFoundError } from '../../application/errors/CategoryApplicationError';

export class CategoryController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly renameCategoryUseCase: RenameCategoryUseCase,
    private readonly archiveCategoryUseCase: ArchiveCategoryUseCase,
    private readonly restoreCategoryUseCase: RestoreCategoryUseCase,
    private readonly listCategoriesUseCase: ListCategoriesUseCase,
    private readonly validateCategoryForTransactionUseCase: CategoryValidationService,
    private readonly categoryRepository?: ICategoryRepository
  ) {
    Object.freeze(this);
  }

  public async createCategory(command: CreateCategoryCommand): Promise<CategoryViewModel> {
    const category = await this.createCategoryUseCase.execute(command);
    return CategoryViewModelMapper.mapToViewModel(category);
  }

  public async renameCategory(command: RenameCategoryCommand): Promise<CategoryViewModel> {
    const category = await this.renameCategoryUseCase.execute(command);
    return CategoryViewModelMapper.mapToViewModel(category);
  }

  public async archiveCategory(command: ArchiveCategoryCommand): Promise<void> {
    await this.archiveCategoryUseCase.execute(command);
  }

  public async restoreCategory(command: RestoreCategoryCommand): Promise<void> {
    await this.restoreCategoryUseCase.execute(command);
  }

  public async listCategories(query?: any): Promise<CategoryViewModel[]> {
    const categories = await this.listCategoriesUseCase.execute(query);
    return CategoryViewModelMapper.mapToViewModels(categories);
  }

  public async validateCategoryForTransaction(
    categoryId: string,
    expectedKind: CategoryKind
  ): Promise<CategoryViewModel> {
    await this.validateCategoryForTransactionUseCase.execute({
      categoryId,
      expectedKind: expectedKind === CategoryKind.Expense ? 'EXPENSE' : 'INCOME',
    });

    if (this.categoryRepository) {
      const getRes = await this.categoryRepository.getById(new CategoryId(categoryId));
      if (getRes.success && getRes.data) {
        return CategoryViewModelMapper.mapToViewModel(getRes.data);
      }
    }

    const categories = await this.listCategoriesUseCase.execute({ includeArchived: true });
    const found = categories.find((c) => c.id === categoryId);
    if (!found) {
      throw new CategoryNotFoundError(categoryId);
    }
    return CategoryViewModelMapper.mapToViewModel(found);
  }
}
