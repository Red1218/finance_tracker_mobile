import { describe, it, expect } from 'vitest';
import { CommandValidator } from '../../validation/CommandValidator';
import { ChangeReportingPeriodCommand } from '../../commands/ChangeReportingPeriodCommand';

describe('CommandValidator', () => {
  it('should validate LoadDashboardCommand successfully', () => {
    expect(() => CommandValidator.validateLoadDashboard({
      correlationId: '123',
      userId: 'user1'
    })).not.toThrow();
  });

  it('should throw on LoadDashboardCommand missing correlationId', () => {
    expect(() => CommandValidator.validateLoadDashboard({
      correlationId: '',
      userId: 'user1'
    })).toThrow('Missing correlationId');
  });

  it('should validate ChangeReportingPeriodCommand successfully', () => {
    expect(() => CommandValidator.validateChangeReportingPeriod({
      correlationId: '123',
      userId: 'user1',
      periodType: 'CURRENT_MONTH'
    })).not.toThrow();
  });

  it('should throw on ChangeReportingPeriodCommand missing custom dates', () => {
    expect(() => CommandValidator.validateChangeReportingPeriod({
      correlationId: '123',
      userId: 'user1',
      periodType: 'CUSTOM'
    })).toThrow('CUSTOM period requires customStartDate and customEndDate');
  });

  it('should throw if custom dates are inverted', () => {
    expect(() => CommandValidator.validateChangeReportingPeriod({
      correlationId: '123',
      userId: 'user1',
      periodType: 'CUSTOM',
      customStartDate: new Date('2026-02-01'),
      customEndDate: new Date('2026-01-01')
    })).toThrow('customStartDate cannot be after customEndDate');
  });
});
