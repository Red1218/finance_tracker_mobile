export interface AppInfo {
  version: string;
  buildNumber: string;
  repositoryUrl: string;
  license: string;
}

export interface IAppInfoProvider {
  getAppInfo(): AppInfo;
}

export class AppInfoProvider implements IAppInfoProvider {
  public getAppInfo(): AppInfo {
    return {
      version: '1.0.0',
      buildNumber: '100',
      repositoryUrl: 'https://github.com/Red1218/finance_tracker_mobile',
      license: 'MIT',
    };
  }
}
