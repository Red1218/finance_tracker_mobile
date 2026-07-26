import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subDays,
  subWeeks,
  subMonths,
  subQuarters,
  subYears,
  differenceInDays,
} from 'date-fns';
import { ReportingPeriod } from '../../domain';

export interface DateRange {
  start: Date;
  end: Date;
}

export type AggregationGranularity = 'DAILY' | 'MONTHLY';

/**
 * Resolves a ReportingPeriod enum value into a concrete { start, end } date range.
 */
export function resolveDateRange(
  period: ReportingPeriod,
  startDate?: Date,
  endDate?: Date
): DateRange {
  const now = new Date();

  switch (period) {
    case ReportingPeriod.TODAY:
      return { start: startOfDay(now), end: endOfDay(now) };

    case ReportingPeriod.WEEK:
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };

    case ReportingPeriod.MONTH:
      return { start: startOfMonth(now), end: endOfMonth(now) };

    case ReportingPeriod.QUARTER: {
      const start = startOfQuarter(now);
      const end = endOfQuarter(now);
      return { start, end };
    }

    case ReportingPeriod.YEAR:
      return { start: startOfYear(now), end: endOfYear(now) };

    case ReportingPeriod.CUSTOM:
      if (!startDate || !endDate) {
        throw new Error('CUSTOM period requires startDate and endDate.');
      }
      return { start: startOfDay(startDate), end: endOfDay(endDate) };
  }
}

/**
 * Resolves the equivalent previous date range for trend comparison.
 */
export function resolvePreviousDateRange(
  period: ReportingPeriod,
  startDate?: Date,
  endDate?: Date
): DateRange {
  const currentRange = resolveDateRange(period, startDate, endDate);

  switch (period) {
    case ReportingPeriod.TODAY: {
      const prev = subDays(currentRange.start, 1);
      return { start: startOfDay(prev), end: endOfDay(prev) };
    }

    case ReportingPeriod.WEEK: {
      const prevStart = subWeeks(currentRange.start, 1);
      const prevEnd = subWeeks(currentRange.end, 1);
      return { start: prevStart, end: prevEnd };
    }

    case ReportingPeriod.MONTH: {
      const prevStart = subMonths(currentRange.start, 1);
      return { start: startOfMonth(prevStart), end: endOfMonth(prevStart) };
    }

    case ReportingPeriod.QUARTER: {
      const prevStart = subQuarters(currentRange.start, 1);
      return { start: startOfQuarter(prevStart), end: endOfQuarter(prevStart) };
    }

    case ReportingPeriod.YEAR: {
      const prevStart = subYears(currentRange.start, 1);
      return { start: startOfYear(prevStart), end: endOfYear(prevStart) };
    }

    case ReportingPeriod.CUSTOM: {
      const days = differenceInDays(currentRange.end, currentRange.start) + 1;
      const prevEnd = subDays(currentRange.start, 1);
      const prevStart = subDays(prevEnd, days - 1);
      return { start: startOfDay(prevStart), end: endOfDay(prevEnd) };
    }
  }
}

/**
 * Resolves whether trend aggregation should be DAILY or MONTHLY based on period and range.
 */
export function resolveAggregationGranularity(
  period: ReportingPeriod,
  startDate?: Date,
  endDate?: Date
): AggregationGranularity {
  switch (period) {
    case ReportingPeriod.TODAY:
    case ReportingPeriod.WEEK:
    case ReportingPeriod.MONTH:
      return 'DAILY';

    case ReportingPeriod.QUARTER:
    case ReportingPeriod.YEAR:
      return 'MONTHLY';

    case ReportingPeriod.CUSTOM: {
      if (!startDate || !endDate) return 'DAILY';
      const days = differenceInDays(endDate, startDate);
      return days <= 31 ? 'DAILY' : 'MONTHLY';
    }
  }
}
