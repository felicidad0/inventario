import { NextApiRequest, NextApiResponse } from 'next';

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse

) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  try {

    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hash,
        // Agrega otros campos aquí si tu modelo lo requiere (ejemplo: email)
      },
    });

    return res.status(201).json({ user });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
