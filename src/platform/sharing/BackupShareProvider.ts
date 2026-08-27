import * as Sharing from 'expo-sharing';
import { IBackupSharePort } from '../../features/backup/application/ports/IBackupSharePort';

export class BackupShareProvider implements IBackupSharePort {
  public async shareFile(fileUri: string): Promise<void> {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Sharing is not available on this device.');
    }

    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/octet-stream',
      dialogTitle: 'Export Encrypted Finance Tracker Backup',
    });
  }
}
