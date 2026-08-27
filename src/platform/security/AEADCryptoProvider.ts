import { ICryptoContainerPort } from '../../features/backup/application/ports/ICryptoContainerPort';

export class AEADCryptoProvider implements ICryptoContainerPort {
  public async encryptPayload(_payload: Uint8Array, _passphrase?: string): Promise<Uint8Array> {
    throw new Error('Encrypted backup payload functionality is deferred until native AEAD platform crypto module is integrated.');
  }

  public async decryptContainer(_containerBytes: Uint8Array, _passphrase?: string): Promise<Uint8Array> {
    throw new Error('Decryption of encrypted backup containers is deferred until native AEAD platform crypto module is integrated.');
  }
}
