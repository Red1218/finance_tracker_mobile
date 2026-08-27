export interface IBackupSharePort {
  shareFile(fileUri: string): Promise<void>;
}
