import { SupabaseCategoryRepository } from '../../../platform/persistence/categories';
import {
  CreateCategoryUseCase,
  RenameCategoryUseCase,
  DeleteCategoryUseCase,
  ListCategoriesUseCase,
} from '../application';

export class CategoriesModule {
  public readonly createCategoryUseCase: CreateCategoryUseCase;
  public readonly renameCategoryUseCase: RenameCategoryUseCase;
  public readonly deleteCategoryUseCase: DeleteCategoryUseCase;
  public readonly listCategoriesUseCase: ListCategoriesUseCase;

  constructor(repository: SupabaseCategoryRepository = new SupabaseCategoryRepository()) {
    this.createCategoryUseCase = new CreateCategoryUseCase(repository);
    this.renameCategoryUseCase = new RenameCategoryUseCase(repository);
    this.deleteCategoryUseCase = new DeleteCategoryUseCase(repository);
    this.listCategoriesUseCase = new ListCategoriesUseCase(repository);
    
    Object.freeze(this);
  }
}
