export interface IUtilsService {
  base64Encode(text: string): string;
  base64Decode(encoded: string): string;
  urlEncode(text: string): string;
  urlDecode(encoded: string): string;
  generateUUID(): string;
  generateSymmetricKey(length?: number): string;
  generateRSAKeyPair(): Promise<{ publicKey: string; privateKey: string }>;
}
