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
import {
  createRegistroPostura,
  updateRegistroPostura,
} from "@/lib/db-actions";
import { useEffect, useState } from "react";

type RegistroPostura = {
  id?: number;
  jaula_id: number;
  fecha: string;
  huevos_recolectados: number;
  huevos_rotos: number;
  notas?: string | null;
};

type Jaula = {
  id: number;
  numero: string;
};

export function PosturaFormModal({
  isOpen,
  onClose,
  registro,
  jaulas,
}: {
  isOpen: boolean;
  onClose: () => void;
  registro?: RegistroPostura | null;
  jaulas: Jaula[];
}) {
  const [formData, setFormData] = useState<RegistroPostura>(
    registro || {
      jaula_id: 0,
      fecha: new Date().toISOString().split("T")[0],
      huevos_recolectados: 0,
      huevos_rotos: 0,
      notas: "",
    }
  );

  useEffect(() => {
    if (isOpen) {
      if (registro) {
        // Editing an existing record
        setFormData({
          ...registro,
          fecha: new Date(registro.fecha).toISOString().split("T")[0],
        });
      } else {
        // Creating a new record, set defaults
        setFormData({
          jaula_id: jaulas.length > 0 ? jaulas[0].id : 0,
          fecha: new Date().toISOString().split("T")[0],
          huevos_recolectados: 0,
          huevos_rotos: 0,
          notas: "",
        });
      }
    }
  }, [registro, jaulas, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSubmit = {
        ...formData,
        jaula_id: Number(formData.jaula_id),
        huevos_recolectados: Number(formData.huevos_recolectados),
        huevos_rotos: Number(formData.huevos_rotos),
        notas: formData.notas || undefined,
    }
    if (registro?.id) {
      await updateRegistroPostura(registro.id, dataToSubmit);
    } else {
      await createRegistroPostura(dataToSubmit);
    }
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, jaula_id: Number(value) }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {registro ? "Editar Registro" : "Nuevo Registro de Postura"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="jaula_id">Jaula *</Label>
            <Select
              name="jaula_id"
              value={String(formData.jaula_id)}
              onValueChange={handleSelectChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar jaula" />
              </SelectTrigger>
              <SelectContent>
                {jaulas.map((jaula) => (
                  <SelectItem key={jaula.id} value={String(jaula.id)}>
                    {jaula.numero}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="fecha">Fecha *</Label>
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
            <Label htmlFor="huevos_recolectados">Huevos Recolectados *</Label>
            <Input
              id="huevos_recolectados"
              name="huevos_recolectados"
              type="number"
              placeholder="120"
              value={formData.huevos_recolectados}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="huevos_rotos">Huevos Rotos</Label>
            <Input
              id="huevos_rotos"
              name="huevos_rotos"
              type="number"
              placeholder="5"
              value={formData.huevos_rotos}
              onChange={handleChange}
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
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-teal-800 text-white hover:bg-teal-900"
            >
              {registro ? "Guardar Cambios" : "Crear Registro"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
