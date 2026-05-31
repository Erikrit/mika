import { createDecipheriv, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const SALT = 'mika-encryption-salt';

function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY ?? 'default-dev-key-change-in-production-32c';
  return scryptSync(secret, SALT, 32);
}

export function decryptReflection(ciphertext: string): string {
  const [ivHex, authTagHex, encryptedHex] = ciphertext.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);
  return decipher.update(encrypted) + decipher.final('utf8');
}
