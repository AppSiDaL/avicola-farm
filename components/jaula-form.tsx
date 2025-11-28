"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createJaula, updateJaula } from "@/lib/db-actions";
import { useEffect, useState } from "react";

type Jaula = {
  id?: number;
  numero: string;
  galpon_id: number;
  capacidad_maxima: number;
  estado: string;
  fecha_instalacion: string;
  notas?: string | null;
};

type Galpon = {
  id: number;
  nombre: string;
};

export function JaulaFormModal({
  isOpen,
  onClose,
  jaula,
  galpones,
}: {
  isOpen: boolean;
  onClose: () => void;
  jaula?: Jaula | null;
  galpones: Galpon[];
}) {
  const [formData, setFormData] = useState<Jaula>({
    numero: "",
    galpon_id: 0,
    capacidad_maxima: 0,
    estado: "Activa",
    fecha_instalacion: new Date().toISOString().split("T")[0],
    notas: "",
  });

  useEffect(() => {
    if (isOpen) {
      if (jaula) {
        setFormData({
          ...jaula,
          fecha_instalacion: new Date(jaula.fecha_instalacion).toISOString().split("T")[0],
        });
      } else {
        setFormData({
          numero: "",
          galpon_id: galpones.length > 0 ? galpones[0].id : 0,
          capacidad_maxima: 0,
          estado: "Activa",
          fecha_instalacion: new Date().toISOString().split("T")[0],
          notas: "",
        });
      }
    }
  }, [jaula, galpones, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      galpon_id: Number(formData.galpon_id),
      capacidad_maxima: Number(formData.capacidad_maxima),
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
            {jaula ? "Editar Jaula" : "Nueva Jaula"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="numero">Número de Jaula *</Label>
              <Input id="numero" name="numero" value={formData.numero} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="galpon_id">Galpón *</Label>
              <Select name="galpon_id" value={String(formData.galpon_id)} onValueChange={(v) => handleSelectChange("galpon_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar galpón" />
                </SelectTrigger>
                <SelectContent>
                  {galpones.map((galpon) => (
                    <SelectItem key={galpon.id} value={String(galpon.id)}>
                      {galpon.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="capacidad_maxima">Capacidad Máxima *</Label>
              <Input id="capacidad_maxima" name="capacidad_maxima" type="number" value={formData.capacidad_maxima} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="estado">Estado *</Label>
              <Select name="estado" value={formData.estado} onValueChange={(v) => handleSelectChange("estado", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Activa">Activa</SelectItem>
                  <SelectItem value="Inactiva">Inactiva</SelectItem>
                  <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="fecha_instalacion">Fecha de Instalación *</Label>
            <Input id="fecha_instalacion" name="fecha_instalacion" type="date" value={formData.fecha_instalacion} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="notas">Notas</Label>
            <Textarea id="notas" name="notas" value={formData.notas || ""} onChange={handleChange} />
          </div>
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">{jaula ? "Guardar Cambios" : "Crear Jaula"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
