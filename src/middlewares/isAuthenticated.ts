import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prismaClient } from '../prisma/client';

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido ou formato inválido' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      user_id: string;
      role: string;
    };
    req.user_id = decoded.user_id;
    (req as any).user_role = decoded.role;

    const user = await prismaClient.user.findUnique({
      where: { id: decoded.user_id },
      select: { company_id: true, role: true, company: { select: { active: true } } },
    });

    if (user?.company && user.company.active === false) {
      return res.status(403).json({ error: 'Esta empresa está inativa. Entre em contato com o suporte.' });
    }

    req.company_id = user?.company_id ?? undefined;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};
