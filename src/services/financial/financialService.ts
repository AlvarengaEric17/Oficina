import { prismaClient } from '../../prisma/client';
import { ManualTransactionInput, CalculateTaxInput } from '../../schemas/financialSchema';
import { PlanLimitService } from '../planLimitService';

// Tabela de taxas por número de parcelas (em percentual)
const CARD_TAX_TABLE: Record<number, number> = {
  1: 0, // à vista
  2: 2.5,
  3: 3.75,
  4: 5.0,
  5: 6.25,
  6: 7.5,
  7: 8.75,
  8: 10.0,
  9: 11.25,
  10: 12.5,
  11: 13.75,
  12: 15.0,
};

export class CreateManualTransactionService {
  async execute(data: ManualTransactionInput, companyId?: string) {
    if (companyId) {
      const limitService = new PlanLimitService();
      await limitService.ensureLimit(companyId, 'financial');
    }

    const transaction = await prismaClient.financial.create({
      data: {
        description: data.description,
        type: data.type,
        value: data.value,
        payment_method: data.payment_method,
        company_id: companyId,
      },
    });
    return transaction;
  }
}

export class GetCashFlowService {
  async execute(companyId?: string) {
    const transactions = await prismaClient.financial.findMany({
      where: companyId ? { company_id: companyId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        budget: {
          select: {
            id: true,
            vehicle_plate: true,
            vehicle_model: true,
            client_name: true,
          },
        },
      },
    });

    const totals = {
      totalInput: 0,
      totalOutput: 0,
    };

    transactions.forEach((transaction) => {
      if (transaction.type === 'INPUT') {
        totals.totalInput += transaction.value;
      } else {
        totals.totalOutput += transaction.value;
      }
    });

    const balance = totals.totalInput - totals.totalOutput;

    return {
      transactions,
      totals: {
        ...totals,
        balance,
      },
    };
  }
}

export class CalculateTaxService {
  async execute(data: CalculateTaxInput) {
    const taxPercentage = CARD_TAX_TABLE[data.installments] ?? 0;
    
    if (taxPercentage === undefined) {
      throw new Error('Número de parcelas não suportado');
    }

    const taxAmount = Math.round((data.amount * taxPercentage) / 100);
    const totalAmount = data.amount + taxAmount;
    const installmentAmount = Math.round(totalAmount / data.installments);

    return {
      originalAmount: data.amount,
      taxPercentage,
      taxAmount,
      totalAmount,
      installments: data.installments,
      installmentAmount,
      details: {
        message: data.installments === 1 
          ? 'Pagamento à vista sem juros'
          : `${data.installments}x de ${(installmentAmount / 100).toFixed(2)} (Total: ${(totalAmount / 100).toFixed(2)})`,
      },
    };
  }
}
