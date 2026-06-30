import { prismaClient } from '../../prisma/client';
import { CreateSlotInput } from '../../schemas/scheduleSchema';
import { getWebSocketManager } from '../../websocket/manager';

export class CreateScheduleSlotService {
  async execute(data: CreateSlotInput) {
    // Validar que o mecânico existe
    const mechanic = await prismaClient.user.findUnique({
      where: { id: data.mechanic_id },
    });

    if (!mechanic) {
      throw new Error('Mecânico não encontrado');
    }

    // Validar que end_time > start_time
    const startTime = new Date(data.start_time);
    const endTime = new Date(data.end_time);

    if (endTime <= startTime) {
      throw new Error('Data/hora de término deve ser após a data/hora de início');
    }

    const slot = await prismaClient.schedule.create({
      data: {
        mechanic_id: data.mechanic_id,
        start_time: startTime,
        end_time: endTime,
      },
    });

    // Emitir evento WebSocket
    const wsManager = getWebSocketManager();
    wsManager.emitScheduleUpdated({
      type: 'SLOT_CREATED',
      slot,
    });

    return slot;
  }
}

export class GetPublicScheduleService {
  async execute() {
    const slots = await prismaClient.schedule.findMany({
      where: { is_available: true },
      include: {
        mechanic: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { start_time: 'asc' },
    });

    return slots;
  }
}

export class GetMechanicScheduleService {
  async execute(mechanicId: string) {
    const slots = await prismaClient.schedule.findMany({
      where: { mechanic_id: mechanicId },
      orderBy: { start_time: 'asc' },
    });

    return slots;
  }
}

export class UpdateSlotAvailabilityService {
  async execute(slotId: string, isAvailable: boolean) {
    const slot = await prismaClient.schedule.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      throw new Error('Horário não encontrado');
    }

    const updatedSlot = await prismaClient.schedule.update({
      where: { id: slotId },
      data: { is_available: isAvailable },
    });

    // Emitir evento WebSocket
    const wsManager = getWebSocketManager();
    wsManager.emitScheduleUpdated({
      type: 'SLOT_UPDATED',
      slot: updatedSlot,
    });

    return updatedSlot;
  }
}
