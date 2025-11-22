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

  async function loadData() {
    const [fetchedAves, fetchedStats, fetchedJaulas] = await Promise.all([
      getAves(),
      getAvesStats(),
      getJaulas(),
    ]);
    setAves(fetchedAves as Ave[]);
    setStats(fetchedStats as Stats);
    setJaulas(fetchedJaulas as Jaula[]);
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (ave?: Ave) => {
    setSelectedAve(ave || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAve(null);
    loadData();
  };

  const handleDelete = async (id: number) => {
    await deleteAve(id);
    loadData();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
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
            className="bg-teal-800 text-white hover:bg-teal-900"
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
              {aves.map((ave) => (
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
