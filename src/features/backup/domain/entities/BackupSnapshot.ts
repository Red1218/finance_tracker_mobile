import { BackupManifest } from '../value-objects/BackupManifest';

export interface BackupSnapshotProps {
  readonly manifest: BackupManifest;
  readonly accounts: ReadonlyArray<Record<string, unknown>>;
  readonly categories: ReadonlyArray<Record<string, unknown>>;
  readonly transactions: ReadonlyArray<Record<string, unknown>>;
  readonly budgets: ReadonlyArray<Record<string, unknown>>;
  readonly bills: ReadonlyArray<Record<string, unknown>>;
}

export class BackupSnapshot {
  public readonly manifest: BackupManifest;
  public readonly accounts: ReadonlyArray<Record<string, unknown>>;
  public readonly categories: ReadonlyArray<Record<string, unknown>>;
  public readonly transactions: ReadonlyArray<Record<string, unknown>>;
  public readonly budgets: ReadonlyArray<Record<string, unknown>>;
  public readonly bills: ReadonlyArray<Record<string, unknown>>;

  constructor(props: BackupSnapshotProps) {
    if (!props.manifest) {
      throw new Error('BackupSnapshot manifest is required.');
    }
    if (!Array.isArray(props.accounts)) {
      throw new Error('BackupSnapshot accounts must be an array.');
    }
    if (!Array.isArray(props.categories)) {
      throw new Error('BackupSnapshot categories must be an array.');
    }
    if (!Array.isArray(props.transactions)) {
      throw new Error('BackupSnapshot transactions must be an array.');
    }
    if (!Array.isArray(props.budgets)) {
      throw new Error('BackupSnapshot budgets must be an array.');
    }
    if (!Array.isArray(props.bills)) {
      throw new Error('BackupSnapshot bills must be an array.');
    }

    this.manifest = props.manifest;
    this.accounts = Object.freeze([...props.accounts]);
    this.categories = Object.freeze([...props.categories]);
    this.transactions = Object.freeze([...props.transactions]);
    this.budgets = Object.freeze([...props.budgets]);
    this.bills = Object.freeze([...props.bills]);

    Object.freeze(this);
  }
}
