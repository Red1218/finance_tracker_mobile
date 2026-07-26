import { CategoryKind } from '../../domain';

export interface CreateCategoryRequest {
  name: string;
  kind: CategoryKind;
}
