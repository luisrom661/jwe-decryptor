import { ProcessTokenUseCase } from '../application/use-cases/ProcessToken';
import { GenerateTokenUseCase } from '../application/use-cases/GenerateToken';
import { JoseTokenService } from './adapters/JoseTokenService';
import { BrowserUtilsService } from './adapters/BrowserUtilsService';
import { UtilsUseCase } from '../application/use-cases/UtilsUseCase';

const tokenService = new JoseTokenService();
const utilsService = new BrowserUtilsService();

export const processTokenUseCase = new ProcessTokenUseCase(tokenService);
export const generateTokenUseCase = new GenerateTokenUseCase(tokenService);
export const utilsUseCase = new UtilsUseCase(utilsService);
