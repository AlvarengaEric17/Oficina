import { prismaClient } from '../../prisma/client';
import { CreatePartInput, UpdatePartInput } from '../../schemas/partSchema';

export class CreatePartService {
  async execute(data: CreatePartInput) {
    const partWithSameSku = await prismaClient.part.findUnique({
      where: { sku: data.sku },
    });

    if (partWithSameSku) {
      throw new Error('Já existe uma peça com este SKU');
    }

    const part = await prismaClient.part.create({
      data: {
        name: data.name,
        sku: data.sku,
        cost_price: data.cost_price,
        sale_price: data.sale_price,
        quantity: data.quantity,
        min_quantity: data.min_quantity,
      },
    });

    return part;
  }
}

export class ListPartsService {
  async execute() {
    const parts = await prismaClient.part.findMany();

    const partsWithCriticalAlert = parts.map((part) => ({
      ...part,
      is_critical: part.quantity <= part.min_quantity,
    }));

    return partsWithCriticalAlert;
  }
}

export class UpdatePartService {
  async execute(partId: string, data: UpdatePartInput) {
    const part = await prismaClient.part.findUnique({
      where: { id: partId },
    });

    if (!part) {
      throw new Error('Peça não encontrada');
    }

    // Verificar se há conflito de SKU
    if (data.sku && data.sku !== part.sku) {
      const partWithSameSku = await prismaClient.part.findUnique({
        where: { sku: data.sku },
      });

      if (partWithSameSku) {
        throw new Error('Já existe uma peça com este SKU');
      }
    }

    const updatedPart = await prismaClient.part.update({
      where: { id: partId },
      data,
    });

    return updatedPart;
  }
}
