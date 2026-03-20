import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('Admin@1234', 10);

  const adminRole = await prisma.role.upsert({
    where: { code: 'ADMIN' },
    update: {},
    create: {
      code: 'ADMIN',
      name: 'Admin',
      description: 'System administrator',
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { code: 'MANAGER' },
    update: {},
    create: {
      code: 'MANAGER',
      name: 'Manager',
      description: 'Manager',
    },
  });

  const salesRole = await prisma.role.upsert({
    where: { code: 'SALES' },
    update: {},
    create: {
      code: 'SALES',
      name: 'Sales',
      description: 'Sales user',
    },
  });

  const financeRole = await prisma.role.upsert({
    where: { code: 'FINANCE' },
    update: {},
    create: {
      code: 'FINANCE',
      name: 'Finance',
      description: 'Finance user',
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@monster.local' },
    update: {},
    create: {
      email: 'admin@monster.local',
      passwordHash,
      name: 'System Admin',
      status: 'ACTIVE',
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  const salesUser = await prisma.user.upsert({
    where: { email: 'sales@monster.local' },
    update: {},
    create: {
      email: 'sales@monster.local',
      passwordHash,
      name: 'Sales User',
      status: 'ACTIVE',
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: salesUser.id,
        roleId: salesRole.id,
      },
    },
    update: {},
    create: {
      userId: salesUser.id,
      roleId: salesRole.id,
    },
  });

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@monster.local' },
    update: {},
    create: {
      email: 'manager@monster.local',
      passwordHash,
      name: 'Manager User',
      status: 'ACTIVE',
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: managerUser.id,
        roleId: managerRole.id,
      },
    },
    update: {},
    create: {
      userId: managerUser.id,
      roleId: managerRole.id,
    },
  });

  const financeUser = await prisma.user.upsert({
    where: { email: 'finance@monster.local' },
    update: {},
    create: {
      email: 'finance@monster.local',
      passwordHash,
      name: 'Finance User',
      status: 'ACTIVE',
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: financeUser.id,
        roleId: financeRole.id,
      },
    },
    update: {},
    create: {
      userId: financeUser.id,
      roleId: financeRole.id,
    },
  });

  await prisma.product.upsert({
    where: { sku: 'P001' },
    update: {},
    create: {
      sku: 'P001',
      name: 'Workerz Exit 工具腰包',
      unit: 'pcs',
      listPrice: 1500,
      status: 'ACTIVE',
    },
  });

  await prisma.product.upsert({
    where: { sku: 'P002' },
    update: {},
    create: {
      sku: 'P002',
      name: '工具掛鉤',
      unit: 'pcs',
      listPrice: 300,
      status: 'ACTIVE',
    },
  });

  await prisma.product.upsert({
    where: { sku: 'P003' },
    update: {},
    create: {
      sku: 'P003',
      name: '安全掛繩',
      unit: 'pcs',
      listPrice: 450,
      status: 'ACTIVE',
    },
  });

  console.log('✅ Seed completed');
  console.log('Admin account: admin@monster.local / Admin@1234');
  console.log('Sales account: sales@monster.local / Admin@1234');
  console.log('Manager account: manager@monster.local / Admin@1234');
  console.log('Finance account: finance@monster.local / Admin@1234');
  console.log('Products: P001 / P002 / P003');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });