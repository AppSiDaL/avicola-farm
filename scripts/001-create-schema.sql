-- Tabla de Galpones
CREATE TABLE IF NOT EXISTS galpones (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  ubicacion VARCHAR(255),
  capacidad_maxima INTEGER NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'Activo',
  fecha_instalacion DATE NOT NULL,
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Jaulas
CREATE TABLE IF NOT EXISTS jaulas (
  id SERIAL PRIMARY KEY,
  numero VARCHAR(50) NOT NULL,
  galpon_id INTEGER NOT NULL REFERENCES galpones(id) ON DELETE CASCADE,
  capacidad_maxima INTEGER NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'Activa',
  fecha_instalacion DATE NOT NULL,
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(numero, galpon_id)
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
  fecha DATE NOT NULL,
  galpon_id INTEGER REFERENCES galpones(id) ON DELETE CASCADE,
  jaula_id INTEGER REFERENCES jaulas(id) ON DELETE CASCADE,
  huevos_recolectados INTEGER NOT NULL DEFAULT 0,
  huevos_rotos INTEGER NOT NULL DEFAULT 0,
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_postura_target CHECK (
    (galpon_id IS NOT NULL AND jaula_id IS NULL) OR 
    (galpon_id IS NULL AND jaula_id IS NOT NULL)
  ),
  UNIQUE(fecha, galpon_id),
  UNIQUE(fecha, jaula_id)
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
CREATE INDEX IF NOT EXISTS idx_jaulas_galpon ON jaulas(galpon_id);
CREATE INDEX IF NOT EXISTS idx_aves_jaula ON aves(jaula_id);
CREATE INDEX IF NOT EXISTS idx_aves_estado ON aves(estado);
CREATE INDEX IF NOT EXISTS idx_registros_postura_galpon ON registros_postura(galpon_id);
CREATE INDEX IF NOT EXISTS idx_registros_postura_jaula ON registros_postura(jaula_id);
CREATE INDEX IF NOT EXISTS idx_registros_postura_fecha ON registros_postura(fecha);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha);
CREATE INDEX IF NOT EXISTS idx_gastos_fecha ON gastos(fecha);
CREATE INDEX IF NOT EXISTS idx_gastos_categoria ON gastos(categoria);
