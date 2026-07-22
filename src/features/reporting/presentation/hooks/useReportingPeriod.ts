import { useState, useCallback } from 'react';
import { ReportingPeriod } from '../../domain';

export interface ReportingPeriodState {
  reportingPeriod: ReportingPeriod;
  customStartDate: Date | undefined;
  customEndDate: Date | undefined;
  setReportingPeriod: (period: ReportingPeriod) => void;
  setCustomRange: (start: Date, end: Date) => void;
}

/**
 * useReportingPeriod
 *
 * Owns the ReportingScreen's period-selection state.
 * Child components receive this state as immutable props — they never mutate it.
 */
export function useReportingPeriod(
  initial: ReportingPeriod = ReportingPeriod.CURRENT_MONTH
): ReportingPeriodState {
  const [reportingPeriod, setReportingPeriodState] = useState<ReportingPeriod>(initial);
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);

  const setReportingPeriod = useCallback((period: ReportingPeriod) => {
    setReportingPeriodState(period);
    if (period !== ReportingPeriod.CUSTOM) {
      setCustomStartDate(undefined);
      setCustomEndDate(undefined);
    }
  }, []);

  const setCustomRange = useCallback((start: Date, end: Date) => {
    setReportingPeriodState(ReportingPeriod.CUSTOM);
    setCustomStartDate(start);
    setCustomEndDate(end);
  }, []);

  return { reportingPeriod, customStartDate, customEndDate, setReportingPeriod, setCustomRange };
}
