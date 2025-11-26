"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createGasto, updateGasto } from "@/lib/db-actions";

type Gasto = {
  id: number;
  fecha: string;
  categoria: "Alimento" | "Medicinas" | "Servicios" | "Equipos" | "Otros";
  descripcion: string;
  cantidad: number;
  monto: number;
  notas?: string | null;
};

interface GastoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  gasto?: Gasto | null;
}

const initialFormData = {
  fecha: new Date().toISOString().split("T")[0],
  categoria: "Alimento",
  descripcion: "",
  cantidad: "1",
  monto: "",
  notas: "",
};

export function GastoFormModal({
  isOpen,
  onClose,
  gasto,
}: GastoFormModalProps) {
  const [formData, setFormData] = useState(initialFormData);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (gasto) {
        setFormData({
          fecha: gasto.fecha,
          categoria: gasto.categoria,
          descripcion: gasto.descripcion,
          cantidad: String(gasto.cantidad),
          monto: String(gasto.monto),
          notas: gasto.notas || "",
        });
      } else {
        setFormData(initialFormData);
      }
      setError("");
    }
  }, [isOpen, gasto]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const cantidad = parseFloat(formData.cantidad);
      const monto = parseFloat(formData.monto);
      
      if (!formData.descripcion.trim()) {
        setError("La descripción es requerida");
        setIsSubmitting(false);
        return;
      }
      
      if (isNaN(cantidad) || cantidad <= 0) {
        setError("La cantidad debe ser un número positivo");
        setIsSubmitting(false);
        return;
      }
      
      if (isNaN(monto) || monto <= 0) {
        setError("El monto debe ser un número positivo");
        setIsSubmitting(false);
        return;
      }

      const data = {
        fecha: formData.fecha,
        categoria: formData.categoria as "Alimento" | "Medicinas" | "Servicios" | "Equipos" | "Otros",
        descripcion: formData.descripcion.trim(),
        cantidad: cantidad,
        monto: monto,
        notas: formData.notas.trim() || undefined,
      };

      if (gasto) {
        await updateGasto(gasto.id, data);
      } else {
        await createGasto(data);
      }

      onClose();
    } catch (err) {
      setError("Error al guardar el gasto. Por favor intenta de nuevo.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {gasto ? "Editar Gasto" : "Nuevo Gasto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="fecha">Fecha</Label>
            <Input
              id="fecha"
              name="fecha"
              type="date"
              value={formData.fecha}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="categoria">Categoría</Label>
            <Select
              value={formData.categoria}
              onValueChange={(value) => handleSelectChange("categoria", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Alimento">Alimento</SelectItem>
                <SelectItem value="Medicinas">Medicinas</SelectItem>
                <SelectItem value="Servicios">Servicios</SelectItem>
                <SelectItem value="Equipos">Equipos</SelectItem>
                <SelectItem value="Otros">Otros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="descripcion">Descripción</Label>
            <Input
              id="descripcion"
              name="descripcion"
              type="text"
              placeholder="Ej: Compra de alimento para aves"
              value={formData.descripcion}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="cantidad">Cantidad</Label>
            <Input
              id="cantidad"
              name="cantidad"
              type="number"
              placeholder="1"
              value={formData.cantidad}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="monto">Monto ($)</Label>
            <Input
              id="monto"
              name="monto"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.monto}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="notas">Notas (opcional)</Label>
            <Textarea
              id="notas"
              name="notas"
              placeholder="Agregar notas adicionales..."
              value={formData.notas}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-teal-800 text-white hover:bg-teal-900"
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
