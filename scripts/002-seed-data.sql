-- Limpiar datos existentes para evitar duplicados
DELETE FROM
    registros_postura;

DELETE FROM
    ventas;

DELETE FROM
    gastos;

DELETE FROM
    aves;

DELETE FROM
    jaulas;

DELETE FROM
    galpones;

-- Insertar los nuevos galpones
INSERT INTO
    galpones (
        id,
        nombre,
        capacidad_maxima,
        estado,
        fecha_instalacion
    )
VALUES
    (1, 'Galpón A', 100, 'Activo', '2025-11-22'),
    (2, 'Galpón B', 150, 'Activo', '2025-11-22'),
    (3, 'Galpón C', 120, 'Activo', '2025-11-22'),
    (4, 'Galpón D', 200, 'Activo', '2025-11-22');

-- Insertar las nuevas jaulas
INSERT INTO
    jaulas (
        id,
        numero,
        galpon_id,
        capacidad_maxima,
        estado,
        fecha_instalacion
    )
VALUES
    (1, 'Jaula 1', 1, 24, 'Activa', '2025-11-22'),
    (2, 'Jaula 2', 1, 9, 'Activa', '2025-11-22'),
    (3, 'Jaula 3', 2, 18, 'Activa', '2025-11-22'),
    (4, 'Jaula 4', 2, 30, 'Activa', '2025-11-22'),
    (5, 'Jaula 5', 3, 15, 'Activa', '2025-11-22'),
    (6, 'Jaula 6', 3, 13, 'Activa', '2025-11-22'),
    (7, 'Jaula 7', 4, 40, 'Activa', '2025-11-22');

-- Insertar las aves
-- Jaula 1: 10 Leghorn Blanca
INSERT INTO
    aves (
        fecha_ingreso,
        raza,
        jaula_id,
        estado,
        peso,
        edad
    )
SELECT
    '2025-11-22',
    'Leghorn Blanca',
    1,
    'Activa',
    1.50,
    24
FROM
    generate_series(1, 10);

-- Jaula 2: 9 Rhode Island Red
INSERT INTO
    aves (
        fecha_ingreso,
        raza,
        jaula_id,
        estado,
        peso,
        edad
    )
SELECT
    '2025-11-22',
    'Rhode Island Red',
    2,
    'Activa',
    1.50,
    24
FROM
    generate_series(1, 9);

-- Jaula 3: 12 Avada, 6 Rhode Island Red
INSERT INTO
    aves (
        fecha_ingreso,
        raza,
        jaula_id,
        estado,
        peso,
        edad
    )
SELECT
    '2025-11-22',
    'Avada',
    3,
    'Activa',
    1.50,
    24
FROM
    generate_series(1, 12);

INSERT INTO
    aves (
        fecha_ingreso,
        raza,
        jaula_id,
        estado,
        peso,
        edad
    )
SELECT
    '2025-11-22',
    'Rhode Island Red',
    3,
    'Activa',
    1.50,
    24
FROM
    generate_series(1, 6);

-- Jaula 4: 30 Colorada
INSERT INTO
    aves (
        fecha_ingreso,
        raza,
        jaula_id,
        estado,
        peso,
        edad
    )
SELECT
    '2025-11-22',
    'Colorada',
    4,
    'Activa',
    1.50,
    24
FROM
    generate_series(1, 30);

-- Jaula 5: 15 Rhode Island Red
INSERT INTO
    aves (
        fecha_ingreso,
        raza,
        jaula_id,
        estado,
        peso,
        edad
    )
SELECT
    '2025-11-22',
    'Rhode Island Red',
    5,
    'Activa',
    1.50,
    24
FROM
    generate_series(1, 15);

-- Jaula 6: 13 Rhode Island Red
INSERT INTO
    aves (
        fecha_ingreso,
        raza,
        jaula_id,
        estado,
        peso,
        edad
    )
SELECT
    '2025-11-22',
    'Rhode Island Red',
    6,
    'Activa',
    1.50,
    24
FROM
    generate_series(1, 13);

-- Jaula 7: 6 Gris, 13 Rhode Island Red
INSERT INTO
    aves (
        fecha_ingreso,
        raza,
        jaula_id,
        estado,
        peso,
        edad
    )
SELECT
    '2025-11-22',
    'Gris',
    7,
    'Activa',
    1.50,
    24
FROM
    generate_series(1, 6);

INSERT INTO
    aves (
        fecha_ingreso,
        raza,
        jaula_id,
        estado,
        peso,
        edad
    )
SELECT
    '2025-11-22',
    'Rhode Island Red',
    7,
    'Activa',
    1.50,
    24
FROM
    generate_series(1, 13);

-- Insertar los gastos
INSERT INTO
    gastos (
        id,
        fecha,
        categoria,
        descripcion,
        cantidad,
        monto
    )
VALUES
    (
        2,
        '2025-11-25',
        'Alimento',
        'Salvado Trimex 25kg',
        1.00,
        128.00
    ),
    (
        3,
        '2025-11-25',
        'Alimento',
        'Pasta de Soya 40kg',
        1.00,
        390.00
    ),
    (
        4,
        '2025-11-25',
        'Alimento',
        'Maiz Molido 40kg',
        3.00,
        735.00
    );

-- Insertar las ventas
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
        1,
        '2025-11-26',
        'Tio Chato',
        2.00,
        100.00,
        'Pagado'
    ),
    (
        2,
        '2025-11-22',
        'Tia Naye',
        1.50,
        75.00,
        'Pagado'
    ),
    (3, '2025-11-22', 'Caja', 10.50, 525.00, 'Pagado'),
    (
        4,
        '2025-11-24',
        'Tia Chilito',
        3.00,
        150.00,
        'Pagado'
    ),
    (
        5,
        '2025-11-24',
        'Juana Gomez',
        1.00,
        50.00,
        'Pagado'
    ),
    (
        6,
        '2025-11-24',
        'Doña Cruz',
        1.00,
        50.00,
        'Pagado'
    ),
    (
        7,
        '2025-11-24',
        'Doña Mago',
        1.00,
        50.00,
        'Pagado'
    ),
    (
        8,
        '2025-11-24',
        'Doña Mago',
        1.00,
        50.00,
        'Pendiente'
    ),
    (9, '2025-11-25', 'Leñero', 1.00, 50.00, 'Pagado'),
    (
        10,
        '2025-11-25',
        'Maestra Diana',
        2.00,
        100.00,
        'Pagado'
    ),
    (
        11,
        '2025-11-25',
        'Fer Amigo beny',
        2.00,
        100.00,
        'Pagado'
    ),
    (
        12,
        '2025-11-26',
        'Juana Gomez',
        1.00,
        50.00,
        'Pagado'
    ),
    (
        13,
        '2025-11-26',
        'Judith',
        1.00,
        50.00,
        'Pagado'
    );