export interface IBackupFilePort {
  writeBackupFile(filename: string, bytes: Uint8Array): Promise<string>;
  readBackupFile(uri: string): Promise<Uint8Array>;
  pickBackupFile(): Promise<string | null>;
}
