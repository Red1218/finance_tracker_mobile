import { ReportingPeriod } from '../value-objects/ReportingPeriod';

export class ReportingPeriodChangedEvent {
  public readonly occurredOn: Date;
  constructor(
    public readonly dashboardId: string,
    public readonly newPeriod: ReportingPeriod
  ) {
    this.occurredOn = new Date();
  }
}
