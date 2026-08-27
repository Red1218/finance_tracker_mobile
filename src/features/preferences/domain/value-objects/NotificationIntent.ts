import { NotificationDestination } from './NotificationDestination';

export type NotificationCategory = 'BILL_DUE_REMINDER' | 'BUDGET_THRESHOLD_ALERT' | 'DAILY_DIGEST';

export interface NotificationIntentProps {
  readonly intentId: string;
  readonly category: NotificationCategory;
  readonly scheduledTime: Date;
  readonly destination: NotificationDestination;
  readonly payload?: Record<string, unknown>;
}

export class NotificationIntent {
  public readonly intentId: string;
  public readonly category: NotificationCategory;
  public readonly scheduledTime: Date;
  public readonly destination: NotificationDestination;
  public readonly payload: Readonly<Record<string, unknown>>;

  constructor(props: NotificationIntentProps) {
    if (!props.intentId || props.intentId.trim().length === 0) {
      throw new Error('NotificationIntent ID is required.');
    }
    if (!props.category) {
      throw new Error('NotificationIntent category is required.');
    }
    if (!props.scheduledTime || isNaN(props.scheduledTime.getTime())) {
      throw new Error('NotificationIntent scheduledTime must be a valid Date.');
    }
    if (!props.destination) {
      throw new Error('NotificationIntent destination is required.');
    }

    this.intentId = props.intentId.trim();
    this.category = props.category;
    this.scheduledTime = new Date(props.scheduledTime.getTime());
    this.destination = props.destination;
    this.payload = Object.freeze(props.payload ? { ...props.payload } : {});

    Object.freeze(this);
  }
}
