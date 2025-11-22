"use server"

import { sql } from "./db"
import { revalidatePath } from "next/cache"

export async function getJaulas() {
  const jaulas = await sql`
    SELECT j.*, 
           COUNT(a.id) as total_aves
    FROM jaulas j
    LEFT JOIN aves a ON a.jaula_id = j.id AND a.estado = 'Activa'
    GROUP BY j.id
    ORDER BY j.numero
  `
  return jaulas
}

export async function createJaula(data: {
  numero: string
  ubicacion: string
  capacidad_maxima: number
  estado: string
  fecha_instalacion: string
  notas?: string
}) {
  await sql`
    INSERT INTO jaulas (numero, ubicacion, capacidad_maxima, estado, fecha_instalacion, notas)
    VALUES (${data.numero}, ${data.ubicacion}, ${data.capacidad_maxima}, ${data.estado}, ${data.fecha_instalacion}, ${data.notas || null})
  `
  revalidatePath("/jaulas")
}

export async function getJaulaById(id: number) {
  const jaula = await sql`
    SELECT * FROM jaulas WHERE id = ${id}
  `
  return jaula[0]
}

export async function updateJaula(
  id: number,
  data: {
    numero: string
    ubicacion: string
    capacidad_maxima: number
    estado: string
    fecha_instalacion: string
    notas?: string
  }
) {
  await sql`
    UPDATE jaulas
    SET numero = ${data.numero},
        ubicacion = ${data.ubicacion},
        capacidad_maxima = ${data.capacidad_maxima},
        estado = ${data.estado},
        fecha_instalacion = ${data.fecha_instalacion},
        notas = ${data.notas || null}
    WHERE id = ${id}
  `
  revalidatePath("/jaulas")
  revalidatePath(`/jaulas/${id}/editar`)
}

export async function deleteJaula(id: number) {
  await sql`DELETE FROM jaulas WHERE id = ${id}`
  revalidatePath("/jaulas")
}

// Aves
export async function getAves() {
  const aves = await sql`
    SELECT a.*, j.numero as jaula_numero
    FROM aves a
    LEFT JOIN jaulas j ON a.jaula_id = j.id
    ORDER BY a.fecha_ingreso DESC
  `
  return aves
}

export async function createAve(data: {
  fecha_ingreso: string
  raza: string
  jaula_id: number | null
  estado: string
  peso?: number
  edad?: number
}) {
  await sql`
    INSERT INTO aves (fecha_ingreso, raza, jaula_id, estado, peso, edad)
    VALUES (${data.fecha_ingreso}, ${data.raza}, ${data.jaula_id}, ${data.estado}, ${data.peso || null}, ${data.edad || null})
  `
  revalidatePath("/aves")
}

export async function updateAve(
  id: number,
  data: {
    fecha_ingreso: string
    raza: string
    jaula_id: number | null
    estado: string
    peso?: number
    edad?: number
  }
) {
  await sql`
    UPDATE aves
    SET fecha_ingreso = ${data.fecha_ingreso},
        raza = ${data.raza},
        jaula_id = ${data.jaula_id},
        estado = ${data.estado},
        peso = ${data.peso || null},
        edad = ${data.edad || null}
    WHERE id = ${id}
  `
  revalidatePath("/aves")
}

export async function deleteAve(id: number) {
  await sql`DELETE FROM aves WHERE id = ${id}`
  revalidatePath("/aves")
}

export async function getAvesStats() {
  const stats = await sql`
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN estado = 'Activa' THEN 1 END) as activas,
      COUNT(CASE WHEN estado = 'Enferma' THEN 1 END) as enfermas,
      COUNT(DISTINCT raza) as razas
    FROM aves
  `
  return stats[0]
}

// Postura
export async function getRegistrosPostura(jaulaId?: string, fechaInicio?: string, fechaFin?: string) {
  let query = sql`
    SELECT rp.*, j.numero as jaula_numero
    FROM registros_postura rp
    JOIN jaulas j ON rp.jaula_id = j.id
    WHERE 1=1
  `

  if (jaulaId && jaulaId !== "todas") {
    query = sql`${query} AND rp.jaula_id = ${Number.parseInt(jaulaId)}`
  }

  if (fechaInicio) {
    query = sql`${query} AND rp.fecha >= ${fechaInicio}`
  }

  if (fechaFin) {
    query = sql`${query} AND rp.fecha <= ${fechaFin}`
  }

  query = sql`${query} ORDER BY rp.fecha DESC, j.numero`

  return await query
}

