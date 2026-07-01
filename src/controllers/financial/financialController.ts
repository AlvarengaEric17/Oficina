import { Request, Response } from 'express';
import {
  CreateManualTransactionService,
  GetCashFlowService,
  CalculateTaxService,
} from '../../services/financial/financialService';

export class CreateManualTransactionController {
  async handle(req: Request, res: Response) {
    try {
      const service = new CreateManualTransactionService();
      const transaction = await service.execute(req.body, req.company_id);

      return res.status(201).json(transaction);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export class GetCashFlowController {
  async handle(req: Request, res: Response) {
    try {
      const service = new GetCashFlowService();
      const cashflow = await service.execute(req.company_id);

      return res.status(200).json(cashflow);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export class CalculateTaxController {
  async handle(req: Request, res: Response) {
    try {
      const service = new CalculateTaxService();
      const calculation = await service.execute(req.body);

      return res.status(200).json(calculation);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
