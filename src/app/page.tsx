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
    <header className="site-header bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-indigo-600">
          Panel de Inventario
        </h1>

        {/* acciones del header: en pantallas pequeñas se apilan */}
        <div className="header-actions flex items-center space-x-6">
          <span className="welcome-text text-sm sm:text-base text-slate-600 truncate">
            Bienvenido, {session?.user?.username || 'Usuario'}
          </span>

          {/* LogoutButton recibe la clase logout-btn para estilos personalizados */}
          <div className="logout-wrapper">
            <LogoutButton className="logout-btn" />
          </div>
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
