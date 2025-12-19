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
import { getLocalDateString, formatDateForInput } from "@/lib/date-utils";
import { useEffect, useState } from "react";

type Ave = {
  id?: string;
  fecha_ingreso: string;
  raza: string;
  jaula_id: string | null;
  estado: string;
  peso?: number | null;
  edad?: number | null;
};

type Jaula = {
  id: string;
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
      fecha_ingreso: getLocalDateString(),
      raza: "Rhode Island Red",
      jaula_id: null,
      estado: "Activa",
      peso: undefined,
      edad: undefined,
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setError("");
      if (ave) {
        setFormData({
          ...ave,
          fecha_ingreso: formatDateForInput(ave.fecha_ingreso),
        });
      } else {
        setFormData({
          fecha_ingreso: getLocalDateString(),
          raza: "Rhode Island Red",
          jaula_id: null,
          estado: "Activa",
          peso: undefined,
          edad: undefined,
        });
      }
    }
  }, [ave, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const dataToSubmit = {
        ...formData,
        peso: formData.peso || undefined,
        edad: formData.edad || undefined,
        jaula_id:
          formData.jaula_id && formData.jaula_id !== "null"
            ? formData.jaula_id
            : null,
      };
      if (ave?.id) {
        await updateAve(ave.id, dataToSubmit);
      } else {
        await createAve(dataToSubmit);
      }
      onClose();
    } catch (err) {
      setError("Error al guardar el ave. Por favor intenta de nuevo.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  <SelectItem value="Rhode Island Red">
                    Rhode Island Red
                  </SelectItem>
                  <SelectItem value="Leghorn Blanca">Leghorn Blanca</SelectItem>
                  <SelectItem value="Plymouth Rock">Plymouth Rock</SelectItem>
                  <SelectItem value="Sussex">Sussex</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="jaula_id">Jaula</Label>
              <Select
                name="jaula_id"
                value={formData.jaula_id || "null"}
                onValueChange={(value) => handleSelectChange("jaula_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar jaula" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">Sin asignar</SelectItem>
                  {jaulas.map((jaula) => (
                    <SelectItem key={jaula.id} value={jaula.id}>
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
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          <div className="flex flex-col-reverse gap-4 pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="w-full bg-teal-800 text-white hover:bg-teal-900 sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Guardando..."
                : ave
                ? "Guardar Cambios"
                : "Crear Ave"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
