-- Limpiar datos existentes para evitar duplicados
DELETE FROM registros_postura;
DELETE FROM aves;
DELETE FROM jaulas;

-- Insertar las nuevas jaulas
INSERT INTO jaulas (id, numero, ubicacion, capacidad_maxima, estado, fecha_instalacion) VALUES
(1, 'Jaula 1', 'Galpón A', 24, 'Activa', DATE '2025-11-22'),
(2, 'Jaula 2', 'Galpón A', 9, 'Activa', DATE '2025-11-22'),
(3, 'Jaula 3', 'Galpón B', 18, 'Activa', DATE '2025-11-22'),
(4, 'Jaula 4', 'Galpón B', 24, 'Activa', DATE '2025-11-22'),
(5, 'Jaula 5', 'Galpón C', 15, 'Activa', DATE '2025-11-22'),
(6, 'Jaula 6', 'Galpón C', 15, 'Activa', DATE '2025-11-22');

-- Insertar las aves en sus respectivas jaulas
-- Jaula 1: 8 blancas, 8 avadas
INSERT INTO aves (fecha_ingreso, raza, jaula_id, edad, peso)
SELECT DATE '2025-11-22', 'Leghorn Blanca', 1, 24, 1.5 FROM generate_series(1, 8)
UNION ALL
SELECT DATE '2025-11-22', 'Avada', 1, 24, 1.5 FROM generate_series(1, 8);

-- Jaula 2: 9 Rhode Island
INSERT INTO aves (fecha_ingreso, raza, jaula_id, edad, peso)
SELECT DATE '2025-11-22', 'Rhode Island Red', 2, 24, 1.5 FROM generate_series(1, 9);

-- Jaula 3: 17 coloradas
INSERT INTO aves (fecha_ingreso, raza, jaula_id, edad, peso)
SELECT DATE '2025-11-22', 'Colorada', 3, 24, 1.5 FROM generate_series(1, 17);

-- Jaula 4: 7 blancas, 1 Rhode Island, 13 coloradas
INSERT INTO aves (fecha_ingreso, raza, jaula_id, edad, peso)
SELECT DATE '2025-11-22', 'Leghorn Blanca', 4, 24, 1.5 FROM generate_series(1, 7)
UNION ALL
SELECT DATE '2025-11-22', 'Rhode Island Red', 4, 24, 1.5 FROM generate_series(1, 1)
UNION ALL
SELECT DATE '2025-11-22', 'Colorada', 4, 24, 1.5 FROM generate_series(1, 13);

-- Jaula 5: 15 Rhode Island
INSERT INTO aves (fecha_ingreso, raza, jaula_id, edad, peso)
SELECT DATE '2025-11-22', 'Rhode Island Red', 5, 24, 1.5 FROM generate_series(1, 15);

-- Jaula 6: 15 Rhode Island
INSERT INTO aves (fecha_ingreso, raza, jaula_id, edad, peso)
SELECT DATE '2025-11-22', 'Rhode Island Red', 6, 24, 1.5 FROM generate_series(1, 15);

-- Insertar los registros de postura
INSERT INTO registros_postura (jaula_id, fecha, huevos_recolectados) VALUES
(6, DATE '2025-11-22', 3),
(5, DATE '2025-11-22', 2),
(4, DATE '2025-11-22', 2),
(3, DATE '2025-11-22', 3);
