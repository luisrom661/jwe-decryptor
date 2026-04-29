import { ITokenService } from '../../domain/ports/ITokenService';
import { StudioConfig } from '../../domain/models/Token';

export class GenerateTokenUseCase {
  constructor(private tokenService: ITokenService) {}

  async execute(config: StudioConfig): Promise<string> {
    return await this.tokenService.generateToken(config);
  }
}
