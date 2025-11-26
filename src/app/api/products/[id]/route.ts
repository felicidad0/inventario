// src/app/api/products/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';

async function checkAuth() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }
  return null;
}

// GET: Obtener un producto por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const authError = await checkAuth();
  if (authError) return authError;

  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return NextResponse.json(
        { message: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT: Actualizar un producto por ID
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: { name, quantity },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar un producto por ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const authError = await checkAuth();
  if (authError) return authError;

  try {
    await prisma.product.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
