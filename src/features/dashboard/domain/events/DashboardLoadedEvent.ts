export class DashboardLoadedEvent {
  public readonly occurredOn: Date;
  constructor(public readonly dashboardId: string) {
    this.occurredOn = new Date();
  }
}
