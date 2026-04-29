import { ITokenService } from '../../domain/ports/ITokenService';
import { DecryptResult, KeyType } from '../../domain/models/Token';

export class ProcessTokenUseCase {
  constructor(private tokenService: ITokenService) {}

  async execute(token: string, key?: string, keyType?: KeyType): Promise<DecryptResult> {
    return await this.tokenService.processToken(token, key, keyType);
  }
}
