"use client";

import { GastoFormModal } from "@/components/gasto-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getGastos,
  getGastosCount,
  getGastosStats,
  deleteGasto,
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

type Gasto = {
  id: number;
  fecha: string;
  categoria: "Alimento" | "Medicinas" | "Servicios" | "Equipos" | "Otros";
  descripcion: string;
  cantidad: number;
  monto: number;
  notas?: string | null;
};

type Stats = {
  total_gastos: number;
  monto_total: number;
  promedio_gasto: number;
  categorias: number;
};

const categoriaColors: Record<Gasto["categoria"], string> = {
  "Alimento": "bg-amber-100 text-amber-800",
  "Medicinas": "bg-red-100 text-red-800",
  "Servicios": "bg-blue-100 text-blue-800",
  "Equipos": "bg-purple-100 text-purple-800",
  "Otros": "bg-gray-100 text-gray-800",
};

function GastosContent() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGasto, setSelectedGasto] = useState<Gasto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalGastos, setTotalGastos] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const totalPages = Math.ceil(totalGastos / pageSize);

  const searchParams = useSearchParams();
  const router = useRouter();

  const fecha = searchParams.get("fecha") || "";
  const categoria = searchParams.get("categoria") || "";

  async function loadData(page = 1) {
    setIsLoading(true);
    try {
      const [fetchedGastos, fetchedTotal, fetchedStats] = await Promise.all([
        getGastos(fecha || undefined, categoria || undefined, page, pageSize),
        getGastosCount(fecha || undefined, categoria || undefined),
        getGastosStats(),
      ]);
      setGastos(fetchedGastos as Gasto[]);
      setTotalGastos(fetchedTotal as number);
      setStats(fetchedStats as Stats);
    } catch (error) {
      console.error("Error loading gastos:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData(currentPage);
  }, [fecha, categoria, currentPage]);

  const handleOpenModal = (gasto?: Gasto) => {
    setSelectedGasto(gasto || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGasto(null);
    loadData(currentPage);
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este gasto?")) {
      await deleteGasto(id);
      loadData(currentPage);
    }
  };

  const handleFilterChange = (type: "fecha" | "categoria", value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(type, value);
    } else {
      params.delete(type);
    }
    setCurrentPage(1);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Gastos
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Control y seguimiento de gastos de la granja
            </p>
          </div>
          <Button
            onClick={() => handleOpenModal()}
            className="w-full bg-teal-800 text-white hover:bg-teal-900 sm:w-auto"
          >
            + Nuevo Gasto
          </Button>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-600">Total de Gastos</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats?.total_gastos ?? 0}
            </p>
          </div>
          <div className="rounded-lg border bg-red-50 p-6 shadow-sm">
            <p className="text-sm text-gray-600">Monto Total</p>
            <p className="mt-2 text-3xl font-bold text-red-700">
              ${(stats?.monto_total ?? 0).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="rounded-lg border bg-orange-50 p-6 shadow-sm">
            <p className="text-sm text-gray-600">Promedio por Gasto</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              ${Math.round(stats?.promedio_gasto ?? 0)}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-600">Categorías</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats?.categorias ?? 0}
            </p>
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
              <Label>Filtrar por Categoría:</Label>
              <Select
                value={categoria}
                onValueChange={(value) =>
                  handleFilterChange("categoria", value)
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las categorías</SelectItem>
                  <SelectItem value="Alimento">Alimento</SelectItem>
                  <SelectItem value="Medicinas">Medicinas</SelectItem>
                  <SelectItem value="Servicios">Servicios</SelectItem>
                  <SelectItem value="Equipos">Equipos</SelectItem>
                  <SelectItem value="Otros">Otros</SelectItem>
                </SelectContent>
              </Select>
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
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    Notas
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
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <Skeleton className="h-4 w-20" />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <Skeleton className="h-4 w-20" />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <Skeleton className="h-4 w-20" />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex gap-2">
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-8 w-16" />
                          </div>
                        </td>
                      </tr>
                    ))
                  : gastos.map((gasto) => (
                      <tr key={gasto.id}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {new Date(gasto.fecha).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                              categoriaColors[gasto.categoria]
                            }`}
                          >
                            {gasto.categoria}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="font-medium text-gray-900">
                            {gasto.descripcion}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {gasto.cantidad.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-red-600">
                          ${gasto.monto.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {gasto.notas || "-"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenModal(gasto)}
                              className="border-orange-600 text-orange-600 hover:bg-orange-50"
                            >
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(gasto.id)}
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
            ) : gastos.length > 0 ? (
              <div className="space-y-4 p-4">
                {gastos.map((gasto) => (
                  <div key={gasto.id} className="rounded-lg border p-4">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">
                        {gasto.descripcion}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          categoriaColors[gasto.categoria]
                        }`}
                      >
                        {gasto.categoria}
                      </span>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <span className="text-sm text-gray-600">
                        {new Date(gasto.fecha).toLocaleDateString()}
                      </span>
                      <span className="text-sm text-gray-600">
                        Cantidad: {gasto.cantidad.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <span className="text-sm text-gray-600">Monto:</span>
                      <span className="font-semibold text-red-600">
                        ${gasto.monto.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    {gasto.notas && (
                      <p className="mt-2 text-sm text-gray-600">
                        {gasto.notas}
                      </p>
                    )}
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenModal(gasto)}
                        className="flex-1 border-orange-600 text-orange-600 hover:bg-orange-50"
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(gasto.id)}
                        className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
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
                  <EmptyTitle>No hay gastos registrados</EmptyTitle>
                  <EmptyDescription>
                    Comienza a agregar gastos para verlos aquí.
                  </EmptyDescription>
                </Empty>
              </div>
            )}
          </div>
          {gastos.length === 0 && !isLoading && (
            <div className="hidden py-12 sm:block">
              <Empty>
                <EmptyTitle>No hay gastos registrados</EmptyTitle>
                <EmptyDescription>
                  Comienza a agregar gastos para verlos aquí.
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
                      {Math.min(currentPage * pageSize, totalGastos)}
                    </span>{" "}
                    de <span className="font-medium">{totalGastos}</span>{" "}
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

      <GastoFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        gasto={selectedGasto}
      />
    </div>
  );
}

export default function GastosPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          Cargando...
        </div>
      }
    >
      <GastosContent />
    </Suspense>
  );
}
