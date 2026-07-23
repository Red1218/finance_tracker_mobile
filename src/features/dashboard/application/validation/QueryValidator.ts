import { GetDashboardQuery } from '../queries/GetDashboardQuery';
import { GetDashboardSectionQuery } from '../queries/GetDashboardSectionQuery';

export class QueryValidator {
  static validateGetDashboard(query: GetDashboardQuery): void {
    if (!query.correlationId) throw new Error('Missing correlationId');
    if (!query.userId) throw new Error('Missing userId');
  }

  static validateGetDashboardSection(query: GetDashboardSectionQuery): void {
    if (!query.correlationId) throw new Error('Missing correlationId');
    if (!query.userId) throw new Error('Missing userId');
    if (!query.sectionType) throw new Error('Missing sectionType');
  }
}
