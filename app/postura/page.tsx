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
  getPosturaStats,
  deleteRegistroPostura,
  getJaulas,
} from "@/lib/db-actions";
import { useEffect, useState } from "react";
import { NavHeader } from "@/components/nav-header";
import { useSearchParams, useRouter } from "next/navigation";

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

export default function PosturaPage() {
  const [registros, setRegistros] = useState<RegistroPostura[]>([]);
  const [jaulas, setJaulas] = useState<Jaula[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRegistro, setSelectedRegistro] =
    useState<RegistroPostura | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  const jaulaId = searchParams.get("jaulaId") || "todas";
  const fechaInicio = searchParams.get("fechaInicio") || "";
  const fechaFin = searchParams.get("fechaFin") || "";

  async function loadData() {
    const [fetchedRegistros, fetchedStats, fetchedJaulas] = await Promise.all([
      getRegistrosPostura(jaulaId, fechaInicio, fechaFin),
      getPosturaStats(fechaInicio, fechaFin),
      getJaulas(),
    ]);
    setRegistros(fetchedRegistros as RegistroPostura[]);
    setStats(fetchedStats as Stats);
    setJaulas(fetchedJaulas as Jaula[]);
  }

  useEffect(() => {
    loadData();
  }, [jaulaId, fechaInicio, fechaFin]);

  const handleOpenModal = (registro?: RegistroPostura) => {
    setSelectedRegistro(registro || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRegistro(null);
    loadData();
  };

  const handleDelete = async (id: number) => {
    await deleteRegistroPostura(id);
    loadData();
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
        <div className="flex items-center justify-between">
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
            className="bg-teal-800 text-white hover:bg-teal-900"
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
          <div className="grid gap-4 sm:grid-cols-3">
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

        {registros.length > 0 ? (
          <div className="mt-6 overflow-hidden rounded-lg border bg-white shadow-sm">
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
                {registros.map((registro) => (
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
        ) : (
          <div className="mt-6 rounded-lg border bg-gray-50 p-12 text-center shadow-sm">
            <div className="mx-auto max-w-md">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
                <span className="text-3xl">🥚</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                No hay registros
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                No hay registros de postura que coincidan con los filtros
                seleccionados.
              </p>
              <Button
                onClick={() => handleOpenModal()}
                className="mt-4 bg-teal-800 text-white hover:bg-teal-900"
              >
                Crear Primer Registro
              </Button>
            </div>
          </div>
        )}
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
