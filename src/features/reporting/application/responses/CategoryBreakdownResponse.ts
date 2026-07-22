export interface CategoryBreakdownItem {
  readonly categoryId: string;
  readonly categoryName: string;
  readonly amount: number;
  readonly percentage: number;
  readonly transactionCount: number;
}

export interface CategoryBreakdownResponse {
  readonly items: readonly CategoryBreakdownItem[];
}
