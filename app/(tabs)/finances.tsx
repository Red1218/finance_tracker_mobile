import React from 'react';
import { ReportingScreen } from '@/src/features/reporting/presentation/screens/ReportingScreen';
import { reportingModule } from '@/src/features/reporting/composition/ReportingModule';

export default function FinancesRoute() {
  return (
    <ReportingScreen
      getDashboardSummaryUseCase={reportingModule.getDashboardSummaryUseCase}
      getCategoryBreakdownUseCase={reportingModule.getCategoryBreakdownUseCase}
      getMonthlyTrendUseCase={reportingModule.getMonthlyTrendUseCase}
      getBudgetPerformanceUseCase={reportingModule.getBudgetPerformanceUseCase}
      getLargestTransactionsUseCase={reportingModule.getLargestTransactionsUseCase}
    />
  );
}
