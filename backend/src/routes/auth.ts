import { Router, Request, Response } from 'express';
import {
  clearAuthCookie,
  createAuthToken,
  getAuthenticatedUser,
  isAuthorizedUser,
  setAuthCookie,
} from '../middleware/auth';

const router = Router();

router.post('/login', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (!isAuthorizedUser(username, password)) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = createAuthToken(username);
    setAuthCookie(res, token);
    res.json({ user: { username } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/logout', (_req: Request, res: Response) => {
  clearAuthCookie(res);
  res.json({ success: true });
});

router.get('/me', (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
