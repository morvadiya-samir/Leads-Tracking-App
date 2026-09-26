import { Request, Response, NextFunction } from 'express';

export function basicAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  // If basic auth is not enabled, proceed
  if (process.env.BASIC_AUTH_ENABLED !== 'true') {
    return next();
  }

  // Allow OPTIONS preflight requests
  if (req.method === 'OPTIONS') {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    // Note: Do not set 'WWW-Authenticate: Basic ...' header so the browser's native popup dialog is not triggered.
    // This allows the SPA AuthModal to handle authentication directly.
    res.status(401).json({ error: 'Unauthorized: Basic authentication credentials required' });
    return;
  }

  const base64Credentials = authHeader.split(' ')[1];
  if (!base64Credentials) {
    res.status(401).json({ error: 'Unauthorized: Invalid authorization header format' });
    return;
  }

  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const colonIndex = credentials.indexOf(':');
  if (colonIndex === -1) {
    res.status(401).json({ error: 'Unauthorized: Invalid credentials format' });
    return;
  }
  const username = credentials.substring(0, colonIndex);
  const password = credentials.substring(colonIndex + 1);

  const expectedUser = process.env.BASIC_AUTH_USER || 'admin';
  const expectedPass = process.env.BASIC_AUTH_PASS || 'password123';

  if (username === expectedUser && password === expectedPass) {
    return next();
  }

  // Note: Do not set 'WWW-Authenticate: Basic ...' header so the browser's native popup dialog is not triggered.
  res.status(401).json({ error: 'Unauthorized: Invalid username or password' });
}
