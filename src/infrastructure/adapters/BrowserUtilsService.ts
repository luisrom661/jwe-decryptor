import { IUtilsService } from '../../domain/ports/IUtilsService';

export class BrowserUtilsService implements IUtilsService {
  base64Encode(text: string): string {
    try {
      return btoa(unescape(encodeURIComponent(text)));
    } catch {
      throw new Error('Base64 encoding failed');
    }
  }

  base64Decode(encoded: string): string {
    try {
      return decodeURIComponent(escape(atob(encoded)));
    } catch {
      throw new Error('Base64 decoding failed');
    }
  }

  urlEncode(text: string): string {
    return encodeURIComponent(text);
  }

  urlDecode(encoded: string): string {
    try {
      return decodeURIComponent(encoded);
    } catch {
      throw new Error('URL decoding failed');
    }
  }

  generateUUID(): string {
    return crypto.randomUUID ? crypto.randomUUID() : this.fallbackUUID();
  }

  generateSymmetricKey(length: number = 32): string {
    const arr = new Uint8Array(length);
    crypto.getRandomValues(arr);
    return btoa(String.fromCharCode(...arr)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  async generateRSAKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt']
    );

    const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);
    const privateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

    const toPem = (buf: ArrayBuffer, type: 'PUBLIC' | 'PRIVATE') => {
      const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      const lines = b64.match(/.{1,64}/g) || [];
      return `-----BEGIN ${type} KEY-----\n${lines.join('\n')}\n-----END ${type} KEY-----`;
    };

    return {
      publicKey: toPem(publicKey, 'PUBLIC'),
      privateKey: toPem(privateKey, 'PRIVATE')
    };
  }

  private fallbackUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
