export * from './dto/CategoryDTO';
export * from './mappers/CategoryDTOMapper';
export * from './errors/CategoryApplicationError';
export * from './ports/ICategoryRepository';
export * from './services/CategoryValidationService';
export * from './commands/CreateCategoryCommand';
export * from './commands/CreateCategoryUseCase';
export * from './commands/RenameCategoryCommand';
export * from './commands/RenameCategoryUseCase';
export * from './commands/ArchiveCategoryCommand';
export * from './commands/ArchiveCategoryUseCase';
export * from './commands/RestoreCategoryCommand';
export * from './commands/RestoreCategoryUseCase';
export * from './queries/ListCategoriesQueryUseCase';

// Backward-compatibility re-exports
export { ListCategoriesQueryUseCase as ListCategoriesUseCase } from './queries/ListCategoriesQueryUseCase';
export { CategoryValidationService as ValidateCategoryForTransactionUseCase } from './services/CategoryValidationService';

