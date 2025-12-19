-- Script de migración a UUID
-- Este script crea nuevas tablas con UUID y migra los datos existentes

-- 1. Habilitar la extensión para generar UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Crear las nuevas tablas con UUID

-- Tabla temporal de mapeo para IDs
CREATE TABLE IF NOT EXISTS id_mapping_galpones (old_id INTEGER, new_id UUID);
CREATE TABLE IF NOT EXISTS id_mapping_jaulas (old_id INTEGER, new_id UUID);
CREATE TABLE IF NOT EXISTS id_mapping_aves (old_id INTEGER, new_id UUID);

-- 2.1 Nueva tabla de Galpones
CREATE TABLE IF NOT EXISTS galpones_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL UNIQUE,
  ubicacion VARCHAR(255),
  capacidad_maxima INTEGER NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'Activo',
  fecha_instalacion DATE NOT NULL,
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2.2 Nueva tabla de Jaulas
CREATE TABLE IF NOT EXISTS jaulas_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero VARCHAR(50) NOT NULL,
  galpon_id UUID NOT NULL REFERENCES galpones_new(id) ON DELETE CASCADE,
  capacidad_maxima INTEGER NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'Activa',
  fecha_instalacion DATE NOT NULL,
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(numero, galpon_id)
);

-- 2.3 Nueva tabla de Aves
CREATE TABLE IF NOT EXISTS aves_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha_ingreso DATE NOT NULL,
  raza VARCHAR(100) NOT NULL,
  jaula_id UUID REFERENCES jaulas_new(id) ON DELETE SET NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'Activa',
  peso DECIMAL(5,2),
  edad INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2.4 Nueva tabla de Registros de Postura
CREATE TABLE IF NOT EXISTS registros_postura_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE NOT NULL,
  galpon_id UUID REFERENCES galpones_new(id) ON DELETE CASCADE,
  jaula_id UUID REFERENCES jaulas_new(id) ON DELETE CASCADE,
  huevos_recolectados INTEGER NOT NULL DEFAULT 0,
  huevos_rotos INTEGER NOT NULL DEFAULT 0,
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_postura_target_new CHECK (
    (galpon_id IS NOT NULL AND jaula_id IS NULL) OR 
    (galpon_id IS NULL AND jaula_id IS NOT NULL)
  ),
  UNIQUE(fecha, galpon_id),
  UNIQUE(fecha, jaula_id)
);

-- 2.5 Nueva tabla de Ventas
CREATE TABLE IF NOT EXISTS ventas_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  cliente_nombre VARCHAR(255) NOT NULL,
  cantidad_kg DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2.6 Nueva tabla de Gastos
CREATE TABLE IF NOT EXISTS gastos_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  categoria VARCHAR(50) NOT NULL,
  descripcion VARCHAR(255) NOT NULL,
  cantidad DECIMAL(10, 2) NOT NULL DEFAULT 1,
  monto DECIMAL(10, 2) NOT NULL,
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Migrar datos existentes

-- 3.1 Migrar Galpones
INSERT INTO galpones_new (id, nombre, ubicacion, capacidad_maxima, estado, fecha_instalacion, notas, created_at, updated_at)
SELECT gen_random_uuid(), nombre, ubicacion, capacidad_maxima, estado, fecha_instalacion, notas, created_at, updated_at
FROM galpones;

-- Guardar mapeo de IDs de galpones
INSERT INTO id_mapping_galpones (old_id, new_id)
SELECT g.id, gn.id
FROM galpones g
JOIN galpones_new gn ON g.nombre = gn.nombre;

-- 3.2 Migrar Jaulas
INSERT INTO jaulas_new (id, numero, galpon_id, capacidad_maxima, estado, fecha_instalacion, notas, created_at, updated_at)
SELECT gen_random_uuid(), j.numero, m.new_id, j.capacidad_maxima, j.estado, j.fecha_instalacion, j.notas, j.created_at, j.updated_at
FROM jaulas j
JOIN id_mapping_galpones m ON j.galpon_id = m.old_id;

