export interface BackupManifestProps {
  readonly manifestVersion: string;
  readonly createdAt: Date;
  readonly appVersion: string;
  readonly schemaVersion: number;
  readonly entityCounts: Readonly<Record<string, number>>;
}

export class BackupManifest {
  public readonly manifestVersion: string;
  public readonly createdAt: Date;
  public readonly appVersion: string;
  public readonly schemaVersion: number;
  public readonly entityCounts: Readonly<Record<string, number>>;

  constructor(props: BackupManifestProps) {
    if (!props.manifestVersion || props.manifestVersion.trim().length === 0) {
      throw new Error('BackupManifest version is required.');
    }
    if (!props.createdAt || isNaN(props.createdAt.getTime())) {
      throw new Error('BackupManifest createdAt must be a valid Date.');
    }
    if (typeof props.schemaVersion !== 'number' || props.schemaVersion <= 0) {
      throw new Error('BackupManifest schemaVersion must be a positive integer.');
    }
    if (!props.entityCounts || typeof props.entityCounts !== 'object') {
      throw new Error('BackupManifest entityCounts must be a valid object.');
    }

    this.manifestVersion = props.manifestVersion.trim();
    this.createdAt = new Date(props.createdAt.getTime());
    this.appVersion = props.appVersion || '1.0.0';
    this.schemaVersion = props.schemaVersion;
    this.entityCounts = Object.freeze({ ...props.entityCounts });

    Object.freeze(this);
  }
}
