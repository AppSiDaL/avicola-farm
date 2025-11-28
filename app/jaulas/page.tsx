"use client";

import { JaulaFormModal } from "@/components/jaula-form";
import { Button } from "@/components/ui/button";
import { getJaulas, deleteJaula, getGalpones } from "@/lib/db-actions";
import { Suspense, useEffect, useState } from "react";
import { NavHeader } from "@/components/nav-header";
import { Skeleton } from "@/components/ui/skeleton";

type Jaula = {
  id: number;
  numero: string;
  galpon_id: number;
  galpon_nombre: string;
  capacidad_maxima: number;
  total_aves: number;
  estado: string;
  fecha_instalacion: string;
};

type Galpon = {
  id: number;
  nombre: string;
};

function JaulasContent() {
  const [jaulas, setJaulas] = useState<Jaula[]>([]);
  const [galpones, setGalpones] = useState<Galpon[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJaula, setSelectedJaula] = useState<Jaula | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadData() {
    setIsLoading(true);
    const [fetchedJaulas, fetchedGalpones] = await Promise.all([
      getJaulas(),
      getGalpones(),
    ]);
    setJaulas(fetchedJaulas as Jaula[]);
    setGalpones(fetchedGalpones as Galpon[]);
    setIsLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (jaula?: Jaula) => {
    setSelectedJaula(jaula || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJaula(null);
    loadData();
  };

  const handleDelete = async (id: number) => {
    await deleteJaula(id);
    loadData();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Jaulas</h1>
            <p className="mt-1 text-sm text-gray-600">
              Administra las jaulas de cada galpón.
            </p>
          </div>
          <Button
            onClick={() => handleOpenModal()}
            className="w-full bg-teal-800 text-white hover:bg-teal-900 sm:w-auto"
          >
            + Nueva Jaula
          </Button>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-orange-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Número</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Galpón</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Capacidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Acciones</th>
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
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-16" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                      </td>
                    </tr>
                  ))
                : jaulas.map((jaula) => (
                    <tr key={jaula.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{jaula.numero}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{jaula.galpon_nombre}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{jaula.total_aves} / {jaula.capacidad_maxima}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{jaula.estado}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleOpenModal(jaula)}>Editar</Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(jaula.id)}>Eliminar</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </main>

      <JaulaFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        jaula={selectedJaula}
        galpones={galpones}
      />
    </div>
  );
}

export default function JaulasPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Cargando...</div>}>
      <JaulasContent />
    </Suspense>
  );
}
