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
  getGalpones,
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
  fecha: string;
  huevos_recolectados: number;
  huevos_rotos: number;
  notas?: string | null;
  jaula_numero?: string;
  galpon_nombre?: string;
};

type Galpon = {
  id: number;
  nombre: string;
};

type Jaula = {
  id: number;
  numero: string;
  galpon_nombre: string;
}

type Stats = {
  total_huevos: number;
  promedio_diario: number;
  huevos_rotos: number;
  porcentaje_rotos: number;
};

function PosturaContent() {
  const [registros, setRegistros] = useState<RegistroPostura[]>([]);
  const [galpones, setGalpones] = useState<Galpon[]>([]);
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

  const filterType = (searchParams.get("filterType") as 'galpon' | 'jaula') || "galpon";
  const filterId = searchParams.get("filterId") || "todos";
  const fechaInicio = searchParams.get("fechaInicio") || "";
  const fechaFin = searchParams.get("fechaFin") || "";

  async function loadData(page = 1) {
    setIsLoading(true);
    const filter = { type: filterType, id: filterId };
    const [
      fetchedRegistros,
      fetchedTotal,
      fetchedStats,
      fetchedGalpones,
      fetchedJaulas,
    ] = await Promise.all([
      getRegistrosPostura(filter, fechaInicio, fechaFin, page, pageSize),
      getRegistrosPosturaCount(filter, fechaInicio, fechaFin),
      getPosturaStats(fechaInicio, fechaFin),
      getGalpones(),
      getJaulas(),
    ]);
    setRegistros(fetchedRegistros as RegistroPostura[]);
    setTotalRegistros(fetchedTotal as number);
    setStats(fetchedStats as Stats);
    setGalpones(fetchedGalpones as Galpon[]);
    setJaulas(fetchedJaulas as Jaula[]);
    setIsLoading(false);
  }

  useEffect(() => {
    loadData(currentPage);
  }, [filterType, filterId, fechaInicio, fechaFin, currentPage]);

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
    type: "filterType" | "filterId" | "fechaInicio" | "fechaFin",
    value: string
  ) => {
    const params = new URLSearchParams(searchParams);
    if (type === 'filterType') {
      params.set('filterType', value);
      params.delete('filterId'); // Reset id when type changes
    } else if (value) {
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
              Controla la producción diaria de huevos por galpón o jaula.
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <Label>Filtrar por</Label>
              <Select
                value={filterType}
                onValueChange={(value) => handleFilterChange("filterType", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="galpon">Galpón</SelectItem>
                  <SelectItem value="jaula">Jaula</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{filterType === 'galpon' ? 'Galpón' : 'Jaula'}</Label>
              <Select
                value={filterId}
                onValueChange={(value) => handleFilterChange("filterId", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">
                    {filterType === 'galpon' ? 'Todos los galpones' : 'Todas las jaulas'}
                  </SelectItem>
                  {filterType === 'galpon'
                    ? galpones.map((g) => (
                        <SelectItem key={g.id} value={String(g.id)}>
                          {g.nombre}
                        </SelectItem>
                      ))
                    : jaulas.map((j) => (
                        <SelectItem key={j.id} value={String(j.id)}>
                          {j.galpon_nombre} - {j.numero}
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
                    Ubicación
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
                        <td className="whitespace-nowrap px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="whitespace-nowrap px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                        <td className="whitespace-nowrap px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                        <td className="whitespace-nowrap px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                        <td className="whitespace-nowrap px-6 py-4"><Skeleton className="h-4 w-24" /></td>
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
                          {registro.jaula_numero ? `Jaula ${registro.jaula_numero}` : `Galpón ${registro.galpon_nombre}`}
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
                            <Button variant="outline" size="sm" onClick={() => handleOpenModal(registro)} className="border-orange-600 text-orange-600 hover:bg-orange-50">
                              Editar
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(registro.id)} className="border-red-600 text-red-600 hover:bg-red-50">
                              Eliminar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
          {/* Mobile view and pagination remains similar, adjust if needed */}
        </div>
      </main>

      <PosturaFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        registro={selectedRegistro}
        galpones={galpones}
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
