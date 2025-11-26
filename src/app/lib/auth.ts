// src/lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './db';
import * as bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  // Configuración de la sesión para usar JWT
  session: {
    strategy: 'jwt',
  },
  // Proveedores de autenticación
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials.password) {
          return null;
        }

        // 1. Buscar el usuario por nombre de usuario
        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });

        if (!user) {
          return null;
        }

        // 2. Comparar la contraseña hasheada
        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) {
          return null;
        }

        // 3. Si la autenticación es exitosa, devolver el objeto de usuario
        return {
          id: user.id,
          username: user.username,
        };
      },
    }),
  ],
  // Callbacks para manejar la sesión y el JWT
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  // Página de inicio de sesión personalizada
  pages: {
    signIn: '/login',
  },
};
