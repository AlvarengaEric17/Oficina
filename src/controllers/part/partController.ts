import { Request, Response } from 'express';
import { CreatePartService, ListPartsService, UpdatePartService } from '../../services/part/partService';

export class CreatePartController {
  async handle(req: Request, res: Response) {
    try {
      const service = new CreatePartService();
      const part = await service.execute(req.body, req.company_id);

      return res.status(201).json(part);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export class ListPartsController {
  async handle(req: Request, res: Response) {
    try {
      const service = new ListPartsService();
      const parts = await service.execute(req.company_id);

      return res.status(200).json(parts);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export class UpdatePartController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const service = new UpdatePartService();
      const part = await service.execute(id as string, req.body);

      return res.status(200).json(part);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
