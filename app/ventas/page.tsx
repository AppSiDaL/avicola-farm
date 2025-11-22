"use client";

import { VentaFormModal } from "@/components/venta-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getVentas, getVentasStats, deleteVenta } from "@/lib/db-actions";
import { useEffect, useState } from "react";
import { NavHeader } from "@/components/nav-header";
import { useSearchParams, useRouter } from "next/navigation";

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

export default function VentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  const fecha = searchParams.get("fecha") || "";
  const cliente = searchParams.get("cliente") || "";

  async function loadData() {
    const [fetchedVentas, fetchedStats] = await Promise.all([
      getVentas(fecha, cliente),
      getVentasStats(),
    ]);
    setVentas(fetchedVentas as Venta[]);
    setStats(fetchedStats as Stats);
  }

  useEffect(() => {
    loadData();
  }, [fecha, cliente]);

  const handleOpenModal = (venta?: Venta) => {
    setSelectedVenta(venta || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVenta(null);
    loadData();
  };

  const handleDelete = async (id: number) => {
    await deleteVenta(id);
    loadData();
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Ventas</h1>
            <p className="mt-1 text-sm text-gray-600">Control y seguimiento de ventas de huevos</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="bg-teal-800 text-white hover:bg-teal-900">
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
          <div className="flex gap-4">
            <div>
              <Label>Filtros:</Label>
              <Input
                type="date"
                className="mt-1"
                value={fecha}
                onChange={e => handleFilterChange("fecha", e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label>&nbsp;</Label>
              <Input
                type="text"
                className="mt-1"
                placeholder="Buscar cliente..."
                value={cliente}
                onChange={e => handleFilterChange("cliente", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border bg-white shadow-sm">
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
              {ventas.map((venta) => (
                <tr key={venta.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {new Date(venta.fecha).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="font-medium text-gray-900">{venta.cliente_nombre}</div>
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
      </main>

      <VentaFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        venta={selectedVenta}
      />
    </div>
  );
}
