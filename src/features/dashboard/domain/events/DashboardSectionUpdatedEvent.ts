export class DashboardSectionUpdatedEvent {
  public readonly occurredOn: Date;
  constructor(
    public readonly dashboardId: string,
    public readonly sectionId: string
  ) {
    this.occurredOn = new Date();
  }
}
