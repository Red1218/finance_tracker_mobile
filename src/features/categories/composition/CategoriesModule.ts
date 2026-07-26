import { SupabaseCategoryRepository } from '../../../platform/persistence/categories';
import {
  ICategoryRepository,
  CreateCategoryUseCase,
  RenameCategoryUseCase,
  ArchiveCategoryUseCase,
  RestoreCategoryUseCase,
  ListCategoriesUseCase,
  ValidateCategoryForTransactionUseCase,
} from '../application';
import { CategoryController } from '../presentation/controllers/CategoryController';

export class CategoriesModule {
  public readonly createCategoryUseCase: CreateCategoryUseCase;
  public readonly renameCategoryUseCase: RenameCategoryUseCase;
  public readonly archiveCategoryUseCase: ArchiveCategoryUseCase;
  public readonly restoreCategoryUseCase: RestoreCategoryUseCase;
  public readonly listCategoriesUseCase: ListCategoriesUseCase;
  public readonly validateCategoryForTransactionUseCase: ValidateCategoryForTransactionUseCase;
  public readonly controller: CategoryController;

  constructor(repository: ICategoryRepository = new SupabaseCategoryRepository()) {
    this.createCategoryUseCase = new CreateCategoryUseCase(repository);
    this.renameCategoryUseCase = new RenameCategoryUseCase(repository);
    this.archiveCategoryUseCase = new ArchiveCategoryUseCase(repository);
    this.restoreCategoryUseCase = new RestoreCategoryUseCase(repository);
    this.listCategoriesUseCase = new ListCategoriesUseCase(repository);
    this.validateCategoryForTransactionUseCase = new ValidateCategoryForTransactionUseCase(repository);

    this.controller = new CategoryController(
      this.createCategoryUseCase,
      this.renameCategoryUseCase,
      this.archiveCategoryUseCase,
      this.restoreCategoryUseCase,
      this.listCategoriesUseCase,
      this.validateCategoryForTransactionUseCase
    );

    Object.freeze(this);
  }
}
