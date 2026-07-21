import { CategoryType } from '../domain';

export interface CategoryRow {
  id: string;
  name: string;
  type: CategoryType;
  is_archived: boolean;
}
