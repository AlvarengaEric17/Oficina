import { Request, Response } from 'express';
import {
  CreateScheduleSlotService,
  GetPublicScheduleService,
  GetMechanicScheduleService,
  UpdateSlotAvailabilityService,
} from '../../services/schedule/scheduleService';

export class CreateScheduleSlotController {
  async handle(req: Request, res: Response) {
    try {
      const service = new CreateScheduleSlotService();
      const slot = await service.execute(req.body);

      return res.status(201).json(slot);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export class GetPublicScheduleController {
  async handle(req: Request, res: Response) {
    try {
      const service = new GetPublicScheduleService();
      const slots = await service.execute();

      return res.status(200).json(slots);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export class GetMechanicScheduleController {
  async handle(req: Request, res: Response) {
    try {
      if (!req.user_id) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const service = new GetMechanicScheduleService();
      const slots = await service.execute(req.user_id);

      return res.status(200).json(slots);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export class UpdateSlotAvailabilityController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { is_available } = req.body;

      const service = new UpdateSlotAvailabilityService();
      const slot = await service.execute(id as string, is_available);

      return res.status(200).json(slot);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
