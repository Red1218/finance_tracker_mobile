import { CategoryId } from '../../../categories/domain';

export interface DefaultSettingsProps {
  defaultExpenseCategoryId: CategoryId | null;
  defaultIncomeCategoryId: CategoryId | null;
}

export class DefaultSettings {
  public readonly defaultExpenseCategoryId: CategoryId | null;
  public readonly defaultIncomeCategoryId: CategoryId | null;

  constructor(props: DefaultSettingsProps) {
    this.defaultExpenseCategoryId = props.defaultExpenseCategoryId;
    this.defaultIncomeCategoryId = props.defaultIncomeCategoryId;
    Object.freeze(this);
  }

  public static createDefault(): DefaultSettings {
    return new DefaultSettings({
      defaultExpenseCategoryId: null,
      defaultIncomeCategoryId: null,
    });
  }
}
