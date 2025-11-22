"use client";

import { AveFormModal } from "@/components/ave-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAves, getAvesStats, deleteAve, getJaulas } from "@/lib/db-actions";
import { useEffect, useState } from "react";
import { NavHeader } from "@/components/nav-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationEllipsis,
  PaginationNext,
} from "@/components/ui/pagination";

type Ave = {
  id: number;
  fecha_ingreso: string;
  raza: string;
  jaula_id: number | null;
  jaula_numero: string | null;
  estado: "Activa" | "Enferma";
  peso: number | null;
  edad: number | null;
};

type Jaula = {
  id: number;
  numero: string;
};

type Stats = {
  total: number;
  activas: number;
  enfermas: number;
  razas: number;
};

export default function AvesPage() {
  const [aves, setAves] = useState<Ave[]>([]);
  const [jaulas, setJaulas] = useState<Jaula[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAve, setSelectedAve] = useState<Ave | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const totalPages = stats ? Math.ceil(stats.total / pageSize) : 0;

  async function loadData(page = 1) {
    setIsLoading(true);
    const [fetchedAves, fetchedStats, fetchedJaulas] = await Promise.all([
      getAves(page, pageSize),
      getAvesStats(),
      getJaulas(),
    ]);
    setAves(fetchedAves as Ave[]);
    setStats(fetchedStats as Stats);
    setJaulas(fetchedJaulas as Jaula[]);
    setIsLoading(false);
  }

  useEffect(() => {
    loadData(currentPage);
  }, [currentPage]);

  const handleOpenModal = (ave?: Ave) => {
    setSelectedAve(ave || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAve(null);
    loadData(currentPage);
  };

  const handleDelete = async (id: number) => {
    await deleteAve(id);
    loadData(currentPage);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Aves
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Administra las aves de tu granja avícola
            </p>
          </div>
          <Button
            onClick={() => handleOpenModal()}
            className="w-full bg-teal-800 text-white hover:bg-teal-900 sm:w-auto"
          >
            + Nueva Ave
          </Button>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-600">Total Aves</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats?.total ?? 0}
            </p>
          </div>
          <div className="rounded-lg border bg-green-50 p-6 shadow-sm">
            <p className="text-sm text-gray-600">Activas</p>
            <p className="mt-2 text-3xl font-bold text-green-700">
              {stats?.activas ?? 0}
            </p>
          </div>
          <div className="rounded-lg border bg-yellow-50 p-6 shadow-sm">
            <p className="text-sm text-gray-600">Enfermas</p>
            <p className="mt-2 text-3xl font-bold text-yellow-700">
              {stats?.enfermas ?? 0}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-600">Razas</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats?.razas ?? 0}
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border bg-white shadow-sm">
          <div className="hidden sm:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-orange-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    Ingreso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    Raza
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    Jaula
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    Peso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    Edad
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
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <Skeleton className="h-4 w-12" />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <Skeleton className="h-4 w-12" />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex gap-2">
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-8 w-16" />
                          </div>
                        </td>
                      </tr>
                    ))
                  : aves.map((ave) => (
                      <tr key={ave.id}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {new Date(ave.fecha_ingreso).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {ave.raza}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {ave.jaula_numero || "Sin asignar"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                              ave.estado === "Activa"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {ave.estado}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {ave.peso ? `${ave.peso} kg` : "N/A"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {ave.edad ? `${ave.edad} sem` : "N/A"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenModal(ave)}
                              className="border-orange-600 text-orange-600 hover:bg-orange-50"
                            >
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(ave.id)}
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
            ) : aves.length > 0 ? (
              <div className="space-y-4 p-4">
                {aves.map((ave) => (
                  <div key={ave.id} className="rounded-lg border p-4">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">
                        {ave.raza}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          ave.estado === "Activa"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {ave.estado}
                      </span>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <span className="text-sm text-gray-600">
                        Ingreso:{" "}
                        {new Date(ave.fecha_ingreso).toLocaleDateString()}
                      </span>
                      <span className="text-sm text-gray-600">
                        Jaula: {ave.jaula_numero || "N/A"}
                      </span>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <span className="text-sm text-gray-600">
                        Peso: {ave.peso ? `${ave.peso} kg` : "N/A"}
                      </span>
                      <span className="text-sm text-gray-600">
                        Edad: {ave.edad ? `${ave.edad} sem` : "N/A"}
                      </span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenModal(ave)}
                        className="w-full border-orange-600 text-orange-600 hover:bg-orange-50"
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(ave.id)}
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
                  <EmptyTitle>No hay aves registradas</EmptyTitle>
                  <EmptyDescription>
                    Comienza a agregar aves para verlas aquí.
                  </EmptyDescription>
                </Empty>
              </div>
            )}
          </div>
          {aves.length === 0 && !isLoading && (
            <div className="hidden py-12 sm:block">
              <Empty>
                <EmptyTitle>No hay aves registradas</EmptyTitle>
                <EmptyDescription>
                  Comienza a agregar aves para verlas aquí.
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
                      {Math.min(currentPage * pageSize, stats?.total ?? 0)}
                    </span>{" "}
                    de <span className="font-medium">{stats?.total ?? 0}</span>{" "}
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

      <AveFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        ave={selectedAve}
        jaulas={jaulas}
      />
    </div>
  );
}
