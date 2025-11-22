"use client";

import { Button } from "@/components/ui/button";
import { deleteJaula } from "@/lib/db-actions";

export function DeleteButton({ id }: { id: number }) {
  return (
    <form action={() => deleteJaula(id)}>
      <Button
        type="submit"
        variant="outline"
        className="border-red-600 text-red-600 hover:bg-red-50"
      >
        Eliminar
      </Button>
    </form>
  );
}