-- Guardar mapeo de IDs de jaulas
INSERT INTO id_mapping_jaulas (old_id, new_id)
SELECT j.id, jn.id
FROM jaulas j
JOIN id_mapping_galpones mg ON j.galpon_id = mg.old_id
JOIN jaulas_new jn ON j.numero = jn.numero AND jn.galpon_id = mg.new_id;

-- 3.3 Migrar Aves
INSERT INTO aves_new (id, fecha_ingreso, raza, jaula_id, estado, peso, edad, created_at, updated_at)
SELECT gen_random_uuid(), a.fecha_ingreso, a.raza, mj.new_id, a.estado, a.peso, a.edad, a.created_at, a.updated_at
FROM aves a
LEFT JOIN id_mapping_jaulas mj ON a.jaula_id = mj.old_id;

-- 3.4 Migrar Registros de Postura
INSERT INTO registros_postura_new (id, fecha, galpon_id, jaula_id, huevos_recolectados, huevos_rotos, notas, created_at, updated_at)
SELECT gen_random_uuid(), rp.fecha, mg.new_id, mj.new_id, rp.huevos_recolectados, rp.huevos_rotos, rp.notas, rp.created_at, rp.updated_at
FROM registros_postura rp
LEFT JOIN id_mapping_galpones mg ON rp.galpon_id = mg.old_id
LEFT JOIN id_mapping_jaulas mj ON rp.jaula_id = mj.old_id;

-- 3.5 Migrar Ventas
INSERT INTO ventas_new (id, fecha, cliente_nombre, cantidad_kg, total, estado, created_at, updated_at)
SELECT gen_random_uuid(), fecha, cliente_nombre, cantidad_kg, total, estado, created_at, updated_at
FROM ventas;

-- 3.6 Migrar Gastos
INSERT INTO gastos_new (id, fecha, categoria, descripcion, cantidad, monto, notas, created_at, updated_at)
SELECT gen_random_uuid(), fecha, categoria, descripcion, cantidad, monto, notas, created_at, updated_at
FROM gastos;

-- 4. Renombrar tablas (hacer backup de las viejas y activar las nuevas)
ALTER TABLE galpones RENAME TO galpones_old;
ALTER TABLE jaulas RENAME TO jaulas_old;
ALTER TABLE aves RENAME TO aves_old;
ALTER TABLE registros_postura RENAME TO registros_postura_old;
ALTER TABLE ventas RENAME TO ventas_old;
ALTER TABLE gastos RENAME TO gastos_old;

ALTER TABLE galpones_new RENAME TO galpones;
ALTER TABLE jaulas_new RENAME TO jaulas;
ALTER TABLE aves_new RENAME TO aves;
ALTER TABLE registros_postura_new RENAME TO registros_postura;
ALTER TABLE ventas_new RENAME TO ventas;
ALTER TABLE gastos_new RENAME TO gastos;

-- 5. Crear índices para las nuevas tablas
CREATE INDEX IF NOT EXISTS idx_jaulas_galpon ON jaulas(galpon_id);
CREATE INDEX IF NOT EXISTS idx_aves_jaula ON aves(jaula_id);
CREATE INDEX IF NOT EXISTS idx_aves_estado ON aves(estado);
CREATE INDEX IF NOT EXISTS idx_registros_postura_galpon ON registros_postura(galpon_id);
CREATE INDEX IF NOT EXISTS idx_registros_postura_jaula ON registros_postura(jaula_id);
CREATE INDEX IF NOT EXISTS idx_registros_postura_fecha ON registros_postura(fecha);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha);
CREATE INDEX IF NOT EXISTS idx_gastos_fecha ON gastos(fecha);
CREATE INDEX IF NOT EXISTS idx_gastos_categoria ON gastos(categoria);

-- 6. Limpiar tablas de mapeo (opcional - descomentar si ya no se necesitan)
-- DROP TABLE id_mapping_galpones;
-- DROP TABLE id_mapping_jaulas;
-- DROP TABLE id_mapping_aves;

-- 7. Limpiar tablas antiguas (opcional - descomentar después de verificar migración)
-- DROP TABLE galpones_old CASCADE;
-- DROP TABLE jaulas_old CASCADE;
-- DROP TABLE aves_old CASCADE;
-- DROP TABLE registros_postura_old;
-- DROP TABLE ventas_old;
-- DROP TABLE gastos_old;
