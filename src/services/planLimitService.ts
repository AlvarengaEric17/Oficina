import { prismaClient } from '../prisma/client';

const FREE_PLAN_LIMIT = 5;

export class PlanLimitService {
  async ensureLimit(companyId: string, entity: 'budget' | 'part' | 'financial') {
    const company = await prismaClient.company.findUnique({
      where: { id: companyId },
      select: { plan: true },
    });

    if (!company || company.plan !== 'FREE') {
      return;
    }

    let count = 0;

    if (entity === 'budget') {
      count = await prismaClient.budget.count({ where: { company_id: companyId } });
      if (count >= FREE_PLAN_LIMIT) {
        throw new Error('O plano gratuito permite até 5 orçamentos por empresa.');
      }
    }

    if (entity === 'part') {
      count = await prismaClient.part.count({ where: { company_id: companyId } });
      if (count >= FREE_PLAN_LIMIT) {
        throw new Error('O plano gratuito permite até 5 peças no estoque por empresa.');
      }
    }

    if (entity === 'financial') {
      count = await prismaClient.financial.count({ where: { company_id: companyId } });
      if (count >= FREE_PLAN_LIMIT) {
        throw new Error('O plano gratuito permite até 5 lançamentos financeiros por empresa.');
      }
    }
  }
}
