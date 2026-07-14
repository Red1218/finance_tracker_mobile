import { CategoryType } from '../../domain';

export interface CreateCategoryRequest {
  name: string;
  type: CategoryType;
}
