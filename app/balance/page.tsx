"use client";

import { NavHeader } from "@/components/nav-header";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getBalanceGeneral,
  getBalancePorMes,
  getGastosPorCategoria,
  getVentasPorCliente,
} from "@/lib/db-actions";
import { Suspense, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";

type BalanceGeneral = {
  ventas: number;
  gastos: number;
  balance: number;
  num_ventas: number;
  num_gastos: number;
};

type BalanceMes = {
  mes: string;
  mes_label: string;
  ventas: number;
  gastos: number;
  balance: number;
  num_ventas: number;
  num_gastos: number;
};

type GastoCategoria = {
  categoria: string;
  total: number;
  cantidad: number;
};

type VentaCliente = {
  cliente_nombre: string;
  total: number;
  cantidad_kg: number;
  cantidad: number;
};

const categoriaColors: Record<string, string> = {
  Alimento: "bg-amber-500",
  Medicinas: "bg-red-500",
  Servicios: "bg-blue-500",
  Equipos: "bg-purple-500",
  Otros: "bg-gray-500",
};

function BalanceContent() {
  const [balanceGeneral, setBalanceGeneral] = useState<BalanceGeneral | null>(
    null
  );
  const [balancePorMes, setBalancePorMes] = useState<BalanceMes[]>([]);
  const [gastosPorCategoria, setGastosPorCategoria] = useState<
    GastoCategoria[]
  >([]);
  const [ventasPorCliente, setVentasPorCliente] = useState<VentaCliente[]>([]);
  const [mesSeleccionado, setMesSeleccionado] = useState<string>("todos");
  const [isLoading, setIsLoading] = useState(true);

  async function loadData() {
    setIsLoading(true);
    try {
      const [general, porMes] = await Promise.all([
        getBalanceGeneral(),
        getBalancePorMes(),
      ]);

      setBalanceGeneral(general);
      setBalancePorMes(porMes);

      // Cargar datos de categorías y clientes según el mes seleccionado
      const mesParam =
        mesSeleccionado === "todos" ? undefined : mesSeleccionado;
      const [categorias, clientes] = await Promise.all([
        getGastosPorCategoria(mesParam),
        getVentasPorCliente(mesParam),
      ]);

      setGastosPorCategoria(categorias as GastoCategoria[]);
      setVentasPorCliente(clientes as VentaCliente[]);
    } catch (error) {
      console.error("Error loading balance data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [mesSeleccionado]);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  // Calcular datos para la vista del mes seleccionado
  const datosMesSeleccionado =
    mesSeleccionado === "todos"
      ? balanceGeneral
      : balancePorMes.find((b) => b.mes === mesSeleccionado) || null;

  const totalGastosCategorias = gastosPorCategoria.reduce(
    (acc, g) => acc + Number(g.total),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Balance Financiero
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Análisis de ingresos vs gastos de tu granja
            </p>
          </div>
          <div className="w-full sm:w-64">
            <Select value={mesSeleccionado} onValueChange={setMesSeleccionado}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tiempos</SelectItem>
                {balancePorMes.map((m) => (
                  <SelectItem key={m.mes} value={m.mes}>
                    {m.mes_label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tarjetas de resumen */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Ingresos */}
          <div className="rounded-xl border bg-gradient-to-br from-green-50 to-emerald-100 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">
                  Total Ingresos
                </p>
                {isLoading ? (
                  <Skeleton className="mt-2 h-8 w-32" />
                ) : (
                  <p className="mt-2 text-3xl font-bold text-green-800">
                    {formatMoney(datosMesSeleccionado?.ventas ?? 0)}
                  </p>
                )}
              </div>
              <div className="rounded-full bg-green-200 p-3">
                <ArrowUpCircle className="h-8 w-8 text-green-700" />
              </div>
            </div>
            <p className="mt-2 text-sm text-green-600">
              {datosMesSeleccionado?.num_ventas ?? 0} ventas realizadas
            </p>
          </div>

          {/* Gastos */}
          <div className="rounded-xl border bg-gradient-to-br from-red-50 to-rose-100 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Total Gastos</p>
                {isLoading ? (
                  <Skeleton className="mt-2 h-8 w-32" />
                ) : (
                  <p className="mt-2 text-3xl font-bold text-red-800">
                    {formatMoney(datosMesSeleccionado?.gastos ?? 0)}
                  </p>
                )}
              </div>
              <div className="rounded-full bg-red-200 p-3">
                <ArrowDownCircle className="h-8 w-8 text-red-700" />
              </div>
            </div>
            <p className="mt-2 text-sm text-red-600">
              {datosMesSeleccionado?.num_gastos ?? 0} gastos registrados
            </p>
          </div>

          {/* Balance */}
          <div
            className={`rounded-xl border p-6 shadow-sm ${
              (datosMesSeleccionado?.balance ?? 0) >= 0
                ? "bg-gradient-to-br from-blue-50 to-indigo-100"
                : "bg-gradient-to-br from-orange-50 to-amber-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${
                    (datosMesSeleccionado?.balance ?? 0) >= 0
                      ? "text-blue-700"
                      : "text-orange-700"
                  }`}
                >
                  Balance Neto
                </p>
                {isLoading ? (
                  <Skeleton className="mt-2 h-8 w-32" />
                ) : (
                  <p
                    className={`mt-2 text-3xl font-bold ${
                      (datosMesSeleccionado?.balance ?? 0) >= 0
                        ? "text-blue-800"
                        : "text-orange-800"
                    }`}
                  >
                    {formatMoney(datosMesSeleccionado?.balance ?? 0)}
                  </p>
                )}
              </div>
              <div
                className={`rounded-full p-3 ${
                  (datosMesSeleccionado?.balance ?? 0) >= 0
                    ? "bg-blue-200"
                    : "bg-orange-200"
                }`}
              >
                {(datosMesSeleccionado?.balance ?? 0) >= 0 ? (
                  <TrendingUp
                    className={`h-8 w-8 ${
                      (datosMesSeleccionado?.balance ?? 0) >= 0
                        ? "text-blue-700"
                        : "text-orange-700"
                    }`}
                  />
                ) : (
                  <TrendingDown className="h-8 w-8 text-orange-700" />
                )}
              </div>
            </div>
            <p
              className={`mt-2 text-sm ${
                (datosMesSeleccionado?.balance ?? 0) >= 0
                  ? "text-blue-600"
                  : "text-orange-600"
              }`}
            >
              {(datosMesSeleccionado?.balance ?? 0) >= 0
                ? "Ganancia"
                : "Pérdida"}
            </p>
          </div>
        </div>

        {/* Historial por mes */}
        {mesSeleccionado === "todos" && balancePorMes.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Historial por Mes
            </h2>
            <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                        Mes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                        Ingresos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                        Gastos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                        Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {balancePorMes.map((mes) => (
                      <tr key={mes.mes} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          {mes.mes_label}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-green-600">
                          {formatMoney(mes.ventas)}
                          <span className="ml-1 text-xs text-gray-500">
                            ({mes.num_ventas})
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-red-600">
                          {formatMoney(mes.gastos)}
                          <span className="ml-1 text-xs text-gray-500">
                            ({mes.num_gastos})
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <span
                            className={`font-semibold ${
                              mes.balance >= 0
                                ? "text-blue-600"
                                : "text-orange-600"
                            }`}
                          >
                            {formatMoney(mes.balance)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setMesSeleccionado(mes.mes)}
                          >
                            Ver detalle
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Desglose detallado */}
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Gastos por categoría */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Gastos por Categoría
            </h2>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : gastosPorCategoria.length > 0 ? (
              <div className="space-y-4">
                {gastosPorCategoria.map((gasto) => {
                  const porcentaje =
                    totalGastosCategorias > 0
                      ? (Number(gasto.total) / totalGastosCategorias) * 100
                      : 0;
                  return (
                    <div key={gasto.categoria}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {gasto.categoria}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatMoney(Number(gasto.total))}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className={`h-full ${
                              categoriaColors[gasto.categoria] || "bg-gray-500"
                            }`}
                            style={{ width: `${porcentaje}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-12 text-right">
                          {porcentaje.toFixed(1)}%
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {gasto.cantidad} registro
                        {Number(gasto.cantidad) !== 1 ? "s" : ""}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No hay gastos registrados
              </p>
            )}
          </div>

          {/* Top clientes */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Top 10 Clientes
            </h2>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : ventasPorCliente.length > 0 ? (
              <div className="space-y-3">
                {ventasPorCliente.map((cliente, index) => (
                  <div
                    key={cliente.cliente_nombre}
                    className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                          index < 3
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {cliente.cliente_nombre}
                        </p>
                        <p className="text-xs text-gray-500">
                          {Number(cliente.cantidad_kg).toFixed(1)} kg en{" "}
                          {cliente.cantidad} compra
                          {Number(cliente.cantidad) !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-green-600">
                      {formatMoney(Number(cliente.total))}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No hay ventas registradas
              </p>
            )}
          </div>
        </div>

        {/* Botón para volver a vista general */}
        {mesSeleccionado !== "todos" && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => setMesSeleccionado("todos")}
            >
              ← Ver todos los meses
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function BalancePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          Cargando...
        </div>
      }
    >
      <BalanceContent />
    </Suspense>
  );
}
