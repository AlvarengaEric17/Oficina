import { Request, Response } from 'express';
import {
  CreateCompanyService,
  ListCompaniesService,
  UpdateCompanyService,
} from '../../services/company/companyService';

export class CreateCompanyController {
  async handle(req: Request, res: Response) {
    try {
      const service = new CreateCompanyService();
      const company = await service.execute(req.body);
      return res.status(201).json(company);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export class ListCompaniesController {
  async handle(req: Request, res: Response) {
    try {
      const service = new ListCompaniesService();
      return res.status(200).json(await service.execute());
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export class UpdateCompanyController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const service = new UpdateCompanyService();
      return res.status(200).json(await service.execute(id as string, req.body));
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
