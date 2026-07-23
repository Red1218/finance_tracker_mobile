import { SectionViewModel } from './SectionViewModel';

export interface CategoryBreakdownRow {
  readonly categoryName: string;
  readonly amountSpent: string;
  readonly proportion: number;
  readonly rank: number;
  readonly displayIcon: string;
}

export interface CategoryBreakdownViewModel extends SectionViewModel<CategoryBreakdownRow[]> {
  readonly sectionType: 'CategoryBreakdown';
}
