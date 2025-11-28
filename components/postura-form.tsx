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
  jaula_id?: number | null;
  galpon_id?: number | null;
  fecha: string;
  huevos_recolectados: number;
  huevos_rotos: number;
  notas?: string | null;
};

type Galpon = {
  id: number;
  nombre: string;
};

type Jaula = {
  id: number;
  numero: string;
  galpon_nombre: string;
};

export function PosturaFormModal({
  isOpen,
  onClose,
  registro,
  galpones,
  jaulas,
}: {
  isOpen: boolean;
  onClose: () => void;
  registro?: RegistroPostura | null;
  galpones: Galpon[];
  jaulas: Jaula[];
}) {
  const [registroType, setRegistroType] = useState<'jaula' | 'galpon'>('galpon');
  const [formData, setFormData] = useState<RegistroPostura>({
    fecha: new Date().toISOString().split("T")[0],
    huevos_recolectados: 0,
    huevos_rotos: 0,
    notas: "",
  });

  useEffect(() => {
    if (isOpen) {
      if (registro) {
        setFormData({
          ...registro,
          fecha: new Date(registro.fecha).toISOString().split("T")[0],
        });
        setRegistroType(registro.jaula_id ? 'jaula' : 'galpon');
      } else {
        setFormData({
          fecha: new Date().toISOString().split("T")[0],
          huevos_recolectados: 0,
          huevos_rotos: 0,
          notas: "",
          [registroType === 'jaula' ? 'jaula_id' : 'galpon_id']: 0,
        });
      }
    }
  }, [registro, isOpen, registroType, galpones, jaulas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      huevos_recolectados: Number(formData.huevos_recolectados),
      huevos_rotos: Number(formData.huevos_rotos),
      notas: formData.notas || undefined,
      jaula_id: registroType === 'jaula' ? (Number(formData.jaula_id) || undefined) : undefined,
      galpon_id: registroType === 'galpon' ? (Number(formData.galpon_id) || undefined) : undefined,
    };

    if (!dataToSubmit.jaula_id && !dataToSubmit.galpon_id) {
      // Basic validation to prevent submission without a target
      alert(`Por favor, seleccione una ${registroType}.`);
      return;
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
    const id = Number(value);
    if (registroType === 'jaula') {
      setFormData((prev) => ({ ...prev, jaula_id: id, galpon_id: undefined }));
    } else {
      setFormData((prev) => ({ ...prev, galpon_id: id, jaula_id: undefined }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {registro ? "Editar Registro" : "Nuevo Registro de Postura"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Tipo de Registro</Label>
              <Select value={registroType} onValueChange={(v) => setRegistroType(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="galpon">Por Galpón</SelectItem>
                  <SelectItem value="jaula">Por Jaula</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="id">{registroType === 'jaula' ? 'Jaula' : 'Galpón'} *</Label>
              <Select
                name={registroType === 'jaula' ? 'jaula_id' : 'galpon_id'}
                value={String(registroType === 'jaula' ? formData.jaula_id : formData.galpon_id)}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Seleccionar ${registroType}`} />
                </SelectTrigger>
                <SelectContent>
                  {registroType === 'jaula'
                    ? jaulas.map((j) => (
                        <SelectItem key={j.id} value={String(j.id)}>
                          {j.galpon_nombre} - {j.numero}
                        </SelectItem>
                      ))
                    : galpones.map((g) => (
                        <SelectItem key={g.id} value={String(g.id)}>
                          {g.nombre}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="fecha">Fecha *</Label>
              <Input id="fecha" name="fecha" type="date" value={formData.fecha} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="huevos_recolectados">Huevos Recolectados *</Label>
              <Input id="huevos_recolectados" name="huevos_recolectados" type="number" value={formData.huevos_recolectados} onChange={handleChange} required />
            </div>
          </div>
          <div>
            <Label htmlFor="huevos_rotos">Huevos Rotos</Label>
            <Input id="huevos_rotos" name="huevos_rotos" type="number" value={formData.huevos_rotos} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="notas">Notas</Label>
            <Textarea id="notas" name="notas" value={formData.notas || ""} onChange={handleChange} />
          </div>
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {registro ? "Guardar Cambios" : "Crear Registro"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
