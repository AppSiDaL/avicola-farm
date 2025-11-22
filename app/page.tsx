import { NavHeader } from "@/components/nav-header";
import { getDashboardStats } from "@/lib/db-actions";
import Link from "next/link";

export default async function HomePage() {
  const stats = await getDashboardStats();
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Bienvenido al sistema de gestión de granja avícola
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Jaulas
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.jaulas.total}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {stats.jaulas.activas} activas,{" "}
                  {Number(stats.jaulas.total) - Number(stats.jaulas.activas)}{" "}
                  en mantenimiento
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
                <svg
                  className="h-6 w-6 text-teal-800"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Aves</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.aves.total}
                </p>
                <p className="mt-1 text-xs text-green-600">
                  {stats.aves.activas} activas, {stats.aves.enfermas} enfermas
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <span className="text-2xl">🐔</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Producción Hoy
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.postura.total_huevos}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Huevos recolectados
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <span className="text-2xl">🥚</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Ventas del Mes
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {formatter.format(Number(stats.ventas.ingresos_totales))}
                </p>
                <p className="mt-1 text-xs text-green-600">
                  {stats.ventas.total_ventas} ventas realizadas
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <svg
                  className="h-6 w-6 text-emerald-800"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Estado de las Jaulas
            </h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium text-gray-900">Sector A</p>
                  <p className="text-sm text-gray-600">Capacidad: aves</p>
                </div>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                  Activa
                </span>
              </div>
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium text-gray-900">Sector B</p>
                  <p className="text-sm text-gray-600">Capacidad: aves</p>
                </div>
                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                  Mantenimiento
                </span>
              </div>
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium text-gray-900">Sector C</p>
                  <p className="text-sm text-gray-600">Capacidad: aves</p>
                </div>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                  Activa
                </span>
              </div>
            </div>
            <Link
              href="/jaulas"
              className="mt-4 block text-center text-sm font-medium text-teal-800 hover:text-teal-900"
            >
              Ver todas las jaulas →
            </Link>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Resumen de Producción
            </h2>
            <div className="mt-4 space-y-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Promedio Diario
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    {Math.round(Number(stats.postura.promedio_diario))} 🥚
                  </span>
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Huevos Rotos
                  </span>
                  <span className="text-2xl font-bold text-red-600">
                    {stats.postura.huevos_rotos}
                  </span>
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Tasa de Roturas
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    {Number(stats.postura.porcentaje_rotos).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            <Link
              href="/postura"
              className="mt-4 block text-center text-sm font-medium text-teal-800 hover:text-teal-900"
            >
              Ver registro completo →
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900">Acceso Rápido</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/jaulas"
              className="group rounded-lg border bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 transition group-hover:bg-teal-200">
                  <svg
                    className="h-5 w-5 text-teal-800"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Jaulas</h3>
                  <p className="text-sm text-gray-600">Administrar</p>
                </div>
              </div>
            </Link>

            <Link
              href="/aves"
              className="group rounded-lg border bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 transition group-hover:bg-green-200">
                  <span className="text-xl">🐔</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Aves</h3>
                  <p className="text-sm text-gray-600">Inventario</p>
                </div>
              </div>
            </Link>

            <Link
              href="/postura"
              className="group rounded-lg border bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 transition group-hover:bg-amber-200">
                  <span className="text-xl">🥚</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Postura</h3>
                  <p className="text-sm text-gray-600">Producción</p>
                </div>
              </div>
            </Link>

            <Link
              href="/ventas"
              className="group rounded-lg border bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 transition group-hover:bg-emerald-200">
                  <svg
                    className="h-5 w-5 text-emerald-800"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Ventas</h3>
                  <p className="text-sm text-gray-600">Seguimiento</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
