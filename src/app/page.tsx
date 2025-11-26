// src/app/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from './lib/auth';
import LogoutButton from '@/components/LogoutButton';
import InventoryPanel from '@/components/InventoryPanel';


export default async function HomePage() {
  // La sesión ya está protegida por el middleware, pero la obtenemos para mostrar el nombre de usuario
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra de Navegación */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-indigo-600">
            Panel de Inventario
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Bienvenido, {session?.user?.username || 'Usuario'}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <InventoryPanel />
      </main>
    </div>
  );
}
