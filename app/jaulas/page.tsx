"use client";

import { DeleteButton } from "@/components/delete-button";
import { JaulaFormModal } from "@/components/jaula-form";
import { NavHeader } from "@/components/nav-header";
import { Button } from "@/components/ui/button";
import { getJaulas } from "@/lib/db-actions";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Jaula = {
  id: number;
  numero: string;
  ubicacion: string;
  capacidad_maxima: number;
  estado: string;
  fecha_instalacion: string;
  notas?: string | null;
  total_aves: number;
};

export default function JaulasPage() {
  const [jaulas, setJaulas] = useState<Jaula[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJaula, setSelectedJaula] = useState<Jaula | null>(null);
  const searchParams = useSearchParams();
  const filtro = searchParams.get("estado") || "Todas";

  useEffect(() => {
    async function loadJaulas() {
      const fetchedJaulas = (await getJaulas()) as Jaula[];
      setJaulas(fetchedJaulas);
    }
    loadJaulas();
  }, []);

  const handleOpenModal = (jaula?: Jaula) => {
    setSelectedJaula(jaula || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJaula(null);
    async function loadJaulas() {
      const fetchedJaulas = (await getJaulas()) as Jaula[];
      setJaulas(fetchedJaulas);
    }
    loadJaulas();
  };

  const filteredJaulas =
    filtro === "Todas"
      ? jaulas
      : jaulas.filter((j: any) => j.estado === filtro);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Jaulas
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Administra las jaulas de tu granja avícola
            </p>
          </div>
          <Button
            onClick={() => handleOpenModal()}
            className="bg-teal-800 text-white hover:bg-teal-900"
          >
            + Nueva Jaula
          </Button>
        </div>

        <div className="mt-8 rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              Filtrar por estado:
            </span>
            <div className="flex gap-2">
              {["Todas", "Activa", "Mantenimiento", "Inactiva"].map(
                (estado) => (
                  <Button
                    key={estado}
                    asChild
                    variant={filtro === estado ? "default" : "secondary"}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                      filtro === estado
                        ? "bg-teal-800 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Link href={`/jaulas?estado=${estado}`}>{estado}</Link>
                  </Button>
                )
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredJaulas.map((jaula: any) => (
            <div
              key={jaula.id}
              className="rounded-lg border bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {jaula.numero}
                </h3>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    jaula.estado === "Activa"
                      ? "bg-green-100 text-green-800"
                      : jaula.estado === "Mantenimiento"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {jaula.estado}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Capacidad:{" "}
                  <span className="font-medium text-gray-900">
                    {jaula.total_aves} / {jaula.capacidad_maxima} aves
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Ubicación:{" "}
                  <span className="font-medium text-gray-900">
                    {jaula.ubicacion}
                  </span>
                </p>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-teal-800 text-teal-800 hover:bg-teal-50"
                >
                  Ver Detalles
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleOpenModal(jaula)}
                  className="border-orange-600 text-orange-600 hover:bg-orange-50"
                >
                  Editar
                </Button>
                <DeleteButton id={jaula.id} />
              </div>
            </div>
          ))}
        </div>
      </main>
      <JaulaFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        jaula={selectedJaula}
      />
    </div>
  );
}
