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
import { createVenta, updateVenta, getClientes } from "@/lib/db-actions";
import { useEffect, useState } from "react";

type Venta = {
  id?: number;
  cliente_nombre: string;
  cantidad_kg: number;
  total: number;
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
  const [formData, setFormData] = useState<Omit<Venta, "id" | "total">>(
    venta || {
      cliente_nombre: "",
      cantidad_kg: 0,
    }
  );
  const [clientes, setClientes] = useState<{ label: string; value: string }[]>(
    []
  );

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
      if (venta) {
        setFormData({
          cliente_nombre: venta.cliente_nombre,
          cantidad_kg: venta.cantidad_kg,
        });
      } else {
        setFormData({
          cliente_nombre: "",
          cantidad_kg: 0,
        });
      }
    }
  }, [venta, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = formData.cantidad_kg * 50;
    const dataToSubmit = {
      ...formData,
      total,
    };
    if (venta?.id) {
      await updateVenta(venta.id, dataToSubmit);
    } else {
      await createVenta(dataToSubmit);
    }
    onClose();
  };

  const total = formData.cantidad_kg * 50;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {venta ? "Editar Venta" : "Nueva Venta"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
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
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-teal-800 text-white hover:bg-teal-900"
            >
              {venta ? "Guardar Cambios" : "Registrar Venta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
