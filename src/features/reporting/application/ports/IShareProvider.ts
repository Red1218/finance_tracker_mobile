export interface IShareProvider {
  shareFile(fileUri: string, mimeType: string, title?: string): Promise<boolean>;
  deleteFile(fileUri: string): Promise<void>;
}
