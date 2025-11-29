const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

(async () => {
  const hash = await bcrypt.hash('feli987896868', 10);
  const user = await prisma.user.create({
    data: {
      username: 'felicidad',
      password: hash,

    }
  });
  console.log('Usuario creado:', user);
  await prisma.$disconnect();
})();
