import { prismaClient } from '../../prisma/client';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PlanType } from '@prisma/client';
import { CreateUserInput, SessionInput } from '../../schemas/userSchema';

export class CreateUserService {
  async execute(data: CreateUserInput) {
    const userAlreadyExists = await prismaClient.user.findUnique({
      where: { email: data.email },
    });

    if (userAlreadyExists) {
      throw new Error('Usuário com este email já existe');
    }

    const hashedPassword = await bcryptjs.hash(data.password, 10);

    const company = await prismaClient.company.create({
      data: {
        name: `Empresa de ${data.name}`,
        plan: PlanType.FREE,
        active: true,
      },
    });

    const user = await prismaClient.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: 'ADMIN',
        company_id: company.id,
      },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      company_id: user.company_id,
    };
  }
}

export class UpdateUserService {
  async execute(userId: string, data: { role?: 'MECHANIC' | 'ADMIN' | 'SUPER_ADMIN'; company_id?: string | null }) {
    const user = await prismaClient.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const updatedUser = await prismaClient.user.update({
      where: { id: userId },
      data: {
        role: data.role,
        company_id: data.company_id ?? undefined,
      },
    });

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      company_id: updatedUser.company_id,
    };
  }
}

export class SessionService {
  async execute(data: SessionInput) {
    const user = await prismaClient.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('Email ou senha incorretos');
    }

    const passwordMatch = await bcryptjs.compare(data.password, user.password);

    if (!passwordMatch) {
      throw new Error('Email ou senha incorretos');
    }

    const token = jwt.sign(
      {
        user_id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}

export class GetMeService {
  async execute(userId: string) {
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        company_id: true,
      },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user;
  }
}
