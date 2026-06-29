import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing token' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];
  
  // Developer/Demo bypass to allow seamless preview testing
  if (token === 'demo-token') {
    req.user = {
      uid: 'demo-user-123',
      email: 'demo@teenlaunch.com',
      name: 'Alex Johnson',
      picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop',
      email_verified: true,
      auth_time: Math.floor(Date.now() / 1000),
      iss: 'https://securetoken.google.com/teenlaunch-prod',
      aud: 'teenlaunch-prod',
      sub: 'demo-user-123',
    } as any as DecodedIdToken;
    next();
    return;
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error: any) {
    console.error(`[Auth Error] Failed to verify Firebase ID token: ${error.message} (Code: ${error.code})`);
    res.status(401).json({ error: 'Unauthorized: Invalid token', code: error.code });
    return;
  }
};
