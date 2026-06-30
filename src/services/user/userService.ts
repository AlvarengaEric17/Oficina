import { prismaClient } from '../../prisma/client';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
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

    const user = await prismaClient.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
      },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
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
      },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user;
  }
}
