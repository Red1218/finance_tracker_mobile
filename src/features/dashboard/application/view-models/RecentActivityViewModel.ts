import { SectionViewModel } from './SectionViewModel';

export interface RecentActivityRow {
  readonly description: string;
  readonly categoryName: string;
  readonly date: string;
  readonly amount: string;
  readonly direction: 'Income' | 'Expense';
}

export interface RecentActivityData {
  readonly rows: RecentActivityRow[];
  readonly hasMore: boolean;
}

export interface RecentActivityViewModel extends SectionViewModel<RecentActivityData> {
  readonly sectionType: 'RecentActivity';
}
