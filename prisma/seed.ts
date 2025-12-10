// prisma/seed.ts
/*
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Contraseña de ejemplo: 'password123'
  const hashedPassword = await bcrypt.hash('123456', 10);

  const adminUser = await prisma.user.upsert({
    where: { username: '123' },
    update: {},
    create: {
      username: '123',
      password: hashedPassword,
    },
  });

  console.log(`Usuario creado: ${adminUser.username}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
*/