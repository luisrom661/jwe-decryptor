export type KeyType = 'oct' | 'rsa' | 'ec' | 'jwk';

export interface DecryptResult {
  header: any;
  payload: any;
  raw: string;
  isValid?: boolean;
  validationIssues?: string[];
  innerJwt?: {
    header: any;
    payload: any;
    raw: string;
  } | null;
}

export interface StudioConfig {
  type: 'JWT' | 'JWE';
  payload: string;
  key: string;
  keyType: KeyType;
  alg: string;
  enc?: string;
}
