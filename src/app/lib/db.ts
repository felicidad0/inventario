// src/lib/db.ts
import { PrismaClient } from '@prisma/client';

// Extender el objeto global de Node.js para incluir la instancia de Prisma
// Esto es para evitar múltiples instancias de PrismaClient en desarrollo con Next.js Hot Reload
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
       datasources: { db: { url: process.env.DATABASE_URL } },

    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
