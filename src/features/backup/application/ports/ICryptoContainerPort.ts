export interface EncryptedContainerBytes {
  readonly bytes: Uint8Array;
}

export interface ICryptoContainerPort {
  encryptPayload(payload: Uint8Array, passphrase?: string): Promise<Uint8Array>;
  decryptContainer(containerBytes: Uint8Array, passphrase?: string): Promise<Uint8Array>;
}
