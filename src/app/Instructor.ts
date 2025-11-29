import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';


const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  const hash = await bcrypt.hash(password, 10);
  try {

    const user = await prisma.user.create({
      data: {
        username,
        password: hash,
        // otros campos obligatorios aquí si tu modelo lo requiere
      },
    });
    res.status(201).json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
