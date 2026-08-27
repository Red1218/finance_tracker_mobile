import { BackupSnapshot } from '../../domain/entities/BackupSnapshot';

export interface IDatabaseRestorePort {
  createSafetySnapshot(): Promise<void>;
  restoreDatabase(snapshot: BackupSnapshot): Promise<void>;
  rollbackSafetySnapshot(): Promise<void>;
}
