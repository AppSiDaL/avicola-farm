/**
 * Script para poblar la base de datos desde archivos JSON
 * 
 * Este script lee los datos exportados de la base de datos anterior
 * y los inserta en la nueva base de datos con UUID.
 * 
 * Uso: npx ts-node scripts/seed-from-json.ts
 * O: npx tsx scripts/seed-from-json.ts
 */

import { neon } from "@neondatabase/serverless";
import * as fs from "fs";
import * as path from "path";

// Leer la DATABASE_URL desde las variables de entorno
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Error: DATABASE_URL no está definida");
  console.log("Asegúrate de tener el archivo .env con DATABASE_URL");
  process.exit(1);
}

const sql = neon(databaseUrl);

// Tipos para los datos JSON
interface GalponJSON {
  id: number;
  nombre: string;
  ubicacion: string | null;
  capacidad_maxima: number;
  estado: string;
  fecha_instalacion: string;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

interface JaulaJSON {
  id: number;
  numero: string;
  galpon_id: number;
  capacidad_maxima: number;
  estado: string;
  fecha_instalacion: string;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

interface AveJSON {
  id: number;
  fecha_ingreso: string;
  raza: string;
  jaula_id: number | null;
  estado: string;
  peso: string | null;
  edad: number | null;
  created_at: string;
  updated_at: string;
}

interface GastoJSON {
  id: number;
  fecha: string;
  categoria: string;
  descripcion: string;
  cantidad: string;
  monto: string;
  notas: string | null;
  incluir_en_balance?: boolean; // Campo opcional para compatibilidad
  created_at: string;
  updated_at: string;
}

interface VentaJSON {
  id: number;
  fecha: string;
  cliente_nombre: string;
  cantidad_kg: string;
  total: string;
  estado: string;
  created_at: string;
  updated_at: string;
}

// Mapa para convertir IDs viejos a nuevos UUIDs
const galponIdMap = new Map<number, string>();
const jaulaIdMap = new Map<number, string>();

async function loadJSON<T>(filename: string): Promise<T[]> {
  const filePath = path.join(process.cwd(), "data", filename);
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content) as T[];
}

async function clearDatabase() {
  console.log("🗑️  Limpiando base de datos...");
  await sql`DELETE FROM registros_postura`;
  await sql`DELETE FROM ventas`;
  await sql`DELETE FROM gastos`;
  await sql`DELETE FROM aves`;
  await sql`DELETE FROM jaulas`;
  await sql`DELETE FROM galpones`;
  console.log("✅ Base de datos limpiada");
}

async function seedGalpones() {
  console.log("🏠 Insertando galpones...");
  const galpones = await loadJSON<GalponJSON>("galpones.json");

  for (const galpon of galpones) {
    const result = await sql`
      INSERT INTO galpones (nombre, ubicacion, capacidad_maxima, estado, fecha_instalacion, notas, created_at, updated_at)
      VALUES (
        ${galpon.nombre},
        ${galpon.ubicacion},
        ${galpon.capacidad_maxima},
        ${galpon.estado},
        ${galpon.fecha_instalacion},
        ${galpon.notas},
        ${galpon.created_at}::timestamp,
        ${galpon.updated_at}::timestamp
      )
      RETURNING id
    `;
    galponIdMap.set(galpon.id, result[0].id);
  }

  console.log(`✅ ${galpones.length} galpones insertados`);
}

async function seedJaulas() {
  console.log("📦 Insertando jaulas...");
  const jaulas = await loadJSON<JaulaJSON>("jaulas.json");

  for (const jaula of jaulas) {
    const newGalponId = galponIdMap.get(jaula.galpon_id);
    if (!newGalponId) {
      console.error(`❌ No se encontró el mapping para galpon_id: ${jaula.galpon_id}`);
      continue;
    }

    const result = await sql`
      INSERT INTO jaulas (numero, galpon_id, capacidad_maxima, estado, fecha_instalacion, notas, created_at, updated_at)
      VALUES (
        ${jaula.numero},
        ${newGalponId}::uuid,
        ${jaula.capacidad_maxima},
        ${jaula.estado},
        ${jaula.fecha_instalacion},
        ${jaula.notas},
        ${jaula.created_at}::timestamp,
        ${jaula.updated_at}::timestamp
      )
      RETURNING id
    `;
    jaulaIdMap.set(jaula.id, result[0].id);
  }

  console.log(`✅ ${jaulas.length} jaulas insertadas`);
}

async function seedAves() {
  console.log("🐔 Insertando aves...");
  const aves = await loadJSON<AveJSON>("aves.json");

  let insertedCount = 0;
  for (const ave of aves) {
    const newJaulaId = ave.jaula_id ? jaulaIdMap.get(ave.jaula_id) : null;
    
    if (ave.jaula_id && !newJaulaId) {
      console.error(`❌ No se encontró el mapping para jaula_id: ${ave.jaula_id}`);
      continue;
    }

    const peso = ave.peso ? parseFloat(ave.peso) : null;

    await sql`
      INSERT INTO aves (fecha_ingreso, raza, jaula_id, estado, peso, edad, created_at, updated_at)
      VALUES (
        ${ave.fecha_ingreso},
        ${ave.raza},
        ${newJaulaId ? sql`${newJaulaId}::uuid` : null},
        ${ave.estado},
        ${peso},
        ${ave.edad},
        ${ave.created_at}::timestamp,
        ${ave.updated_at}::timestamp
      )
    `;
    insertedCount++;
  }

  console.log(`✅ ${insertedCount} aves insertadas`);
}

async function seedGastos() {
  console.log("💰 Insertando gastos...");
  const gastos = await loadJSON<GastoJSON>("gastos.json");

  for (const gasto of gastos) {
    // Usar true como valor por defecto si incluir_en_balance no está definido
    const incluirEnBalance = gasto.incluir_en_balance ?? true;
    
    await sql`
      INSERT INTO gastos (fecha, categoria, descripcion, cantidad, monto, notas, incluir_en_balance, created_at, updated_at)
      VALUES (
        ${gasto.fecha},
        ${gasto.categoria},
        ${gasto.descripcion},
        ${parseFloat(gasto.cantidad)},
        ${parseFloat(gasto.monto)},
        ${gasto.notas},
        ${incluirEnBalance},
        ${gasto.created_at}::timestamp,
        ${gasto.updated_at}::timestamp
      )
    `;
  }

  console.log(`✅ ${gastos.length} gastos insertados`);
}

async function seedVentas() {
  console.log("🛒 Insertando ventas...");
  const ventas = await loadJSON<VentaJSON>("ventas.json");

  for (const venta of ventas) {
    await sql`
      INSERT INTO ventas (fecha, cliente_nombre, cantidad_kg, total, estado, created_at, updated_at)
      VALUES (
        ${venta.fecha},
        ${venta.cliente_nombre},
        ${parseFloat(venta.cantidad_kg)},
        ${parseFloat(venta.total)},
        ${venta.estado},
        ${venta.created_at}::timestamp,
        ${venta.updated_at}::timestamp
      )
    `;
  }

  console.log(`✅ ${ventas.length} ventas insertadas`);
}

async function main() {
  console.log("========================================");
  console.log("🚀 Iniciando seed desde archivos JSON");
  console.log("========================================\n");

  try {
    await clearDatabase();
    console.log("");
    
    await seedGalpones();
    await seedJaulas();
    await seedAves();
    await seedGastos();
    await seedVentas();

    console.log("\n========================================");
    console.log("✅ Seed completado exitosamente!");
    console.log("========================================");
    
    // Mostrar resumen
    console.log("\n📊 Resumen de datos insertados:");
    console.log(`   - Galpones: ${galponIdMap.size}`);
    console.log(`   - Jaulas: ${jaulaIdMap.size}`);
    
    const [avesCount] = await sql`SELECT COUNT(*) as count FROM aves`;
    const [gastosCount] = await sql`SELECT COUNT(*) as count FROM gastos`;
    const [ventasCount] = await sql`SELECT COUNT(*) as count FROM ventas`;
    
    console.log(`   - Aves: ${avesCount.count}`);
    console.log(`   - Gastos: ${gastosCount.count}`);
    console.log(`   - Ventas: ${ventasCount.count}`);

  } catch (error) {
    console.error("\n❌ Error durante el seed:", error);
    process.exit(1);
  }
}

main();
