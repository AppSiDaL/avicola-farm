"use client";

import { VentaFormModal } from "@/components/venta-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getVentas,
  getVentasCount,
  getVentasStats,
  deleteVenta,
} from "@/lib/db-actions";
import { useEffect, useState, Suspense } from "react";
import { NavHeader } from "@/components/nav-header";
import { useSearchParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from "@/components/ui/pagination";

type Venta = {
  id: number;
  fecha: string;
  cliente_nombre: string;
  cantidad_kg: number;
  total: number;
};

type Stats = {
  total_ventas: number;
  ingresos_totales: number;
  promedio_venta: number;
  clientes_unicos: number;
};

function VentasContent() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalVentas, setTotalVentas] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const totalPages = Math.ceil(totalVentas / pageSize);

  const searchParams = useSearchParams();
  const router = useRouter();

  const fecha = searchParams.get("fecha") || "";
  const cliente = searchParams.get("cliente") || "";

  async function loadData(page = 1) {
    setIsLoading(true);
    const [fetchedVentas, fetchedTotal, fetchedStats] = await Promise.all([
      getVentas(fecha, cliente, page, pageSize),
      getVentasCount(fecha, cliente),
      getVentasStats(),
    ]);
    setVentas(fetchedVentas as Venta[]);
    setTotalVentas(fetchedTotal as number);
    setStats(fetchedStats as Stats);
    setIsLoading(false);
  }

  useEffect(() => {
    loadData(currentPage);
  }, [fecha, cliente, currentPage]);

  const handleOpenModal = (venta?: Venta) => {
    setSelectedVenta(venta || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVenta(null);
    loadData(currentPage);
  };

  const handleDelete = async (id: number) => {
    await deleteVenta(id);
    loadData(currentPage);
  };

  const handleFilterChange = (type: "fecha" | "cliente", value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(type, value);
    } else {
      params.delete(type);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Ventas
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Control y seguimiento de ventas de huevos
            </p>
          </div>
          <Button
            onClick={() => handleOpenModal()}
            className="w-full bg-teal-800 text-white hover:bg-teal-900 sm:w-auto"
          >
            + Nueva Venta
          </Button>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-600">Total Ventas</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stats?.total_ventas ?? 0}</p>
          </div>
          <div className="rounded-lg border bg-green-50 p-6 shadow-sm">
            <p className="text-sm text-gray-600">Ingresos Totales</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              ${(stats?.ingresos_totales ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border bg-yellow-50 p-6 shadow-sm">
            <p className="text-sm text-gray-600">Promedio por Venta</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              ${Math.round(stats?.promedio_venta ?? 0)}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-600">Clientes Únicos</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stats?.clientes_unicos ?? 0}</p>
          </div>
        </div>

        <div className="mt-6 rounded-lg bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <Label>Filtrar por Fecha:</Label>
              <Input
                type="date"
                className="mt-1"
                value={fecha}
                onChange={(e) => handleFilterChange("fecha", e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label>Filtrar por Cliente:</Label>
              <Input
                type="text"
                className="mt-1"
                placeholder="Buscar cliente..."
                value={cliente}
                onChange={(e) => handleFilterChange("cliente", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border bg-white shadow-sm">
          <div className="hidden sm:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-orange-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    Cantidad (kg)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index}>
                        <td className="whitespace-nowrap px-6 py-4">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <Skeleton className="h-4 w-32" />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <Skeleton className="h-4 w-20" />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <Skeleton className="h-4 w-20" />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex gap-2">
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-8 w-16" />
                          </div>
                        </td>
                      </tr>
                    ))
                  : ventas.map((venta) => (
                      <tr key={venta.id}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {new Date(venta.fecha).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="font-medium text-gray-900">
                            {venta.cliente_nombre}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {venta.cantidad_kg}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          ${venta.total}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenModal(venta)}
                              className="border-orange-600 text-orange-600 hover:bg-orange-50"
                            >
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(venta.id)}
                              className="border-red-600 text-red-600 hover:bg-red-50"
                            >
                              Eliminar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
          <div className="sm:hidden">
            {isLoading ? (
              <div className="space-y-4 p-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="rounded-lg border p-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="mt-2 h-4 w-1/2" />
                    <Skeleton className="mt-2 h-4 w-1/4" />
                    <div className="mt-4 flex gap-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : ventas.length > 0 ? (
              <div className="space-y-4 p-4">
                {ventas.map((venta) => (
                  <div key={venta.id} className="rounded-lg border p-4">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">
                        {venta.cliente_nombre}
                      </span>
                      <span className="text-sm text-gray-600">
                        {new Date(venta.fecha).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <span className="text-sm text-gray-600">
                        {venta.cantidad_kg} kg
                      </span>
                      <span className="font-semibold text-gray-900">
                        ${venta.total}
                      </span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenModal(venta)}
                        className="w-full border-orange-600 text-orange-600 hover:bg-orange-50"
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(venta.id)}
                        className="w-full border-red-600 text-red-600 hover:bg-red-50"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12">
                <Empty>
                  <EmptyTitle>No hay ventas registradas</EmptyTitle>
                  <EmptyDescription>
                    Comienza a agregar ventas para verlas aquí.
                  </EmptyDescription>
                </Empty>
              </div>
            )}
          </div>
          {ventas.length === 0 && !isLoading && (
            <div className="hidden py-12 sm:block">
              <Empty>
                <EmptyTitle>No hay ventas registradas</EmptyTitle>
                <EmptyDescription>
                  Comienza a agregar ventas para verlas aquí.
                </EmptyDescription>
              </Empty>
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <Button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                >
                  Anterior
                </Button>
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  variant="outline"
                >
                  Siguiente
                </Button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * pageSize + 1}
                    </span>{" "}
                    a{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * pageSize, totalVentas)}
                    </span>{" "}
                    de <span className="font-medium">{totalVentas}</span>{" "}
                    resultados
                  </p>
                </div>
                <div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage((prev) => Math.max(prev - 1, 1));
                          }}
                          className={
                            currentPage === 1
                              ? "pointer-events-none text-gray-400"
                              : ""
                          }
                        />
                      </PaginationItem>
                      {[...Array(totalPages)].map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(i + 1);
                            }}
                            isActive={currentPage === i + 1}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            );
                          }}
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none text-gray-400"
                              : ""
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <VentaFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        venta={selectedVenta}
      />
    </div>
  );
}

export default function VentasPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Cargando...</div>}>
      <VentasContent />
    </Suspense>
  );
}
