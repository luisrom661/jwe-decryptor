import { IUtilsService } from '../../domain/ports/IUtilsService';

export class UtilsUseCase {
  constructor(private utilsService: IUtilsService) {}

  base64Encode(text: string): string {
    return this.utilsService.base64Encode(text);
  }

  base64Decode(encoded: string): string {
    return this.utilsService.base64Decode(encoded);
  }

  urlEncode(text: string): string {
    return this.utilsService.urlEncode(text);
  }

  urlDecode(encoded: string): string {
    return this.utilsService.urlDecode(encoded);
  }

  generateUUID(): string {
    return this.utilsService.generateUUID();
  }

  generateSymmetricKey(length?: number): string {
    return this.utilsService.generateSymmetricKey(length);
  }

  async generateRSAKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
    return this.utilsService.generateRSAKeyPair();
  }
}