export async function createRegistroPostura(data: {
  jaula_id: number
  fecha: string
  huevos_recolectados: number
  huevos_rotos: number
  notas?: string
}) {
  await sql`
    INSERT INTO registros_postura (jaula_id, fecha, huevos_recolectados, huevos_rotos, notas)
    VALUES (${data.jaula_id}, ${data.fecha}, ${data.huevos_recolectados}, ${data.huevos_rotos}, ${data.notas || null})
    ON CONFLICT (jaula_id, fecha) 
    DO UPDATE SET 
      huevos_recolectados = ${data.huevos_recolectados},
      huevos_rotos = ${data.huevos_rotos},
      notas = ${data.notas || null}
  `
  revalidatePath("/postura")
}

export async function updateRegistroPostura(
  id: number,
  data: {
    jaula_id: number
    fecha: string
    huevos_recolectados: number
    huevos_rotos: number
    notas?: string
  }
) {
  await sql`
    UPDATE registros_postura
    SET jaula_id = ${data.jaula_id},
        fecha = ${data.fecha},
        huevos_recolectados = ${data.huevos_recolectados},
        huevos_rotos = ${data.huevos_rotos},
        notas = ${data.notas || null}
    WHERE id = ${id}
  `
  revalidatePath("/postura")
}

export async function deleteRegistroPostura(id: number) {
  await sql`DELETE FROM registros_postura WHERE id = ${id}`
  revalidatePath("/postura")
}

export async function getPosturaStats(fechaInicio?: string, fechaFin?: string) {
  let query = sql`
    SELECT 
      COALESCE(SUM(huevos_recolectados), 0) as total_huevos,
      COALESCE(AVG(huevos_recolectados), 0) as promedio_diario,
      COALESCE(SUM(huevos_rotos), 0) as huevos_rotos,
      COALESCE(
        CASE 
          WHEN SUM(huevos_recolectados) > 0 
          THEN (SUM(huevos_rotos)::float / SUM(huevos_recolectados)::float * 100)
          ELSE 0 
        END, 
        0
      ) as porcentaje_rotos
    FROM registros_postura
    WHERE 1=1
  `
  
  if (fechaInicio) {
    query = sql`${query} AND fecha >= ${fechaInicio}`
  }
  if (fechaFin) {
    query = sql`${query} AND fecha <= ${fechaFin}`
  }

  const stats = await query
  return stats[0]
}

// Ventas
export async function getVentas(fecha?: string, cliente?: string) {
  let query = sql`
    SELECT *
    FROM ventas
    WHERE 1=1
  `

  if (fecha) {
    query = sql`${query} AND fecha = ${fecha}`
  }

  if (cliente) {
    query = sql`${query} AND cliente_nombre ILIKE ${`%${cliente}%`}`
  }

  query = sql`${query} ORDER BY fecha DESC, id DESC`

  return await query
}

export async function createVenta(data: {
  cliente_nombre: string;
  cantidad_kg: number;
  total: number;
}) {
  await sql`
    INSERT INTO ventas (cliente_nombre, cantidad_kg, total)
    VALUES (${data.cliente_nombre}, ${data.cantidad_kg}, ${data.total})
  `
  revalidatePath("/ventas")
}

export async function updateVenta(
  id: number,
  data: {
    cliente_nombre: string;
    cantidad_kg: number;
    total: number;
  }
) {
  await sql`
    UPDATE ventas
    SET cliente_nombre = ${data.cliente_nombre},
        cantidad_kg = ${data.cantidad_kg},
        total = ${data.total}
    WHERE id = ${id}
  `
  revalidatePath("/ventas")
}

export async function deleteVenta(id: number) {
  await sql`DELETE FROM ventas WHERE id = ${id}`
  revalidatePath("/ventas")
}

export async function getVentasStats() {
  const stats = await sql`
    SELECT 
      COUNT(*) as total_ventas,
      COALESCE(SUM(total), 0) as ingresos_totales,
      COALESCE(AVG(total), 0) as promedio_venta,
      COUNT(DISTINCT cliente_nombre) as clientes_unicos
    FROM ventas
    WHERE fecha >= DATE_TRUNC('month', CURRENT_DATE)
  `
  return stats[0]
}

// Dashboard
export async function getDashboardStats() {
  const [jaulasStats] = await sql`
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN estado = 'Activa' THEN 1 END) as activas
    FROM jaulas
  `

  const avesStats = await getAvesStats()
  const posturaStats = await getPosturaStats()
  const ventasStats = await getVentasStats()

  return {
    jaulas: jaulasStats,
    aves: avesStats,
    postura: posturaStats,
    ventas: ventasStats,
  }
}
