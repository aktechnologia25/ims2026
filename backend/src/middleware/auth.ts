import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';

const AUTH_COOKIE_NAME = 'senfrost_auth';
const TOKEN_TTL_MS = 1000 * 60 * 60 * 12;

function getRequiredEnv(name: 'AUTH_USERNAME' | 'AUTH_PASSWORD' | 'AUTH_SECRET'): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} in environment variables`);
  }

  return value;
}

function getCookieValue(req: Request, name: string): string | null {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [rawName, ...rest] = cookie.trim().split('=');
    if (rawName === name) {
      return decodeURIComponent(rest.join('='));
    }
  }

  return null;
}

function signPayload(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export function createAuthToken(username: string): string {
  const secret = getRequiredEnv('AUTH_SECRET');
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = `${username}.${expiresAt}`;
  const signature = signPayload(payload, secret);
  return `${payload}.${signature}`;
}

function verifyAuthToken(token: string): { username: string } | null {
  const secret = getRequiredEnv('AUTH_SECRET');
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  const [username, expiresAtRaw, signature] = parts;
  const payload = `${username}.${expiresAtRaw}`;
  const expectedSignature = signPayload(payload, secret);
  const expiresAt = Number(expiresAtRaw);

  if (!username || !Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    return null;
  }

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  return { username };
}

export function isAuthorizedUser(username: string, password: string): boolean {
  return (
    username === getRequiredEnv('AUTH_USERNAME') &&
    password === getRequiredEnv('AUTH_PASSWORD')
  );
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: TOKEN_TTL_MS,
    path: '/',
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

export function getAuthenticatedUser(req: Request): { username: string } | null {
  const token = getCookieValue(req, AUTH_COOKIE_NAME);
  if (!token) {
    return null;
  }

  return verifyAuthToken(token);
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
}
