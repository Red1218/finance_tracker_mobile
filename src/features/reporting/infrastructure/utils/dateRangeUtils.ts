import {
  startOfMonth, endOfMonth,
  subMonths,
  startOfDay, endOfDay,
} from 'date-fns';
import { ReportingPeriod } from '../../domain';

export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Resolves a ReportingPeriod enum value into a concrete { start, end } date range.
 * Uses date-fns — the project's existing date utility library.
 * For CUSTOM periods the caller must supply startDate and endDate.
 */
export function resolveDateRange(
  period: ReportingPeriod,
  startDate?: Date,
  endDate?: Date
): DateRange {
  const now = new Date();

  switch (period) {
    case ReportingPeriod.CURRENT_MONTH:
      return { start: startOfMonth(now), end: endOfMonth(now) };

    case ReportingPeriod.PREVIOUS_MONTH: {
      const prev = subMonths(now, 1);
      return { start: startOfMonth(prev), end: endOfMonth(prev) };
    }

    case ReportingPeriod.LAST_3_MONTHS: {
      const threeMonthsAgo = subMonths(now, 3);
      return { start: startOfMonth(threeMonthsAgo), end: endOfMonth(now) };
    }

    case ReportingPeriod.LAST_6_MONTHS: {
      const sixMonthsAgo = subMonths(now, 6);
      return { start: startOfMonth(sixMonthsAgo), end: endOfMonth(now) };
    }

    case ReportingPeriod.LAST_12_MONTHS: {
      const twelveMonthsAgo = subMonths(now, 12);
      return { start: startOfMonth(twelveMonthsAgo), end: endOfMonth(now) };
    }

    case ReportingPeriod.CUSTOM:
      if (!startDate || !endDate) {
        throw new Error('CUSTOM period requires startDate and endDate.');
      }
      return { start: startOfDay(startDate), end: endOfDay(endDate) };
  }
}
