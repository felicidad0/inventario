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

// GET
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const authError = await checkAuth();
  if (authError) return authError;

  try {
    const { id } = await context.params;

    const product = await prisma.product.findUnique({
      where: { id },
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

// PUT
export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  const authError = await checkAuth();
  if (authError) return authError;

  try {
    const { id } = await context.params;
    const { name, quantity } = await request.json();

    if (!name || typeof quantity !== 'number' || quantity < 0) {
      return NextResponse.json(
        { message: 'Datos de producto inválidos' },
        { status: 400 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { name, quantity },
    });

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error('Error al actualizar producto:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE
export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  const authError = await checkAuth();
  if (authError) return authError;

  try {
    const { id } = await context.params;

    await prisma.product.delete({
      where: { id },
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
