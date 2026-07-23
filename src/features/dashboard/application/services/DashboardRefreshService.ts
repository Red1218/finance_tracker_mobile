import { RefreshSectionUseCase } from '../use-cases/RefreshSectionUseCase';
import { Logger } from '../ports/Logger';

export class DashboardRefreshService {
  constructor(
    private readonly refreshSectionUseCase: RefreshSectionUseCase,
    private readonly logger: Logger
  ) {}

  /**
   * Called by the Domain Event Handler Service when a domain event occurs
   * that affects specific sections.
   */
  async handleDomainEvent(eventType: string, userId: string, correlationId: string): Promise<void> {
    this.logger.info(`Handling domain event ${eventType} for refresh`, { correlationId });

    // Determine affected sections
    const affectedSections: ('KPI' | 'BudgetHealth' | 'CategoryBreakdown' | 'RecentActivity')[] = [];

    if (eventType === 'TransactionAdded' || eventType === 'TransactionDeleted') {
      affectedSections.push('KPI', 'BudgetHealth', 'CategoryBreakdown', 'RecentActivity');
    } else if (eventType === 'BudgetUpdated') {
      affectedSections.push('BudgetHealth');
    } else if (eventType === 'CategoryUpdated') {
      affectedSections.push('CategoryBreakdown');
    }

    // Refresh affected sections concurrently
    const promises = affectedSections.map(sectionType => 
      this.refreshSectionUseCase.execute({
        correlationId,
        userId,
        sectionType
      }).catch(err => {
        // Suppress individual failures so other sections still update
        this.logger.error(`Error refreshing ${sectionType} from event`, err, { correlationId });
      })
    );

    await Promise.all(promises);
  }
}
