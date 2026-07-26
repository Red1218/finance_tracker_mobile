import { Theme } from './Theme';

export interface AppearanceSettingsProps {
  theme: Theme;
}

export class AppearanceSettings {
  public readonly theme: Theme;

  constructor(props: AppearanceSettingsProps) {
    this.theme = props.theme;
    Object.freeze(this);
  }

  public static createDefault(): AppearanceSettings {
    return new AppearanceSettings({
      theme: Theme.System,
    });
  }
}
