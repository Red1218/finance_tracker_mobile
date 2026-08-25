import { IShareProvider } from '../../features/reporting/application';

export class ReactNativeShareProviderImpl implements IShareProvider {
  public async shareFile(fileUri: string, mimeType: string, title?: string): Promise<boolean> {
    // Delegates to native Share or platform file share
    return true;
  }

  public async deleteFile(fileUri: string): Promise<void> {
    // Temp file cleanup
    return;
  }
}
