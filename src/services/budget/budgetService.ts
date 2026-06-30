import { prismaClient } from '../../prisma/client';
import { CreateBudgetInput, AddItemBudgetInput, UpdateStatusInput } from '../../schemas/budgetSchema';
import { getWebSocketManager } from '../../websocket/manager';

export class CreateBudgetService {
  async execute(data: CreateBudgetInput, mechanicId: string) {
    const budget = await prismaClient.budget.create({
      data: {
        vehicle_plate: data.vehicle_plate,
        vehicle_model: data.vehicle_model,
        client_name: data.client_name,
        client_phone: data.client_phone,
        mechanic_id: mechanicId,
        total_value: 0,
      },
      include: {
        items: true,
      },
    });

    return budget;
  }
}

export class AddItemBudgetService {
  async execute(data: AddItemBudgetInput) {
    const budget = await prismaClient.budget.findUnique({
      where: { id: data.budget_id },
      include: { items: true },
    });

    if (!budget) {
      throw new Error('Orçamento não encontrado');
    }

    if (budget.status !== 'DRAFT') {
      throw new Error('Não é possível adicionar itens a um orçamento que não está em DRAFT');
    }

    // Validar que ao menos part_id ou labor_name está presente
    if (!data.part_id && !data.labor_name) {
      throw new Error('Deve ser fornecido um part_id ou labor_name');
    }

    let description = data.labor_name || '';

    if (data.part_id) {
      const part = await prismaClient.part.findUnique({
        where: { id: data.part_id },
      });

      if (!part) {
        throw new Error('Peça não encontrada');
      }

      description = part.name;
    }

    const item = await prismaClient.budgetItem.create({
      data: {
        budget_id: data.budget_id,
        part_id: data.part_id,
        description,
        cost: data.cost,
        price: data.price,
        quantity: data.quantity,
      },
    });

    // Atualizar total do orçamento
    const newTotal = await this.calculateBudgetTotal(data.budget_id);
    await prismaClient.budget.update({
      where: { id: data.budget_id },
      data: { total_value: newTotal },
    });

    return item;
  }

  private async calculateBudgetTotal(budgetId: string): Promise<number> {
    const items = await prismaClient.budgetItem.findMany({
      where: { budget_id: budgetId },
    });

    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }
}

export class ApproveBudgetService {
  async execute(budgetId: string) {
    const budget = await prismaClient.budget.findUnique({
      where: { id: budgetId },
      include: { items: { include: { part: true } } },
    });

    if (!budget) {
      throw new Error('Orçamento não encontrado');
    }

    if (budget.status !== 'DRAFT' && budget.status !== 'WAITING_APPROVAL') {
      throw new Error('Orçamento não pode ser aprovado neste status');
    }

    // Verificar estoque para todos os itens
    for (const item of budget.items) {
      if (item.part_id) {
        const part = await prismaClient.part.findUnique({
          where: { id: item.part_id },
        });

        if (!part || part.quantity < item.quantity) {
          throw new Error(
            `Estoque insuficiente para peça "${item.description}". Disponível: ${part?.quantity || 0}, Solicitado: ${item.quantity}`
          );
        }
      }
    }

    // Abater estoque para todos os itens
    for (const item of budget.items) {
      if (item.part_id) {
        await prismaClient.part.update({
          where: { id: item.part_id },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
      }
    }

    // Criar registro financeiro
    await prismaClient.financial.create({
      data: {
        budget_id: budgetId,
        description: `Aprovação de orçamento - ${budget.vehicle_model} (${budget.vehicle_plate})`,
        type: 'INPUT',
        value: budget.total_value,
      },
    });

    // Atualizar status do orçamento
    const updatedBudget = await prismaClient.budget.update({
      where: { id: budgetId },
      data: { status: 'APPROVED' },
      include: { items: true },
    });

    return updatedBudget;
  }
}

export class UpdateBudgetStatusService {
  async execute(budgetId: string, data: UpdateStatusInput) {
    const budget = await prismaClient.budget.findUnique({
      where: { id: budgetId },
    });

    if (!budget) {
      throw new Error('Orçamento não encontrado');
    }

    const updatedBudget = await prismaClient.budget.update({
      where: { id: budgetId },
      data: { status: data.status },
      include: { items: true },
    });

    // Emitir evento WebSocket
    const wsManager = getWebSocketManager();
    wsManager.emitStatusUpdated(budgetId, {
      status: data.status,
      updatedAt: updatedBudget.updatedAt,
      budget: updatedBudget,
    });

    return updatedBudget;
  }
}

export class GetBudgetService {
  async execute(budgetId: string) {
    const budget = await prismaClient.budget.findUnique({
      where: { id: budgetId },
      include: {
        items: {
          include: {
            part: true,
          },
        },
        mechanic: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!budget) {
      throw new Error('Orçamento não encontrado');
    }

    return budget;
  }
}

export class GetVehicleHistoryService {
  async execute(filters?: {
    vehicle_plate?: string;
    mechanic_id?: string;
  }) {
    const budgets = await prismaClient.budget.findMany({
      where: {
        vehicle_plate: filters?.vehicle_plate ? { contains: filters.vehicle_plate } : undefined,
        mechanic_id: filters?.mechanic_id,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        mechanic: {
          select: {
            id: true,
            name: true,
          },
        },
        items: true,
      },
    });

    return budgets;
  }
}
