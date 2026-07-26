export class TransferReference {
  public readonly value: string;

  constructor(transferGroupId: string) {
    if (!transferGroupId || typeof transferGroupId !== 'string' || transferGroupId.trim().length === 0) {
      throw new Error('Transfer group ID cannot be empty.');
    }
    this.value = transferGroupId.trim();
    Object.freeze(this);
  }

  public equals(other: TransferReference): boolean {
    return this.value === other.value;
  }
}
