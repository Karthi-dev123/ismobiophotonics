import type { Request, Response } from 'express';
import * as authService from './auth.service';

export async function register(req: Request, res: Response) {
  res.status(201).json(await authService.register(req.body));
}

export async function login(req: Request, res: Response) {
  res.json(await authService.login(req.body));
}

export async function logout(req: Request, res: Response) {
  await authService.logout(req.user!.jti, req.user!.exp);
  res.status(204).end();
}

export async function me(req: Request, res: Response) {
  res.json({ user: await authService.getMe(req.user!.id) });
}
