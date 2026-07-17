export type VerificationFailure = 'invalid' | 'unavailable';

const INVALID_TOKEN_CODES = new Set([
  'ERR_JWT_CLAIM_VALIDATION_FAILED',
  'ERR_JWT_EXPIRED',
  'ERR_JOSE_ALG_NOT_ALLOWED',
  'ERR_JOSE_NOT_SUPPORTED',
  'ERR_JWS_INVALID',
  'ERR_JWT_INVALID',
  'ERR_JWKS_NO_MATCHING_KEY',
  'ERR_JWKS_MULTIPLE_MATCHING_KEYS',
  'ERR_JWS_SIGNATURE_VERIFICATION_FAILED',
]);

export function classifyVerificationError(error: unknown): VerificationFailure {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = String((error as { code: unknown }).code);
    if (INVALID_TOKEN_CODES.has(code)) return 'invalid';
  }
  return 'unavailable';
}
