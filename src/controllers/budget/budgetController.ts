import { Request, Response } from 'express';
import {
  CreateBudgetService,
  AddItemBudgetService,
  ApproveBudgetService,
  UpdateBudgetStatusService,
  GetBudgetService,
  GetVehicleHistoryService,
} from '../../services/budget/budgetService';

export class CreateBudgetController {
  async handle(req: Request, res: Response) {
    try {
      if (!req.user_id) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const service = new CreateBudgetService();
      const budget = await service.execute(req.body, req.user_id, req.company_id);

      return res.status(201).json(budget);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export class AddItemBudgetController {
  async handle(req: Request, res: Response) {
    try {
      const service = new AddItemBudgetService();
      const item = await service.execute(req.body);

      return res.status(201).json(item);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export class GetBudgetShareController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const service = new GetBudgetService();
      const budget = await service.execute(id as string);

      return res.status(200).json(budget);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  }
}

export class ApproveBudgetController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const service = new ApproveBudgetService();
      const budget = await service.execute(id as string);

      return res.status(200).json(budget);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export class UpdateBudgetStatusController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const service = new UpdateBudgetStatusService();
      const budget = await service.execute(id as string, req.body);

      return res.status(200).json(budget);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export class GetVehicleHistoryController {
  async handle(req: Request, res: Response) {
    try {
      const { vehicle_plate, mechanic_id, search } = req.query;

      const service = new GetVehicleHistoryService();
      const history = await service.execute({
        vehicle_plate: typeof vehicle_plate === 'string' ? vehicle_plate : undefined,
        mechanic_id: typeof mechanic_id === 'string' ? mechanic_id : undefined,
        search: typeof search === 'string' ? search : undefined,
        company_id: req.company_id,
      });

      return res.status(200).json(history);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
