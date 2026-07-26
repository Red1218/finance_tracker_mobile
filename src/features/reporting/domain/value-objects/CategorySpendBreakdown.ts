import { ReportingDomainError } from '../errors/ReportingDomainError';

export class CategorySpendBreakdown {
  public readonly categoryId: string;
  public readonly categoryName: string;
  public readonly spentAmount: number;
  public readonly percentage: number;

  constructor(props: {
    categoryId: string;
    categoryName: string;
    spentAmount: number;
    percentage: number;
  }) {
    if (!props.categoryId || props.categoryId.trim().length === 0) {
      throw new ReportingDomainError('INSUFFICIENT_DATA', 'Category ID is required for breakdown.');
    }
    if (!props.categoryName || props.categoryName.trim().length === 0) {
      throw new ReportingDomainError('INSUFFICIENT_DATA', 'Category name is required for breakdown.');
    }
    if (typeof props.spentAmount !== 'number' || isNaN(props.spentAmount) || props.spentAmount < 0) {
      throw new ReportingDomainError('INSUFFICIENT_DATA', 'Spent amount must be a valid non-negative number.');
    }
    if (typeof props.percentage !== 'number' || isNaN(props.percentage) || props.percentage < 0 || props.percentage > 100) {
      throw new ReportingDomainError('INSUFFICIENT_DATA', 'Percentage must be between 0 and 100.');
    }

    this.categoryId = props.categoryId.trim();
    this.categoryName = props.categoryName.trim();
    this.spentAmount = Math.round(props.spentAmount * 100) / 100;
    this.percentage = Math.round(props.percentage * 100) / 100;

    Object.freeze(this);
  }
}
