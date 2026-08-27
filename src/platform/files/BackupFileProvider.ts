import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import { IBackupFilePort } from '../../features/backup/application/ports/IBackupFilePort';

export class BackupFileProvider implements IBackupFilePort {
  public async writeBackupFile(filename: string, bytes: Uint8Array): Promise<string> {
    const dir = FileSystem.documentDirectory || FileSystem.cacheDirectory || '';
    const fileUri = `${dir}${filename}`;

    // Convert Uint8Array to base64 string for FileSystem write
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = typeof btoa === 'function' ? btoa(binary) : Buffer.from(bytes).toString('base64');

    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return fileUri;
  }

  public async readBackupFile(uri: string): Promise<Uint8Array> {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const binary = typeof atob === 'function' ? atob(base64) : Buffer.from(base64, 'base64').toString('binary');
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
  }

  public async pickBackupFile(): Promise<string | null> {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    return result.assets[0].uri;
  }
}
