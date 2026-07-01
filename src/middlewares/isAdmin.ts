import { Request, Response, NextFunction } from 'express';
import { prismaClient } from '../prisma/client';

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user_id) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }

  try {
    const user = await prismaClient.user.findUnique({
      where: { id: req.user_id },
    });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return res.status(403).json({ error: 'Acesso negado: apenas admins podem executar esta operação' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao verificar permissões' });
  }
};

export const isSuperAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user_id) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }

  try {
    const user = await prismaClient.user.findUnique({
      where: { id: req.user_id },
    });

    if (!user || user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Acesso negado: apenas Super Admins podem executar esta operação' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao verificar permissões' });
  }
};
