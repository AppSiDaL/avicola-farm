-- Tabla de Jaulas
CREATE TABLE IF NOT EXISTS jaulas (
  id SERIAL PRIMARY KEY,
  numero VARCHAR(50) NOT NULL UNIQUE,
  ubicacion VARCHAR(255) NOT NULL,
  capacidad_maxima INTEGER NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'Activa',
  fecha_instalacion DATE NOT NULL,
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Aves
CREATE TABLE IF NOT EXISTS aves (
  id SERIAL PRIMARY KEY,
  fecha_ingreso DATE NOT NULL,
  raza VARCHAR(100) NOT NULL,
  jaula_id INTEGER REFERENCES jaulas(id) ON DELETE SET NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'Activa',
  peso DECIMAL(5,2),
  edad INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Registros de Postura
CREATE TABLE IF NOT EXISTS registros_postura (
  id SERIAL PRIMARY KEY,
  jaula_id INTEGER NOT NULL REFERENCES jaulas(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  huevos_recolectados INTEGER NOT NULL DEFAULT 0,
  huevos_rotos INTEGER NOT NULL DEFAULT 0,
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(jaula_id, fecha)
);

-- Tabla de Ventas
CREATE TABLE IF NOT EXISTS ventas (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  cliente_nombre VARCHAR(255) NOT NULL,
  cantidad_kg DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Gastos
CREATE TABLE IF NOT EXISTS gastos (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  categoria VARCHAR(50) NOT NULL,
  descripcion VARCHAR(255) NOT NULL,
  cantidad DECIMAL(10, 2) NOT NULL DEFAULT 1,
  monto DECIMAL(10, 2) NOT NULL,
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_aves_jaula ON aves(jaula_id);
CREATE INDEX IF NOT EXISTS idx_aves_estado ON aves(estado);
CREATE INDEX IF NOT EXISTS idx_registros_postura_jaula ON registros_postura(jaula_id);
CREATE INDEX IF NOT EXISTS idx_registros_postura_fecha ON registros_postura(fecha);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha);
CREATE INDEX IF NOT EXISTS idx_gastos_fecha ON gastos(fecha);
CREATE INDEX IF NOT EXISTS idx_gastos_categoria ON gastos(categoria);
