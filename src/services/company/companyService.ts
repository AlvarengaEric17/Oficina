import { prismaClient } from '../../prisma/client';
import { CreateCompanyInput, UpdateCompanyInput } from '../../schemas/companySchema';

export class CreateCompanyService {
  async execute(data: CreateCompanyInput) {
    const company = await prismaClient.company.create({
      data: {
        name: data.name,
        plan: data.plan,
        active: data.active,
      },
    });

    return company;
  }
}

export class ListCompaniesService {
  async execute() {
    return prismaClient.company.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        users: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  }
}

export class UpdateCompanyService {
  async execute(companyId: string, data: UpdateCompanyInput) {
    const company = await prismaClient.company.findUnique({ where: { id: companyId } });

    if (!company) {
      throw new Error('Empresa não encontrada');
    }

    return prismaClient.company.update({
      where: { id: companyId },
      data,
    });
  }
}
