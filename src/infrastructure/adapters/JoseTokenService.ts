import * as jose from 'jose';
import { ITokenService } from '../../domain/ports/ITokenService';
import { DecryptResult, StudioConfig, KeyType } from '../../domain/models/Token';

export class JoseTokenService implements ITokenService {
  private async importKey(keyStr: string, type: KeyType, alg?: string, isPrivate = true): Promise<any | Uint8Array> {
    const encoder = new TextEncoder();
    try {
      if (type === 'jwk') {
        return await jose.importJWK(JSON.parse(keyStr), alg);
      } else if (type === 'oct') {
        return encoder.encode(keyStr);
      } else {
        if (isPrivate) {
          return await jose.importPKCS8(keyStr, alg || 'ANY');
        } else {
          try {
            return await jose.importSPKI(keyStr, alg || 'ANY');
          } catch {
            // Fallback to symmetric if SPKI fails or it's not a PEM
            return encoder.encode(keyStr);
          }
        }
      }
    } catch (e: any) {
      throw new Error(`Invalid Key [${type.toUpperCase()}]: ${e.message}`);
    }
  }

  async processToken(token: string, key?: string, keyType: KeyType = 'oct'): Promise<DecryptResult> {
    const cleanToken = token.trim();
    const parts = cleanToken.split('.');

    if (parts.length === 5) {
      if (!key) throw new Error('Decryption key is required for JWE.');
      
      const cryptoKey = await this.importKey(key, keyType);
      const { plaintext, protectedHeader } = await jose.compactDecrypt(cleanToken, cryptoKey);
      
      const rawPayload = new TextDecoder().decode(plaintext);
      let payload;
      try { payload = JSON.parse(rawPayload); } catch { payload = rawPayload; }

      let innerJwt = null;
      if (typeof rawPayload === 'string' && rawPayload.split('.').length === 3) {
        try {
          const [h, p] = rawPayload.split('.');
          innerJwt = {
            header: JSON.parse(new TextDecoder().decode(jose.base64url.decode(h))),
            payload: JSON.parse(new TextDecoder().decode(jose.base64url.decode(p))),
            raw: rawPayload
          };
        } catch {}
      }

      const { isValid, issues } = this.validatePayload(payload);

      return { header: protectedHeader, payload, raw: rawPayload, innerJwt, isValid, validationIssues: issues };
    } else if (parts.length === 3) {
      try {
        const header = JSON.parse(new TextDecoder().decode(jose.base64url.decode(parts[0])));
        const payload = JSON.parse(new TextDecoder().decode(jose.base64url.decode(parts[1])));
        const { isValid, issues } = this.validatePayload(payload);
        return { header, payload, raw: cleanToken, innerJwt: null, isValid, validationIssues: issues };
      } catch (e: any) {
        throw new Error('Invalid JWT format: ' + e.message);
      }
    } else {
      throw new Error(`Unsupported token format (${parts.length} parts).`);
    }
  }

  private validatePayload(payload: any): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    const now = Math.floor(Date.now() / 1000);

    if (typeof payload !== 'object' || payload === null) {
      return { isValid: true, issues: [] };
    }

    if (payload.exp && typeof payload.exp === 'number') {
      if (payload.exp < now) {
        issues.push(`Expired: ${new Date(payload.exp * 1000).toLocaleString()}`);
      }
    }

    if (payload.nbf && typeof payload.nbf === 'number') {
      if (payload.nbf > now) {
        issues.push(`Not valid before: ${new Date(payload.nbf * 1000).toLocaleString()}`);
      }
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  async generateToken(config: StudioConfig): Promise<string> {
    const encoder = new TextEncoder();
    let payload;
    try { payload = JSON.parse(config.payload); } catch { payload = config.payload; }
    const payloadBytes = encoder.encode(typeof payload === 'object' ? JSON.stringify(payload) : payload);

    if (config.type === 'JWT') {
      const key = await this.importKey(config.key, config.keyType, config.alg);
      return await new jose.CompactSign(payloadBytes)
        .setProtectedHeader({ alg: config.alg, typ: 'JWT' })
        .sign(key);
    } else {
      const key = await this.importKey(config.key, config.keyType, config.alg, false);
      return await new jose.CompactEncrypt(payloadBytes)
        .setProtectedHeader({ alg: config.alg, enc: config.enc })
        .encrypt(key);
    }
  }
}
