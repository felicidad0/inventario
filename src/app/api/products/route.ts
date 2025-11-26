// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';

// Middleware de protección: Aunque el middleware global protege las páginas,
// es buena práctica proteger explícitamente las rutas de API también.
async function checkAuth() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }
  return null;
}

// GET: Obtener todos los productos (Inventario)
export async function GET(request: Request) {
  const authError = await checkAuth();
  if (authError) return authError;

  try {
    // Implementación de paginación para escalabilidad (miles de productos)
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const products = await prisma.product.findMany({
      skip: skip,
      take: limit,
      orderBy: {
        name: 'asc',
      },
    });

    const totalProducts = await prisma.product.count();

    return NextResponse.json({
      products,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
      totalProducts,
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST: Crear un nuevo producto
export async function POST(request: Request) {
  const authError = await checkAuth();
  if (authError) return authError;

  try {
    const { name, quantity } = await request.json();

    if (!name || typeof quantity !== 'number' || quantity < 0) {
      return NextResponse.json(
        { message: 'Datos de producto inválidos' },
        { status: 400 }
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        quantity,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error al crear producto:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
