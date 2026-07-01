import { Request } from 'express';

/**
 * Extrai o IP do cliente de forma segura, considerando proxies confiáveis.
 * Suporta IPv4 e IPv6. Normaliza prefixos IPv4-mapped em IPv6.
 */
export const getClientIp = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  let ip: string;

  if (typeof forwarded === 'string' && forwarded.length > 0) {
    ip = forwarded.split(',')[0].trim();
  } else if (Array.isArray(forwarded) && forwarded.length > 0) {
    ip = String(forwarded[0]).trim();
  } else {
    ip = req.ip ?? req.socket?.remoteAddress ?? 'unknown';
  }

  // Normaliza IPv4-mapped em IPv6 (::ffff:192.168.1.1 -> 192.168.1.1)
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  return ip;
};
