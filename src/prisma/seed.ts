import { PrismaClient, Role, PlanType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);
  const companyId = 'default-company';

  const company = await prisma.company.upsert({
    where: { id: companyId },
    update: {
      name: 'Oficina Principal',
      plan: PlanType.FREE,
      active: true,
    },
    create: {
      id: companyId,
      name: 'Oficina Principal',
      plan: PlanType.FREE,
      active: true,
    },
  });

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@oficina.com' },
    update: {
      name: 'Super Admin',
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      company_id: null,
    },
    create: {
      name: 'Super Admin',
      email: 'superadmin@oficina.com',
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      company_id: null,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@oficina.com' },
    update: {
      name: 'Administrador',
      password: hashedPassword,
      role: Role.ADMIN,
      company_id: company.id,
    },
    create: {
      name: 'Administrador',
      email: 'admin@oficina.com',
      password: hashedPassword,
      role: Role.ADMIN,
      company_id: company.id,
    },
  });

  const mechanic = await prisma.user.upsert({
    where: { email: 'mecanico@oficina.com' },
    update: {
      name: 'Mecânico Demo',
      password: hashedPassword,
      role: Role.MECHANIC,
      company_id: company.id,
    },
    create: {
      name: 'Mecânico Demo',
      email: 'mecanico@oficina.com',
      password: hashedPassword,
      role: Role.MECHANIC,
      company_id: company.id,
    },
  });

  await prisma.part.upsert({
    where: { sku: 'FILTRO-OLEO-01' },
    update: {
      name: 'Filtro de Óleo',
      cost_price: 1200,
      sale_price: 1800,
      quantity: 10,
      min_quantity: 2,
      company_id: company.id,
    },
    create: {
      name: 'Filtro de Óleo',
      sku: 'FILTRO-OLEO-01',
      cost_price: 1200,
      sale_price: 1800,
      quantity: 10,
      min_quantity: 2,
      company_id: company.id,
    },
  });

  await prisma.part.upsert({
    where: { sku: 'PASTA-FREIO-01' },
    update: {
      name: 'Pastilha de Freio',
      cost_price: 2800,
      sale_price: 4200,
      quantity: 6,
      min_quantity: 2,
      company_id: company.id,
    },
    create: {
      name: 'Pastilha de Freio',
      sku: 'PASTA-FREIO-01',
      cost_price: 2800,
      sale_price: 4200,
      quantity: 6,
      min_quantity: 2,
      company_id: company.id,
    },
  });

  await prisma.part.upsert({
    where: { sku: 'VELA-IGNICAO-01' },
    update: {
      name: 'Vela de Ignição',
      cost_price: 900,
      sale_price: 1500,
      quantity: 15,
      min_quantity: 3,
      company_id: company.id,
    },
    create: {
      name: 'Vela de Ignição',
      sku: 'VELA-IGNICAO-01',
      cost_price: 900,
      sale_price: 1500,
      quantity: 15,
      min_quantity: 3,
      company_id: company.id,
    },
  });

  console.log('Seed concluído com sucesso:', {
    company: company.name,
    superAdmin: superAdmin.email,
    admin: admin.email,
    mechanic: mechanic.email,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });