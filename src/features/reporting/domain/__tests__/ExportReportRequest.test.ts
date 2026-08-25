import { describe, it, expect } from 'vitest';
import { ExportReportRequest } from '../value-objects/ExportReportRequest';
import { ReportingDomainError } from '../errors/ReportingDomainError';

describe('ExportReportRequest', () => {
  it('creates valid PDF export request', () => {
    const start = new Date('2026-01-01');
    const end = new Date('2026-01-31');
    const req = new ExportReportRequest({
      format: 'pdf',
      startDate: start,
      endDate: end,
      categoryId: 'cat-123',
    });

    expect(req.format).toBe('pdf');
    expect(req.startDate).toEqual(start);
    expect(req.endDate).toEqual(end);
    expect(req.categoryId).toBe('cat-123');
  });

  it('throws error when startDate is after endDate', () => {
    const start = new Date('2026-02-01');
    const end = new Date('2026-01-01');
    expect(() => {
      new ExportReportRequest({
        format: 'csv',
        startDate: start,
        endDate: end,
      });
    }).toThrow(ReportingDomainError);
  });
});
