import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs'; // Ou a biblioteca de hash que seu backend usa

const prisma = new PrismaClient();

async function main() {
  // Criptografa a senha para o padrão do seu login
  const hashedPassword = await bcrypt.hash('123456', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@oficina.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@oficina.com',
      password: hashedPassword,
      role: 'ADMIN', // Alinhe com os papéis do seu enum se necessário
    },
  });

  console.log('Usuário seed criado:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });