-- Limpiar datos existentes para evitar duplicados
DELETE FROM
    registros_postura;

DELETE FROM
    aves;

DELETE FROM
    jaulas;

DELETE FROM
    gastos;

DELETE FROM
    ventas;

-- Insertar las nuevas jaulas
INSERT INTO
    jaulas (
        id,
        numero,
        ubicacion,
        capacidad_maxima,
        estado,
        fecha_instalacion
    )
VALUES
    (
        1,
        'Jaula 1',
        'Galpón A',
        24,
        'Activa',
        DATE '2025-11-22'
    ),
    (
        2,
        'Jaula 2',
        'Galpón A',
        9,
        'Activa',
        DATE '2025-11-22'
    ),
    (
        3,
        'Jaula 3',
        'Galpón B',
        18,
        'Activa',
        DATE '2025-11-22'
    ),
    (
        4,
        'Jaula 4',
        'Galpón B',
        30,
        'Activa',
        DATE '2025-11-22'
    ),
    (
        5,
        'Jaula 5',
        'Galpón C',
        15,
        'Activa',
        DATE '2025-11-22'
    ),
    (
        6,
        'Jaula 6',
        'Galpón C',
        13,
        'Activa',
        DATE '2025-11-22'
    ),
    (
        7,
        'Jaula 7',
        'Galpón C',
        40,
        'Activa',
        DATE '2025-11-22'
    );

-- Insertar las aves en sus respectivas jaulas
-- Jaula 1: 10 Leghorn Blanca
INSERT INTO
    aves (fecha_ingreso, raza, jaula_id, edad, peso)
SELECT
    DATE '2025-11-22',
    'Leghorn Blanca',
    1,
    24,
    1.5
FROM
    generate_series(1, 10);

-- Jaula 2: 9 Rhode Island Red
INSERT INTO
    aves (fecha_ingreso, raza, jaula_id, edad, peso)
SELECT
    DATE '2025-11-22',
    'Rhode Island Red',
    2,
    24,
    1.5
FROM
    generate_series(1, 9);

-- Jaula 3: 12 Avada, 6 Rhode Island Red
INSERT INTO
    aves (fecha_ingreso, raza, jaula_id, edad, peso)
SELECT
    DATE '2025-11-22',
    'Avada',
    3,
    24,
    1.5
FROM
    generate_series(1, 12)
UNION
ALL
SELECT
    DATE '2025-11-22',
    'Rhode Island Red',
    3,
    24,
    1.5
FROM
    generate_series(1, 6);

-- Jaula 4: 30 Colorada
INSERT INTO
    aves (fecha_ingreso, raza, jaula_id, edad, peso)
SELECT
    DATE '2025-11-22',
    'Colorada',
    4,
    24,
    1.5
FROM
    generate_series(1, 30);

-- Jaula 5: 15 Rhode Island Red
INSERT INTO
    aves (fecha_ingreso, raza, jaula_id, edad, peso)
SELECT
    DATE '2025-11-22',
    'Rhode Island Red',
    5,
    24,
    1.5
FROM
    generate_series(1, 15);

-- Jaula 6: 13 Rhode Island Red
INSERT INTO
    aves (fecha_ingreso, raza, jaula_id, edad, peso)
SELECT
    DATE '2025-11-22',
    'Rhode Island Red',
    6,
    24,
    1.5
FROM
    generate_series(1, 13);

-- Jaula 7: 6 Gris, 13 Rhode Island Red
INSERT INTO
    aves (fecha_ingreso, raza, jaula_id, edad, peso)
SELECT
    DATE '2025-11-22',
    'Gris',
    7,
    24,
    1.5
FROM
    generate_series(1, 6)
UNION
ALL
SELECT
    DATE '2025-11-22',
    'Rhode Island Red',
    7,
    24,
    1.5
FROM
    generate_series(1, 13);

-- Insertar los registros de postura
INSERT INTO
    registros_postura (jaula_id, fecha, huevos_recolectados)
VALUES
    (1, DATE '2025-11-25', 6),
    (2, DATE '2025-11-25', 3),
    (3, DATE '2025-11-25', 5),
    (4, DATE '2025-11-25', 13),
    (5, DATE '2025-11-25', 9),
    (6, DATE '2025-11-25', 7),
    (7, DATE '2025-11-25', 10);


-- Insertar datos de ventas de ejemplo
INSERT INTO
    ventas (
        id,
        fecha,
        cliente_nombre,
        cantidad_kg,
        total,
        estado
    )
VALUES
    (
        2,
        DATE '2025-11-22',
        'Tia Naye',
        1.50,
        75.00,
        'Pagado'
    ),
    (
        3,
        DATE '2025-11-22',
        'Caja',
        10.50,
        525.00,
        'Pagado'
    ),
    (
        4,
        DATE '2025-11-24',
        'Tia Chilito',
        3.00,
        150.00,
        'Pagado'
    ),
    (
        5,
        DATE '2025-11-24',
        'Juana Gomez',
        1.00,
        50.00,
        'Pagado'
    ),
    (
        6,
        DATE '2025-11-24',
        'Doña Cruz',
        1.00,
        50.00,
        'Pagado'
    ),
    (
        7,
        DATE '2025-11-24',
        'Doña Mago',
        2.00,
        100.00,
        'Pagado'
    ),
    (
        8,
        DATE '2025-11-24',
        'Doña Mago',
        2.00,
        100.00,
        'Pendiente'
    ),
    (
        9,
        DATE '2025-11-25',
        'Leñero',
        1.00,
        50.00,
        'Pagado'
    ),
    (
        10,
        DATE '2025-11-25',
        'Maestra Diana',
        2.00,
        100.00,
        'Pagado'
    ),
    (
        11,
        DATE '2025-11-25',
        'Fer Amigo beny',
        2.00,
        100.00,
        'Pagado'
    );