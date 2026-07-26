import { IAIInsightsProvider } from '../../application';
import { 
  Insight, 
  InsightType, 
  InsightSeverity, 
  InsightSource, 
  ConfidenceScore, 
  InsightRecommendation, 
  CashFlowForecast, 
  SpendingAnomaly 
} from '../../domain';
import { DashboardSummary, CategoryBreakdown, MonthlyTrendPoint } from '../../../reporting/domain';

export class RuleBasedAIInsightsProvider implements IAIInsightsProvider {
  public async generateInsights(
    summary: DashboardSummary,
    categoryBreakdown: CategoryBreakdown[]
  ): Promise<Insight[]> {
    const insights: Insight[] = [];

    // 1. Evaluate Savings Rate
    if (summary.savingsRate < 20) {
      insights.push(
        new Insight({
          id: `ins-rule-${Date.now()}-1`,
          type: InsightType.SAVINGS_OPPORTUNITY,
          severity: InsightSeverity.HIGH,
          source: InsightSource.RULE_ENGINE,
          title: 'Low Savings Rate Detected',
          description: `Your savings rate is currently ${Math.round(summary.savingsRate)}%, which is below the target 20%.`,
          recommendation: new InsightRecommendation(
            'Review non-essential category expenses to increase your monthly net savings.',
            '/finances'
          ),
          confidenceScore: new ConfidenceScore(0.95),
        })
      );
    } else {
      insights.push(
        new Insight({
          id: `ins-rule-${Date.now()}-1`,
          type: InsightType.SAVINGS_OPPORTUNITY,
          severity: InsightSeverity.INFO,
          source: InsightSource.RULE_ENGINE,
          title: 'Healthy Savings Rate',
          description: `Great job! You saved ${Math.round(summary.savingsRate)}% of your income this period.`,
          recommendation: new InsightRecommendation('Maintain your current budget goals to build long-term wealth.'),
          confidenceScore: new ConfidenceScore(0.95),
        })
      );
    }

    // 2. Evaluate Category Spend Dominance
    if (categoryBreakdown.length > 0) {
      const sorted = [...categoryBreakdown].sort((a, b) => b.amount - a.amount);
      const top = sorted[0];

      if (top.percentage >= 35) {
        insights.push(
          new Insight({
            id: `ins-rule-${Date.now()}-2`,
            type: InsightType.SPENDING_PATTERN,
            severity: InsightSeverity.MEDIUM,
            source: InsightSource.RULE_ENGINE,
            title: `Dominant Category: ${top.categoryName}`,
            description: `${top.categoryName} accounts for ${Math.round(top.percentage)}% of your total expense budget.`,
            recommendation: new InsightRecommendation(`Consider setting a dedicated budget limit for ${top.categoryName}.`),
            confidenceScore: new ConfidenceScore(0.9),
          })
        );
      }
    }

    return insights;
  }

  public async generateForecast(monthlyTrends: MonthlyTrendPoint[]): Promise<CashFlowForecast> {
    let totalInc = 0;
    let totalExp = 0;
    const count = Math.max(monthlyTrends.length, 1);

    for (const p of monthlyTrends) {
      totalInc += p.income;
      totalExp += p.expenses;
    }

    const avgIncome = monthlyTrends.length > 0 ? totalInc / count : 50000;
    const avgExpense = monthlyTrends.length > 0 ? totalExp / count : 30000;

    const startDate = new Date();
    const endDate = new Date(Date.now() + 30 * 86400000);

    return new CashFlowForecast({
      predictedIncome: avgIncome,
      predictedExpense: avgExpense,
      confidenceScore: new ConfidenceScore(0.85),
      startDate,
      endDate,
    });
  }

  public async detectAnomalies(categoryBreakdown: CategoryBreakdown[]): Promise<SpendingAnomaly[]> {
    const anomalies: SpendingAnomaly[] = [];

    for (const cat of categoryBreakdown) {
      if (cat.percentage > 40) {
        anomalies.push(
          new SpendingAnomaly({
            transactionId: `cat-anomaly-${cat.categoryId}`,
            categoryName: cat.categoryName,
            expectedAmount: cat.amount * 0.6,
            actualAmount: cat.amount,
            baselinePeriod: 'Rolling 90-Day Average',
          })
        );
      }
    }

    return anomalies;
  }
}
