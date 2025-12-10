'use client';
import { useState, useEffect, useRef, useMemo , useCallback  } from 'react';
import {
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import type { Product } from "@/types/product";

// Tipos
interface InventoryResponse {
  products: Product[];
  totalPages: number;
  currentPage: number;
  totalProducts: number;
}

/* ---------------------------
   ProductForm (modal crear/editar)
----------------------------*/
interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
  onSave: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onClose, onSave }) => {
  const [name, setName] = useState(product?.name || '');
  const [quantity, setQuantity] = useState(product?.quantity?.toString() || '0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setName(product?.name || '');
    setQuantity(product?.quantity?.toString() || '0');
    setError('');
  }, [product]);

  const isEditing = !!product;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const url = isEditing ? `/api/products/${product?.id}` : '/api/products';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, quantity: parseInt(quantity, 10) || 0 }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Error al guardar el producto');
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 modal-overlay">
      <div className="modal-card">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {isEditing ? 'Editar Producto' : 'Añadir Nuevo Producto'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre del Producto</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Cantidad</label>
            <input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              min={0}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">{error}</p>}

          <div className="modal-actions flex justify-end space-x-3">
            <button type="button" onClick={onClose} disabled={loading} className="btn-ghost px-4 py-2 text-sm font-medium rounded-md">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-primary px-4 py-2 text-sm font-medium rounded-md flex items-center">
              {loading && <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />}
              {isEditing ? 'Guardar Cambios' : 'Añadir Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ---------------------------
   ProductRow
----------------------------*/
const ProductRow = ({ product, onEdit, onDelete }: { product: Product; onEdit: (p: Product)=>void; onDelete: (id: string)=>void; }) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 name-col">{product.name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 quantity-col">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          product.quantity > 10 ? 'bg-green-100 text-green-800' : product.quantity > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
        }`}>{product.quantity}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(product.updatedAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
        <button onClick={() => onEdit(product)} className="inline-flex items-center gap-2 px-3 py-1 rounded-md btn-icon btn-edit" title="Editar" aria-label={`Editar ${product.name}`}>
          <PencilSquareIcon className="h-5 w-5 text-indigo-600" />
          <span className="hidden sm:inline text-sm text-indigo-700 font-medium">Editar</span>
        </button>

        <button onClick={() => onDelete(product.id)} className="inline-flex items-center gap-2 px-3 py-1 rounded-md btn-icon btn-delete" title="Eliminar" aria-label={`Eliminar ${product.name}`}>
          <TrashIcon className="h-5 w-5 text-red-600" />
          <span className="hidden sm:inline text-sm text-red-700 font-medium">Eliminar</span>
        </button>
      </td>
    </tr>
  );
};

/* ---------------------------
   InventoryPanel (principal)
----------------------------*/
export default function InventoryPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 10;

  const [searchName, setSearchName] = useState('');
  const [minQuantity, setMinQuantity] = useState<string>('');

// antes: const debounceRef = useRef<number | null>(null);
const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Nuevo: evita llamadas duplicadas con los mismos params
  const lastParamsRef = useRef<string | null>(null);
const mountedRef = useRef(false);
  /* fetchProducts: establecemos una función que siempre use los últimos estados */
async function fetchProducts(opts?: { append?: boolean; requestedPage?: number }) {
  const requestedPage = opts?.requestedPage ?? page;

  // dedupe: calculamos key y comprobamos ANTES de tocar estado
  const paramsKey = `${requestedPage}|${searchName}|${minQuantity}`;
  if (lastParamsRef.current === paramsKey) {
    // ya se pidió exactamente esto -> no hacemos nada
    return;
  }
  // marcamos como en curso
  lastParamsRef.current = paramsKey;

  setLoading(true);
  setError('');

  // cancelar previo
  if (abortRef.current) abortRef.current.abort();
  const controller = new AbortController();
  abortRef.current = controller;

  try {
    const params = new URLSearchParams();
    params.set('page', String(requestedPage));
    params.set('limit', String(limit));
    if (searchName) { params.set('search', searchName); /* puedes quitar duplicados */ }
    if (minQuantity !== '') params.set('minQuantity', String(parseInt(minQuantity, 10) || 0));

    const res = await fetch(`/api/products?${params.toString()}`, { signal: controller.signal });
    if (!res.ok) throw new Error('Error al cargar el inventario');

    const data: InventoryResponse = await res.json();

    if (opts?.append) {
      setProducts(prev => {
        const existing = new Set(prev.map(p => p.id));
        const newItems = data.products.filter(p => !existing.has(p.id));
        return prev.concat(newItems);
      });
    } else {
      setProducts(data.products);
    }

    setTotalPages(data.totalPages);
    setTotalProducts(data.totalProducts);
    setPage(data.currentPage || requestedPage);
  } catch (err: any) {
    if (err?.name === 'AbortError') return;
    setError(err?.message || String(err));
  } finally {
    setLoading(false);
    // NO limpiamos lastParamsRef aquí: mantiene dedupe hasta que cambien params
  }
}


  useEffect(() => {
    // fetch inicial (solo una vez)
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));
        if (searchName) { params.set('search', searchName); params.set('name', searchName); }
        if (minQuantity !== '') {
          const mq = parseInt(minQuantity, 10);
          params.set('minQuantity', String(Number.isFinite(mq) ? mq : 0));
        }
        const res = await fetch(`/api/products?${params.toString()}`, { signal: controller.signal });
        if (!res.ok) throw new Error('Error al cargar el inventario');
        const data: InventoryResponse = await res.json();
        setProducts(data.products);
        setTotalPages(data.totalPages);
        setTotalProducts(data.totalProducts);
        setPage(data.currentPage || page);
      } catch (err: any) {
        if (err?.name !== 'AbortError') setError(err?.message || String(err));
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // <-- solo al montar

  /* Debounce para búsqueda: evita doble fetch.
     Si la página actual no es 1 -> cambiamos a 1 (el efecto page hará el fetch).
     Si la página ya es 1 -> ejecutamos fetchProducts solo UNA vez. */
useEffect(() => {
  if (debounceRef.current) {
    clearTimeout(debounceRef.current);
    debounceRef.current = null;
  }

  debounceRef.current = setTimeout(() => {
    if (page !== 1) {
      setPage(1); // La effect de `page` hará fetchProducts({ requestedPage: 1 })
    } else {
      // Ya estamos en la página 1 -> lanzar fetch una sola vez
      fetchProducts({ requestedPage: 1 });
    }
  }, 300);

  return () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [searchName, minQuantity]);

// NOTA: dejamos fuera fetchProducts para evitar recreaciones dobles en dev

  /* ---------- Cuando cambia la página (por paginación) */


useEffect(() => {
  if (!mountedRef.current) {
    mountedRef.current = true;
    return; // primer render: no disparamos fetch desde aquí (ya haremos el fetch de inicio)
  }
  fetchProducts({ requestedPage: page });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [page]);

  /* ---------- Handlers */
 const handleDelete = useCallback(async (id: string) => {
  if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) return;

  const prev = products;
  setProducts(p => p.filter(it => it.id !== id));
  setTotalProducts(t => Math.max(0, t - 1));

  try {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar el producto');
  } catch (err: any) {
    setProducts(prev);
    setError(err?.message || String(err));
  }
}, [products]); // si prefieres, evita poner `products` y usa setProducts(prev => ...) exclusivamente para no depender de products


  const handleOpenModal = (product: Product | null = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  const handleSave = () => {
    // recargar la página actual para reflejar cambios
    // limpiar lastParams para forzar reload aunque los params sean iguales
    lastParamsRef.current = null;
    fetchProducts({ requestedPage: page });
  };

  const visibleProducts = useMemo(() => {
    const q = searchName.trim().toLowerCase();
    const minQ = (minQuantity !== '') ? (parseInt(minQuantity, 10) || 0) : null;
    return products.filter(p => {
      const matchesName = q ? p.name.toLowerCase().includes(q) : true;
      const matchesQty = (minQ !== null) ? (p.quantity >= minQ) : true;
      return matchesName && matchesQty;
    });
  }, [products, searchName, minQuantity]);


  const renderedRows = useMemo(() => visibleProducts.map(prod => (
    <ProductRow key={prod.id} product={prod} onEdit={handleOpenModal} onDelete={handleDelete} />
  )), [visibleProducts]);

  return (
    <div className="bg-white shadow-xl rounded-lg p-6 inventory-panel">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 inventory-header">
        <div>
          <h2 className="text-3xl font-semibold text-red-600">Inventario de Productos ({totalProducts})</h2>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto header-controls">
          <input
            aria-label="Buscar por nombre"
            placeholder="Buscar producto por nombre..."
            value={searchName}
            onChange={(e) => { setSearchName(e.target.value); }}
            className="w-full sm:w-64 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 search-input"
          />

          <input
            aria-label="Filtrar por cantidad mínima"
            placeholder="Cant. mínima"
            type="number"
                        id="btnbuscar"

            value={minQuantity}
            onChange={(e) => { setMinQuantity(e.target.value); }}
            className="w-28 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 filter-input"
          />

          <button onClick={() => handleOpenModal()} className="flex items-center px-5 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition btn-add">
            <PlusCircleIcon className="h-5 w-5 mr-2" />
            Añadir
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 inventory-error">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-500">Cargando inventario...</div>
      ) : visibleProducts.length === 0 ? (
        <div className="text-center py-10 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg empty-state">
          <p className="text-lg">No hay productos que coincidan.</p>
          <p className="text-sm mt-2">Prueba con otro término de búsqueda o añade el primer producto.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto inventory-table">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider name-col">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider quantity-col">Cantidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Actualización</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">{renderedRows}</tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-700">Mostrando <span className="font-medium">{(page - 1) * limit + 1}</span> a <span className="font-medium">{Math.min(page * limit, totalProducts)}</span> de <span className="font-medium">{totalProducts}</span> resultados</p>

              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px pagination" aria-label="Pagination">
                <button onClick={() => setPage(prev => Math.max(1, prev - 1))} disabled={page === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">Anterior</button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-indigo-600 text-sm font-medium text-white">{page}</span>
                <button onClick={() => setPage(prev => Math.min(totalPages, prev + 1))} disabled={page === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">Siguiente</button>
              </nav>
            </div>
          )}
        </>
      )}

      {isModalOpen && <ProductForm product={editingProduct} onClose={handleCloseModal} onSave={handleSave} />}
    </div>
  );
}
