// src/middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  // Función de callback que se ejecuta si el usuario está autenticado
  function middleware(req) {
    // Si el usuario intenta acceder a /login estando autenticado, redirigir a /
    if (req.nextUrl.pathname === '/login' && req.nextauth.token) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    // Permitir el acceso a la ruta si está autenticado
    return NextResponse.next();
  },
  // Configuración de las rutas protegidas
  {
    callbacks: {
      // Si el usuario no está autenticado, redirigir a la página de inicio de sesión
      authorized: ({ token, req }) => {
        // Permitir acceso a la página de login y las rutas de API de auth
        if (
          req.nextUrl.pathname === '/login' ||
          req.nextUrl.pathname.startsWith('/api/auth')
        ) {
          return true;
        }
        // Requerir token para todas las demás rutas
        return !!token;
      },
    },
    // Rutas que serán ignoradas por el middleware (opcional, ya cubierto por authorized)
    // pages: {
    //   signIn: '/login',
    // },
  }
);

// Configuración del matcher para aplicar el middleware a todas las rutas
export const config = {
  matcher: ['/', '/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
