import { describe, it, expect } from 'vitest';
import { AEADCryptoProvider } from '../AEADCryptoProvider';

describe('AEADCryptoProvider Security Boundary', () => {
  it('throws an explicit error indicating encrypted backup is deferred rather than performing insecure pseudo-encryption', async () => {
    const provider = new AEADCryptoProvider();
    const payload = new Uint8Array([1, 2, 3, 4]);

    await expect(provider.encryptPayload(payload, 'secret')).rejects.toThrow(
      'Encrypted backup payload functionality is deferred until native AEAD platform crypto module is integrated.'
    );
  });

  it('throws an explicit error when attempting to decrypt a container', async () => {
    const provider = new AEADCryptoProvider();
    const container = new Uint8Array([1, 2, 3, 4]);

    await expect(provider.decryptContainer(container, 'secret')).rejects.toThrow(
      'Decryption of encrypted backup containers is deferred until native AEAD platform crypto module is integrated.'
    );
  });
});
