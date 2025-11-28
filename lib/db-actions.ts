"use server"

import { sql } from "./db"
import { revalidatePath } from "next/cache"

// Galpones
export async function getGalpones() {
  const galpones = await sql`
    SELECT g.*, 
           COUNT(a.id) as total_aves
    FROM galpones g
    LEFT JOIN jaulas j ON j.galpon_id = g.id
    LEFT JOIN aves a ON a.jaula_id = j.id AND a.estado = 'Activa'
    GROUP BY g.id
    ORDER BY g.nombre
  `
  return galpones
}

export async function createGalpon(data: {
  nombre: string
  ubicacion: string
  capacidad_maxima: number
  estado: string
  fecha_instalacion: string
  notas?: string
}) {
  await sql`
    INSERT INTO galpones (nombre, ubicacion, capacidad_maxima, estado, fecha_instalacion, notas)
    VALUES (${data.nombre}, ${data.ubicacion}, ${data.capacidad_maxima}, ${data.estado}, ${data.fecha_instalacion}, ${data.notas || null})
  `
  revalidatePath("/galpones")
}

export async function getGalponById(id: number) {
  const galpon = await sql`
    SELECT * FROM galpones WHERE id = ${id}
  `
  return galpon[0]
}

export async function updateGalpon(
  id: number,
  data: {
    nombre: string
    ubicacion: string
    capacidad_maxima: number
    estado: string
    fecha_instalacion: string
    notas?: string
  }
) {
  await sql`
    UPDATE galpones
    SET nombre = ${data.nombre},
        ubicacion = ${data.ubicacion},
        capacidad_maxima = ${data.capacidad_maxima},
        estado = ${data.estado},
        fecha_instalacion = ${data.fecha_instalacion},
        notas = ${data.notas || null}
    WHERE id = ${id}
  `
  revalidatePath("/galpones")
  revalidatePath(`/galpones/${id}/editar`)
}

export async function deleteGalpon(id: number) {
  await sql`DELETE FROM galpones WHERE id = ${id}`
  revalidatePath("/galpones")
}

// Jaulas
export async function getJaulas() {
  const jaulas = await sql`
    SELECT j.*, 
           g.nombre as galpon_nombre,
           COUNT(a.id) as total_aves
    FROM jaulas j
    JOIN galpones g ON j.galpon_id = g.id
    LEFT JOIN aves a ON a.jaula_id = j.id AND a.estado = 'Activa'
    GROUP BY j.id, g.nombre
    ORDER BY g.nombre, j.numero
  `
  return jaulas
}

