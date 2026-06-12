/** Prefixo fixo no bundle — igual em todos os ambientes */
export const API_BASE_PATH = '/backend';

/** URL interna NestJS — só servidor (route handler) */
export function getInternalApiUrl(): string {
  return process.env.INTERNAL_API_URL ?? 'http://localhost:3001';
}
