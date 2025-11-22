"use client";

import { PosturaFormModal } from "@/components/postura-form";
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
  getRegistrosPostura,
  getRegistrosPosturaCount,
  getPosturaStats,
  deleteRegistroPostura,
  getJaulas,
} from "@/lib/db-actions";
import { Suspense, useEffect, useState } from "react";
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

type RegistroPostura = {
  id: number;
  jaula_id: number;
  jaula_numero: string;
  fecha: string;
  huevos_recolectados: number;
  huevos_rotos: number;
  notas?: string | null;
};

type Jaula = {
  id: number;
  numero: string;
};

type Stats = {
  total_huevos: number;
  promedio_diario: number;
  huevos_rotos: number;
  porcentaje_rotos: number;
};

function PosturaContent() {
  const [registros, setRegistros] = useState<RegistroPostura[]>([]);
  const [jaulas, setJaulas] = useState<Jaula[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRegistro, setSelectedRegistro] =
    useState<RegistroPostura | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const totalPages = Math.ceil(totalRegistros / pageSize);

  const searchParams = useSearchParams();
  const router = useRouter();

  const jaulaId = searchParams.get("jaulaId") || "todas";
  const fechaInicio = searchParams.get("fechaInicio") || "";
  const fechaFin = searchParams.get("fechaFin") || "";

  async function loadData(page = 1) {
    setIsLoading(true);
    const [
      fetchedRegistros,
      fetchedTotal,
      fetchedStats,
      fetchedJaulas,
    ] = await Promise.all([
      getRegistrosPostura(jaulaId, fechaInicio, fechaFin, page, pageSize),
      getRegistrosPosturaCount(jaulaId, fechaInicio, fechaFin),
      getPosturaStats(fechaInicio, fechaFin),
      getJaulas(),
    ]);
    setRegistros(fetchedRegistros as RegistroPostura[]);
    setTotalRegistros(fetchedTotal as number);
    setStats(fetchedStats as Stats);
    setJaulas(fetchedJaulas as Jaula[]);
    setIsLoading(false);
  }

  useEffect(() => {
    loadData(currentPage);
  }, [jaulaId, fechaInicio, fechaFin, currentPage]);

  const handleOpenModal = (registro?: RegistroPostura) => {
    setSelectedRegistro(registro || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRegistro(null);
    loadData(currentPage);
  };

  const handleDelete = async (id: number) => {
    await deleteRegistroPostura(id);
    loadData(currentPage);
  };

  const handleFilterChange = (
    type: "jaulaId" | "fechaInicio" | "fechaFin",
    value: string
  ) => {
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
              Registro de Postura
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Controla la producción diaria de huevos
            </p>
          </div>
          <Button
            onClick={() => handleOpenModal()}
            className="w-full bg-teal-800 text-white hover:bg-teal-900 sm:w-auto"
          >
            + Nuevo Registro
          </Button>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-600">Total Huevos</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats?.total_huevos ?? 0}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-600">Promedio Diario</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {Math.round(stats?.promedio_diario ?? 0)}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-600">Huevos Rotos</p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {stats?.huevos_rotos ?? 0}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-600">% Rotos</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {(stats?.porcentaje_rotos ?? 0).toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-lg bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label>Jaula</Label>
              <Select
                defaultValue={jaulaId}
                onValueChange={(value) => handleFilterChange("jaulaId", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las jaulas</SelectItem>
                  {jaulas.map((jaula) => (
                    <SelectItem key={jaula.id} value={String(jaula.id)}>
                      {jaula.numero}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fecha Inicio</Label>
              <Input
                type="date"
                value={fechaInicio}
                onChange={(e) =>
                  handleFilterChange("fechaInicio", e.target.value)
                }
              />
            </div>
            <div>
              <Label>Fecha Fin</Label>
              <Input
                type="date"
                value={fechaFin}
                onChange={(e) => handleFilterChange("fechaFin", e.target.value)}
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
                    Jaula
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    Recolectados
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    Rotos
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
                          <Skeleton className="h-4 w-20" />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <Skeleton className="h-4 w-20" />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <Skeleton className="h-4 w-16" />
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
                  : registros.map((registro) => (
                      <tr key={registro.id}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {new Date(registro.fecha).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {registro.jaula_numero}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {registro.huevos_recolectados}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-red-600">
                          {registro.huevos_rotos}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {registro.notas}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenModal(registro)}
                              className="border-orange-600 text-orange-600 hover:bg-orange-50"
                            >
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(registro.id)}
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
            ) : registros.length > 0 ? (
              <div className="space-y-4 p-4">
                {registros.map((registro) => (
                  <div key={registro.id} className="rounded-lg border p-4">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">
                        Jaula {registro.jaula_numero}
                      </span>
                      <span className="text-sm text-gray-600">
                        {new Date(registro.fecha).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <span className="text-sm text-gray-600">
                        Recolectados: {registro.huevos_recolectados}
                      </span>
                      <span className="text-sm text-red-600">
                        Rotos: {registro.huevos_rotos}
                      </span>
                    </div>
                    {registro.notas && (
                      <p className="mt-2 text-sm text-gray-600">
                        {registro.notas}
                      </p>
                    )}
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenModal(registro)}
                        className="w-full border-orange-600 text-orange-600 hover:bg-orange-50"
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(registro.id)}
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
                  <EmptyTitle>No hay registros de postura</EmptyTitle>
                  <EmptyDescription>
                    Comienza a agregar registros para verlos aquí.
                  </EmptyDescription>
                </Empty>
              </div>
            )}
          </div>
          {registros.length === 0 && !isLoading && (
            <div className="hidden py-12 sm:block">
              <Empty>
                <EmptyTitle>No hay registros de postura</EmptyTitle>
                <EmptyDescription>
                  Comienza a agregar registros para verlos aquí.
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
                      {Math.min(currentPage * pageSize, totalRegistros)}
                    </span>{" "}
                    de <span className="font-medium">{totalRegistros}</span>{" "}
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

      <PosturaFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        registro={selectedRegistro}
        jaulas={jaulas}
      />
    </div>
  );
}

export default function PosturaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Cargando...</div>}>
      <PosturaContent />
    </Suspense>
  );
}
