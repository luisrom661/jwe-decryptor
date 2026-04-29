import { DecryptResult, StudioConfig, KeyType } from '../models/Token';

export interface ITokenService {
  processToken(token: string, key?: string, keyType?: KeyType): Promise<DecryptResult>;
  generateToken(config: StudioConfig): Promise<string>;
}