export async function createJaula(data: {
  numero: string
  galpon_id: number
  capacidad_maxima: number
  estado: string
  fecha_instalacion: string
  notas?: string
}) {
  await sql`
    INSERT INTO jaulas (numero, galpon_id, capacidad_maxima, estado, fecha_instalacion, notas)
    VALUES (${data.numero}, ${data.galpon_id}, ${data.capacidad_maxima}, ${data.estado}, ${data.fecha_instalacion}, ${data.notas || null})
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
    galpon_id: number
    capacidad_maxima: number
    estado: string
    fecha_instalacion: string
    notas?: string
  }
) {
  await sql`
    UPDATE jaulas
    SET numero = ${data.numero},
        galpon_id = ${data.galpon_id},
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
export async function getAves(page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;
  const aves = await sql`
    SELECT a.*, j.numero as jaula_numero, g.nombre as galpon_nombre
    FROM aves a
    LEFT JOIN jaulas j ON a.jaula_id = j.id
    LEFT JOIN galpones g ON j.galpon_id = g.id
    ORDER BY a.fecha_ingreso DESC
    LIMIT ${pageSize}
    OFFSET ${offset}
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
export async function getRegistrosPostura(
  filter: { type: 'jaula' | 'galpon', id?: string },
  fechaInicio?: string,
  fechaFin?: string,
  page = 1,
  pageSize = 10
) {
  const offset = (page - 1) * pageSize;
  
  let query = sql`
    SELECT 
      rp.id,
      rp.fecha,
      rp.huevos_recolectados,
      rp.huevos_rotos,
      rp.notas,
      j.numero as jaula_numero,
      g.nombre as galpon_nombre
    FROM registros_postura rp
    LEFT JOIN jaulas j ON rp.jaula_id = j.id
    LEFT JOIN galpones g ON rp.galpon_id = g.id OR j.galpon_id = g.id
    WHERE 1=1
  `

  if (filter.id && filter.id !== "todos") {
    if (filter.type === 'jaula') {
      query = sql`${query} AND rp.jaula_id = ${Number.parseInt(filter.id)}`
    } else if (filter.type === 'galpon') {
      query = sql`${query} AND (rp.galpon_id = ${Number.parseInt(filter.id)} OR j.galpon_id = ${Number.parseInt(filter.id)})`
    }
  }

  if (fechaInicio) {
    query = sql`${query} AND rp.fecha >= ${fechaInicio}`
  }

  if (fechaFin) {
    query = sql`${query} AND rp.fecha <= ${fechaFin}`
  }

  query = sql`${query} ORDER BY rp.fecha DESC, g.nombre, j.numero LIMIT ${pageSize} OFFSET ${offset}`

  return await query
}

export async function getRegistrosPosturaCount(
  filter: { type: 'jaula' | 'galpon', id?: string },
  fechaInicio?: string,
  fechaFin?: string
) {
  let query = sql`
    SELECT COUNT(rp.id) as total
    FROM registros_postura rp
    LEFT JOIN jaulas j ON rp.jaula_id = j.id
    WHERE 1=1
  `
  if (filter.id && filter.id !== "todos") {
    if (filter.type === 'jaula') {
      query = sql`${query} AND rp.jaula_id = ${Number.parseInt(filter.id)}`
    } else if (filter.type === 'galpon') {
      query = sql`${query} AND (rp.galpon_id = ${Number.parseInt(filter.id)} OR j.galpon_id = ${Number.parseInt(filter.id)})`
    }
  }
  if (fechaInicio) {
    query = sql`${query} AND rp.fecha >= ${fechaInicio}`
  }
  if (fechaFin) {
    query = sql`${query} AND rp.fecha <= ${fechaFin}`
  }

  const result = await query;
  return result[0].total;
}

export async function createRegistroPostura(data: {
  jaula_id?: number;
  galpon_id?: number;
  fecha: string;
  huevos_recolectados: number;
  huevos_rotos: number;
  notas?: string;
}) {
  const { jaula_id, galpon_id, fecha, huevos_recolectados, huevos_rotos, notas } = data;

  // Validación
  if (galpon_id) {
    // Si se registra por galpón, verificar que no haya registros para sus jaulas en la misma fecha
    const jaulasEnGalpon = await sql`SELECT id FROM jaulas WHERE galpon_id = ${galpon_id}`;
    const jaulaIds = jaulasEnGalpon.map(j => j.id);
    if (jaulaIds.length > 0) {
      const existing = await sql`
        SELECT id FROM registros_postura 
        WHERE fecha = ${fecha} AND jaula_id = ANY(${jaulaIds})
      `;
      if (existing.length > 0) {
        throw new Error("Ya existen registros de postura para las jaulas de este galpón en esta fecha.");
      }
    }
  } else if (jaula_id) {
    // Si se registra por jaula, verificar que no haya un registro para el galpón en la misma fecha
    const [jaula] = await sql`SELECT galpon_id FROM jaulas WHERE id = ${jaula_id}`;
    if (jaula) {
      const existing = await sql`
        SELECT id FROM registros_postura 
        WHERE fecha = ${fecha} AND galpon_id = ${jaula.galpon_id}
      `;
      if (existing.length > 0) {
        throw new Error("Ya existe un registro de postura para el galpón completo en esta fecha.");
      }
    }
  }

  if (galpon_id) {
    await sql`
      INSERT INTO registros_postura (galpon_id, fecha, huevos_recolectados, huevos_rotos, notas)
      VALUES (${galpon_id}, ${fecha}, ${huevos_recolectados}, ${huevos_rotos}, ${notas || null})
      ON CONFLICT (fecha, galpon_id)
      DO UPDATE SET 
        huevos_recolectados = ${huevos_recolectados},
        huevos_rotos = ${huevos_rotos},
        notas = ${notas || null}
    `;
  } else if (jaula_id) {
    await sql`
      INSERT INTO registros_postura (jaula_id, fecha, huevos_recolectados, huevos_rotos, notas)
      VALUES (${jaula_id}, ${fecha}, ${huevos_recolectados}, ${huevos_rotos}, ${notas || null})
      ON CONFLICT (fecha, jaula_id)
      DO UPDATE SET 
        huevos_recolectados = ${huevos_recolectados},
        huevos_rotos = ${huevos_rotos},
        notas = ${notas || null}
    `;
  }

  revalidatePath("/postura");
}


export async function updateRegistroPostura(
  id: number,
  data: {
    jaula_id?: number
    galpon_id?: number
    fecha: string
    huevos_recolectados: number
    huevos_rotos: number
    notas?: string
  }
) {
  await sql`
    UPDATE registros_postura
    SET jaula_id = ${data.jaula_id || null},
        galpon_id = ${data.galpon_id || null},
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
export async function getVentas(
  fecha?: string,
  cliente?: string,
  page = 1,
  pageSize = 10
) {
  const offset = (page - 1) * pageSize;
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

  query = sql`${query} ORDER BY fecha DESC, id DESC LIMIT ${pageSize} OFFSET ${offset}`

  return await query
}

export async function getVentasCount(fecha?: string, cliente?: string) {
  let query = sql`
    SELECT COUNT(*) as total
    FROM ventas
    WHERE 1=1
  `

  if (fecha) {
    query = sql`${query} AND fecha = ${fecha}`
  }

  if (cliente) {
    query = sql`${query} AND cliente_nombre ILIKE ${`%${cliente}%`}`
  }

  const result = await query;
  return result[0].total;
}

export async function createVenta(data: {
  cliente_nombre: string;
  cantidad_kg: number;
  total: number;
  estado?: string;
}) {
  await sql`
    INSERT INTO ventas (cliente_nombre, cantidad_kg, total, estado)
    VALUES (${data.cliente_nombre}, ${data.cantidad_kg}, ${data.total}, ${data.estado || 'Pendiente'})
  `
  revalidatePath("/ventas")
}

export async function updateVenta(
  id: number,
  data: {
    cliente_nombre: string;
    cantidad_kg: number;
    total: number;
    estado?: string;
  }
) {
  await sql`
    UPDATE ventas
    SET cliente_nombre = ${data.cliente_nombre},
        cantidad_kg = ${data.cantidad_kg},
        total = ${data.total},
        estado = ${data.estado || 'Pendiente'}
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

export async function getClientes() {
  const clientes = await sql`
    SELECT DISTINCT cliente_nombre FROM ventas ORDER BY cliente_nombre
  `
  return clientes
}

export async function getVentasHoy() {
  const today = new Date().toISOString().split("T")[0]
  const ventas = await sql`
    SELECT *
    FROM ventas
    WHERE fecha = ${today}
    ORDER BY id DESC
  `
  return ventas
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
  const today = new Date().toISOString().split("T")[0]
  const posturaStats = await getPosturaStats(today, today)
  const ventasStats = await getVentasStats()
  const ventasHoy = await getVentasHoy()

  const [galponesStats] = await sql`
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN estado = 'Activo' THEN 1 END) as activos
    FROM galpones
  `

  return {
    jaulas: jaulasStats,
    galpones: galponesStats,
    aves: avesStats,
    postura: posturaStats,
    ventas: ventasStats,
    ventasHoy,
  }
}

// Gastos
export async function getGastos(
  fecha?: string,
  categoria?: string,
  page = 1,
  pageSize = 10
) {
  const offset = (page - 1) * pageSize;
  let query = sql`
    SELECT *
    FROM gastos
    WHERE 1=1
  `

  if (fecha) {
    query = sql`${query} AND fecha = ${fecha}`
  }

  if (categoria && categoria !== "todas") {
    query = sql`${query} AND categoria = ${categoria}`
  }

  query = sql`${query} ORDER BY fecha DESC, id DESC LIMIT ${pageSize} OFFSET ${offset}`

  return await query
}

export async function getGastosCount(fecha?: string, categoria?: string) {
  let query = sql`
    SELECT COUNT(*) as total
    FROM gastos
    WHERE 1=1
  `

  if (fecha) {
    query = sql`${query} AND fecha = ${fecha}`
  }

  if (categoria && categoria !== "todas") {
    query = sql`${query} AND categoria = ${categoria}`
  }

  const result = await query;
  return result[0].total;
}

export async function createGasto(data: {
  fecha: string;
  categoria: "Alimento" | "Medicinas" | "Servicios" | "Equipos" | "Otros";
  descripcion: string;
  cantidad: number;
  monto: number;
  notas?: string;
}) {
  await sql`
    INSERT INTO gastos (fecha, categoria, descripcion, cantidad, monto, notas)
    VALUES (${data.fecha}, ${data.categoria}, ${data.descripcion}, ${data.cantidad}, ${data.monto}, ${data.notas || null})
  `
  revalidatePath("/gastos")
}

export async function updateGasto(
  id: number,
  data: {
    fecha: string;
    categoria: "Alimento" | "Medicinas" | "Servicios" | "Equipos" | "Otros";
    descripcion: string;
    cantidad: number;
    monto: number;
    notas?: string;
  }
) {
  await sql`
    UPDATE gastos
    SET fecha = ${data.fecha},
        categoria = ${data.categoria},
        descripcion = ${data.descripcion},
        cantidad = ${data.cantidad},
        monto = ${data.monto},
        notas = ${data.notas || null}
    WHERE id = ${id}
  `
  revalidatePath("/gastos")
}

export async function deleteGasto(id: number) {
  await sql`DELETE FROM gastos WHERE id = ${id}`
  revalidatePath("/gastas")
}

export async function getGastosStats() {
  const stats = await sql`
    SELECT 
      COUNT(*) as total_gastos,
      COALESCE(SUM(monto), 0) as monto_total,
      COALESCE(AVG(monto), 0) as promedio_gasto,
      COUNT(DISTINCT categoria) as categorias
    FROM gastos
  `
  return stats[0]
}
