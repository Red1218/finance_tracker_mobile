import { Budget } from '../../domain';
import { BudgetSummaryResponse } from '../../application/responses/BudgetSummaryResponse';
import { BudgetViewModel, BudgetSummaryViewModel } from '../types/BudgetViewModel';

export class BudgetViewModelMapper {
  /**
   * Maps the raw Domain entity (or Application DTO) to the Presentation ViewModel.
   * Centralizes formatting for currency, dates, and localized strings.
   */
  public static toViewModel(budget: Budget): BudgetViewModel {
    return {
      id: budget.id.value,
      categoryId: budget.categoryId?.value ?? null,
      amount: budget.amount.value,
      currency: budget.currency.value, // Could apply locale-specific symbol formatting here
      period: budget.period,
      startDate: budget.startDate,
      endDate: budget.endDate,
    };
  }

  /**
   * Maps the Application's BudgetSummaryResponse to the Presentation BudgetSummaryViewModel.
   */
  public static toSummaryViewModel(response: BudgetSummaryResponse): BudgetSummaryViewModel {
    return {
      budget: this.toViewModel(response.budget),
      spentAmount: response.spentAmount, // Could apply currency formatting to strings if needed
      remainingAmount: response.remainingAmount,
      percentageUsed: response.percentageUsed,
      status: response.status,
    };
  }
}
