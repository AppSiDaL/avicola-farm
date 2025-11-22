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
import { createAve, updateAve } from "@/lib/db-actions";
import { useEffect, useState } from "react";

type Ave = {
  id?: number;
  fecha_ingreso: string;
  raza: string;
  jaula_id: number | null;
  estado: string;
  peso?: number | null;
  edad?: number | null;
};

type Jaula = {
  id: number;
  numero: string;
};

export function AveFormModal({
  isOpen,
  onClose,
  ave,
  jaulas,
}: {
  isOpen: boolean;
  onClose: () => void;
  ave?: Ave | null;
  jaulas: Jaula[];
}) {
  const [formData, setFormData] = useState<Ave>(
    ave || {
      fecha_ingreso: new Date().toISOString().split("T")[0],
      raza: "Rhode Island Red",
      jaula_id: null,
      estado: "Activa",
      peso: undefined,
      edad: undefined,
    }
  );

  useEffect(() => {
    if (ave) {
      setFormData({
        ...ave,
        fecha_ingreso: new Date(ave.fecha_ingreso).toISOString().split("T")[0],
      });
    } else {
      setFormData({
        fecha_ingreso: new Date().toISOString().split("T")[0],
        raza: "Rhode Island Red",
        jaula_id: null,
        estado: "Activa",
        peso: undefined,
        edad: undefined,
      });
    }
  }, [ave]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      peso: formData.peso || undefined,
      edad: formData.edad || undefined,
      jaula_id: formData.jaula_id ? Number(formData.jaula_id) : null,
    };
    if (ave?.id) {
      await updateAve(ave.id, dataToSubmit);
    } else {
      await createAve(dataToSubmit);
    }
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {ave ? "Editar Ave" : "Nueva Ave"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fecha_ingreso">Fecha de Ingreso *</Label>
            <Input
              id="fecha_ingreso"
              name="fecha_ingreso"
              type="date"
              value={formData.fecha_ingreso}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="raza">Raza *</Label>
            <Select
              name="raza"
              value={formData.raza}
              onValueChange={(value) => handleSelectChange("raza", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar raza" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Rhode Island Red">Rhode Island Red</SelectItem>
                <SelectItem value="Leghorn Blanca">Leghorn Blanca</SelectItem>
                <SelectItem value="Plymouth Rock">Plymouth Rock</SelectItem>
                <SelectItem value="Sussex">Sussex</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="jaula_id">Jaula</Label>
            <Select
              name="jaula_id"
              value={String(formData.jaula_id)}
              onValueChange={(value) => handleSelectChange("jaula_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar jaula" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">Sin asignar</SelectItem>
                {jaulas.map((jaula) => (
                  <SelectItem key={jaula.id} value={String(jaula.id)}>
                    {jaula.numero}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="estado">Estado</Label>
            <Select
              name="estado"
              value={formData.estado}
              onValueChange={(value) => handleSelectChange("estado", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Activa">Activa</SelectItem>
                <SelectItem value="Enferma">Enferma</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="peso">Peso (kg)</Label>
              <Input
                id="peso"
                name="peso"
                type="number"
                step="0.1"
                placeholder="2.5"
                value={formData.peso || ""}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="edad">Edad (semanas)</Label>
              <Input
                id="edad"
                name="edad"
                type="number"
                placeholder="12"
                value={formData.edad || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-teal-800 text-white hover:bg-teal-900"
            >
              {ave ? "Guardar Cambios" : "Crear Ave"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
