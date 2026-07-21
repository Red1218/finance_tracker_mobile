import { SupabaseCategoryRepository } from '../../../platform/persistence/categories';
import {
  CreateCategoryUseCase,
  RenameCategoryUseCase,
  ArchiveCategoryUseCase,
  RestoreCategoryUseCase,
  ListCategoriesUseCase,
} from '../application';

export class CategoriesModule {
  public readonly createCategoryUseCase: CreateCategoryUseCase;
  public readonly renameCategoryUseCase: RenameCategoryUseCase;
  public readonly archiveCategoryUseCase: ArchiveCategoryUseCase;
  public readonly restoreCategoryUseCase: RestoreCategoryUseCase;
  public readonly listCategoriesUseCase: ListCategoriesUseCase;

  constructor(repository: SupabaseCategoryRepository = new SupabaseCategoryRepository()) {
    this.createCategoryUseCase = new CreateCategoryUseCase(repository);
    this.renameCategoryUseCase = new RenameCategoryUseCase(repository);
    this.archiveCategoryUseCase = new ArchiveCategoryUseCase(repository);
    this.restoreCategoryUseCase = new RestoreCategoryUseCase(repository);
    this.listCategoriesUseCase = new ListCategoriesUseCase(repository);

    Object.freeze(this);
  }
}
