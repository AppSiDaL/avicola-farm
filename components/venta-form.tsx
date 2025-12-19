"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createVenta, updateVenta, getClientes } from "@/lib/db-actions";
import { getLocalDateString, formatDateForInput } from "@/lib/date-utils";
import { useEffect, useState } from "react";

type Venta = {
  id?: string;
  fecha?: string;
  cliente_nombre: string;
  cantidad_kg: number;
  total: number;
  estado?: string;
};

export function VentaFormModal({
  isOpen,
  onClose,
  venta,
}: {
  isOpen: boolean;
  onClose: () => void;
  venta?: Venta | null;
}) {
  const [formData, setFormData] = useState<{
    fecha: string;
    cliente_nombre: string;
    cantidad_kg: number | string;
    estado: string;
  }>({
    fecha: getLocalDateString(),
    cliente_nombre: "",
    cantidad_kg: 0,
    estado: "Pagado",
  });
  const [clientes, setClientes] = useState<{ label: string; value: string }[]>(
    []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchClientes() {
      const fetchedClientes = (await getClientes()) as {
        cliente_nombre: string;
      }[];
      setClientes(
        fetchedClientes.map((c) => ({
          label: c.cliente_nombre,
          value: c.cliente_nombre,
        }))
      );
    }

    if (isOpen) {
      fetchClientes();
      setError("");
      if (venta) {
        setFormData({
          fecha: venta.fecha
            ? formatDateForInput(venta.fecha)
            : getLocalDateString(),
          cliente_nombre: venta.cliente_nombre,
          cantidad_kg: venta.cantidad_kg,
          estado: venta.estado || "Pendiente",
        });
      } else {
        setFormData({
          fecha: getLocalDateString(),
          cliente_nombre: "",
          cantidad_kg: 0,
          estado: "Pagado",
        });
      }
    }
  }, [venta, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const cantidadKg =
        typeof formData.cantidad_kg === "string"
          ? parseFloat(formData.cantidad_kg)
          : formData.cantidad_kg;

      if (!formData.cliente_nombre.trim()) {
        setError("El nombre del cliente es requerido");
        setIsSubmitting(false);
        return;
      }

      if (isNaN(cantidadKg) || cantidadKg <= 0) {
        setError("La cantidad debe ser un número positivo");
        setIsSubmitting(false);
        return;
      }

      const total = cantidadKg * 50;
      const dataToSubmit = {
        fecha: formData.fecha,
        cliente_nombre: formData.cliente_nombre.trim(),
        cantidad_kg: cantidadKg,
        total,
        estado: formData.estado,
      };

      if (venta?.id) {
        await updateVenta(venta.id, dataToSubmit);
      } else {
        await createVenta(dataToSubmit);
      }
      onClose();
    } catch (err) {
      setError("Error al guardar la venta. Por favor intenta de nuevo.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const total =
    (typeof formData.cantidad_kg === "string"
      ? parseFloat(formData.cantidad_kg) || 0
      : formData.cantidad_kg) * 50;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {venta ? "Editar Venta" : "Nueva Venta"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <Label htmlFor="fecha">Fecha *</Label>
              <Input
                id="fecha"
                name="fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) =>
                  setFormData({ ...formData, fecha: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label className="mb-2" htmlFor="cliente_nombre">
                Nombre del Cliente *
              </Label>
              <Combobox
                options={clientes}
                value={formData.cliente_nombre}
                onChange={(value) =>
                  setFormData({ ...formData, cliente_nombre: value })
                }
                placeholder="Seleccione o escriba un cliente"
                emptyMessage="No se encontraron clientes."
              />
              <Input
                id="cliente_nombre"
                value={formData.cliente_nombre}
                onChange={(e) =>
                  setFormData({ ...formData, cliente_nombre: e.target.value })
                }
                required
                className="mt-2"
                placeholder="O escriba un nuevo nombre de cliente"
              />
            </div>
            <div>
              <Label className="mb-2" htmlFor="cantidad_kg">
                Cantidad (kg) *
              </Label>
              <Input
                id="cantidad_kg"
                type="text"
                inputMode="decimal"
                value={formData.cantidad_kg}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
                    setFormData({ ...formData, cantidad_kg: value as any });
                  }
                }}
                onBlur={(e) => {
                  const value = parseFloat(e.target.value);
                  setFormData({
                    ...formData,
                    cantidad_kg: isNaN(value) ? 0 : value,
                  });
                }}
                required
              />
            </div>
            <div>
              <Label className="mb-2" htmlFor="estado">
                Estado de la Venta *
              </Label>
              <Select
                value={formData.estado || "Pendiente"}
                onValueChange={(value) =>
                  setFormData({ ...formData, estado: value })
                }
              >
                <SelectTrigger id="estado">
                  <SelectValue placeholder="Seleccione un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Pagado">Pagado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-gray-50 p-4 text-center sm:text-right">
            <p className="text-sm text-gray-600">Total de la venta</p>
            <p className="text-3xl font-bold text-gray-900">
              ${total.toFixed(2)}
            </p>
          </div>

          <div className="flex flex-col-reverse gap-4 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-teal-800 text-white hover:bg-teal-900"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Guardando..."
                : venta
                ? "Guardar Cambios"
                : "Registrar Venta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
