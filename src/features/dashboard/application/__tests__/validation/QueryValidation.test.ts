import { describe, it, expect } from 'vitest';
import { QueryValidator } from '../../validation/QueryValidator';

describe('QueryValidator', () => {
  it('should validate GetDashboardQuery successfully', () => {
    expect(() => QueryValidator.validateGetDashboard({
      correlationId: '123',
      userId: 'user1'
    })).not.toThrow();
  });

  it('should throw on GetDashboardQuery missing userId', () => {
    expect(() => QueryValidator.validateGetDashboard({
      correlationId: '123',
      userId: ''
    })).toThrow('Missing userId');
  });

  it('should validate GetDashboardSectionQuery successfully', () => {
    expect(() => QueryValidator.validateGetDashboardSection({
      correlationId: '123',
      userId: 'user1',
      sectionType: 'KPI'
    })).not.toThrow();
  });

  it('should throw on GetDashboardSectionQuery missing sectionType', () => {
    expect(() => QueryValidator.validateGetDashboardSection({
      correlationId: '123',
      userId: 'user1',
      sectionType: '' as any
    })).toThrow('Missing sectionType');
  });
});
