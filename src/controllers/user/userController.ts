import { Request, Response } from 'express';
import { CreateUserService, SessionService, GetMeService, UpdateUserService } from '../../services/user/userService';

export class CreateUserController {
  async handle(req: Request, res: Response) {
    try {
      const service = new CreateUserService();
      const user = await service.execute(req.body);

      return res.status(201).json(user);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export class UpdateUserController {
  async handle(req: Request, res: Response) {
    try {
      const service = new UpdateUserService();
      const userId = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
      const user = await service.execute(userId, req.body);

      return res.status(200).json(user);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export class SessionController {
  async handle(req: Request, res: Response) {
    try {
      const service = new SessionService();
      const session = await service.execute(req.body);

      return res.status(200).json(session);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export class GetMeController {
  async handle(req: Request, res: Response) {
    try {
      if (!req.user_id) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const service = new GetMeService();
      const user = await service.execute(req.user_id);

      return res.status(200).json(user);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
