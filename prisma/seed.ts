import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash("Admin@1234", 10);

  const adminRole = await prisma.role.upsert({
    where: { code: "ADMIN" },
    update: {},
    create: {
      code: "ADMIN",
      name: "Admin",
      description: "System administrator",
    },
  });

  await prisma.role.upsert({
    where: { code: "MANAGER" },
    update: {},
    create: {
      code: "MANAGER",
      name: "Manager",
      description: "Manager",
    },
  });

  await prisma.role.upsert({
    where: { code: "SALES" },
    update: {},
    create: {
      code: "SALES",
      name: "Sales",
      description: "Sales user",
    },
  });

  await prisma.role.upsert({
    where: { code: "FINANCE" },
    update: {},
    create: {
      code: "FINANCE",
      name: "Finance",
      description: "Finance user",
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@monster.local" },
    update: {},
    create: {
      email: "admin@monster.local",
      passwordHash: password,
      name: "System Admin",
      status: "ACTIVE",
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

  console.log("✅ Seed completed");
  console.log("Admin account: admin@monster.local");
  console.log("Password: Admin@1234");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
