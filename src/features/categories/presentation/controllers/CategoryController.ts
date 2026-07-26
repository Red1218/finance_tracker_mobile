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
  ListCategoriesQuery,
  ValidateCategoryForTransactionUseCase,
  ValidateCategoryCommand,
} from '../../application';
import { CategoryKind } from '../../domain';
import { CategoryViewModel } from '../models/CategoryViewModel';
import { CategoryViewModelMapper } from '../mappers/CategoryViewModelMapper';

export class CategoryController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly renameCategoryUseCase: RenameCategoryUseCase,
    private readonly archiveCategoryUseCase: ArchiveCategoryUseCase,
    private readonly restoreCategoryUseCase: RestoreCategoryUseCase,
    private readonly listCategoriesUseCase: ListCategoriesUseCase,
    private readonly validateCategoryForTransactionUseCase: ValidateCategoryForTransactionUseCase
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

  public async listCategories(query?: ListCategoriesQuery): Promise<CategoryViewModel[]> {
    const categories = await this.listCategoriesUseCase.execute(query);
    return CategoryViewModelMapper.mapToViewModels(categories);
  }

  public async validateCategoryForTransaction(
    categoryId: string,
    expectedKind: CategoryKind
  ): Promise<CategoryViewModel> {
    const category = await this.validateCategoryForTransactionUseCase.execute({
      categoryId,
      expectedKind,
    });
    return CategoryViewModelMapper.mapToViewModel(category);
  }
}
