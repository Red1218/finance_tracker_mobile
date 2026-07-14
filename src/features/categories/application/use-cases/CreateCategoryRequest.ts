import { CategoryType } from '../../domain';

export interface CreateCategoryRequest {
  id: string;
  name: string;
  type: CategoryType;
}
