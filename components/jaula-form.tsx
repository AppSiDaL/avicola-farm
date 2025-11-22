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
import { Textarea } from "@/components/ui/textarea";
import { createJaula, updateJaula } from "@/lib/db-actions";
import { useEffect, useState } from "react";

type Jaula = {
  id?: number;
  numero: string;
  ubicacion: string;
  capacidad_maxima: number;
  estado: string;
  fecha_instalacion: string;
  notas?: string | null;
};

export function JaulaFormModal({
  isOpen,
  onClose,
  jaula,
}: {
  isOpen: boolean;
  onClose: () => void;
  jaula?: Jaula | null;
}) {
  const [formData, setFormData] = useState<Jaula>(
    jaula || {
      numero: "",
      ubicacion: "",
      capacidad_maxima: 50,
      estado: "Activa",
      fecha_instalacion: new Date().toISOString().split("T")[0],
      notas: "",
    }
  );

  useEffect(() => {
    if (jaula) {
      setFormData({
        ...jaula,
        fecha_instalacion: new Date(jaula.fecha_instalacion)
          .toISOString()
          .split("T")[0],
      });
    } else {
      setFormData({
        numero: "",
        ubicacion: "",
        capacidad_maxima: 50,
        estado: "Activa",
        fecha_instalacion: new Date().toISOString().split("T")[0],
        notas: "",
      });
    }
  }, [jaula]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSubmit = {
      ...formData,
      notas: formData.notas || undefined,
    };

    if (jaula?.id) {
      await updateJaula(jaula.id, dataToSubmit);
    } else {
      await createJaula(dataToSubmit);
    }
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({...prev, estado: value}));
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {jaula ? "Editar Jaula" : "Nueva Jaula"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="numero">Número de Jaula *</Label>
              <Input
                id="numero"
                name="numero"
                placeholder="Ej: J-001"
                value={formData.numero}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="ubicacion">Ubicación *</Label>
              <Input
                id="ubicacion"
                name="ubicacion"
                placeholder="Ej: Galpón A"
                value={formData.ubicacion}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="capacidad_maxima">Capacidad Máxima *</Label>
              <Input
                id="capacidad_maxima"
                name="capacidad_maxima"
                type="number"
                placeholder="50"
                value={formData.capacidad_maxima}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="estado">Estado</Label>
              <Select
                name="estado"
                value={formData.estado}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Activa">Activa</SelectItem>
                  <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                  <SelectItem value="Inactiva">Inactiva</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="fecha_instalacion">Fecha de Instalación *</Label>
            <Input
              id="fecha_instalacion"
              name="fecha_instalacion"
              type="date"
              value={formData.fecha_instalacion}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              name="notas"
              placeholder="Observaciones adicionales..."
              value={formData.notas || ""}
              onChange={handleChange}
              rows={3}
            />
          </div>
          <div className="flex flex-col-reverse gap-4 pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="w-full bg-teal-800 text-white hover:bg-teal-900 sm:w-auto"
            >
              {jaula ? "Guardar Cambios" : "Crear Jaula"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
