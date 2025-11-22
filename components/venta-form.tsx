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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createVenta, updateVenta } from "@/lib/db-actions";
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

  useEffect(() => {
    if (isOpen) {
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
              <Label htmlFor="cliente_nombre">Nombre del Cliente *</Label>
              <Input
                id="cliente_nombre"
                value={formData.cliente_nombre}
                onChange={(e) => setFormData({ ...formData, cliente_nombre: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="cantidad_kg">Cantidad (kg) *</Label>
              <Input
                id="cantidad_kg"
                type="number"
                value={formData.cantidad_kg}
                onChange={(e) => setFormData({ ...formData, cantidad_kg: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <div className="text-right">
              <p className="text-sm text-gray-600">Total de la venta</p>
              <p className="text-3xl font-bold text-gray-900">${total.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-teal-800 text-white hover:bg-teal-900">
              {venta ? "Guardar Cambios" : "Registrar Venta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
