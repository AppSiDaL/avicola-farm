-- Seed data para tablas con UUID
-- Nota: Los UUIDs se generan automáticamente, usamos CTEs para mantener las referencias
-- Limpiar datos existentes
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

-- Insertar galpones y guardar sus IDs en una tabla temporal
DO $ $ DECLARE galpon_a_id UUID;

galpon_b_id UUID;

galpon_c_id UUID;

galpon_d_id UUID;

jaula_1_id UUID;

jaula_2_id UUID;

jaula_3_id UUID;

jaula_4_id UUID;

jaula_5_id UUID;

jaula_6_id UUID;

jaula_7_id UUID;

BEGIN -- Insertar galpones
INSERT INTO
    galpones (
        nombre,
        capacidad_maxima,
        estado,
        fecha_instalacion
    )
VALUES
    ('Galpón A', 100, 'Activo', '2025-11-22') RETURNING id INTO galpon_a_id;

INSERT INTO
    galpones (
        nombre,
        capacidad_maxima,
        estado,
        fecha_instalacion
    )
VALUES
    ('Galpón B', 150, 'Activo', '2025-11-22') RETURNING id INTO galpon_b_id;

INSERT INTO
    galpones (
        nombre,
        capacidad_maxima,
        estado,
        fecha_instalacion
    )
VALUES
    ('Galpón C', 120, 'Activo', '2025-11-22') RETURNING id INTO galpon_c_id;

INSERT INTO
    galpones (
        nombre,
        capacidad_maxima,
        estado,
        fecha_instalacion
    )
VALUES
    ('Galpón D', 200, 'Activo', '2025-11-22') RETURNING id INTO galpon_d_id;

-- Insertar jaulas en Galpón A
INSERT INTO
    jaulas (
        numero,
        galpon_id,
        capacidad_maxima,
        estado,
        fecha_instalacion
    )
VALUES
    (
        'Jaula 1',
        galpon_a_id,
        24,
        'Activa',
        '2025-11-22'
    ) RETURNING id INTO jaula_1_id;

INSERT INTO
    jaulas (
        numero,
        galpon_id,
        capacidad_maxima,
        estado,
        fecha_instalacion
    )
VALUES
    (
        'Jaula 2',
        galpon_a_id,
        9,
        'Activa',
        '2025-11-22'
    ) RETURNING id INTO jaula_2_id;

-- Insertar jaulas en Galpón B
INSERT INTO
    jaulas (
        numero,
        galpon_id,
        capacidad_maxima,
        estado,
        fecha_instalacion
    )
VALUES
    (
        'Jaula 3',
        galpon_b_id,
        18,
        'Activa',
        '2025-11-22'
    ) RETURNING id INTO jaula_3_id;

INSERT INTO
    jaulas (
        numero,
        galpon_id,
        capacidad_maxima,
        estado,
        fecha_instalacion
    )
VALUES
    (
        'Jaula 4',
        galpon_b_id,
        30,
        'Activa',
        '2025-11-22'
    ) RETURNING id INTO jaula_4_id;

-- Insertar jaulas en Galpón C
INSERT INTO
    jaulas (
        numero,
        galpon_id,
        capacidad_maxima,
        estado,
        fecha_instalacion
    )
VALUES
    (
        'Jaula 5',
        galpon_c_id,
        15,
        'Activa',
        '2025-11-22'
    ) RETURNING id INTO jaula_5_id;

INSERT INTO
    jaulas (
        numero,
        galpon_id,
        capacidad_maxima,
        estado,
        fecha_instalacion
    )
VALUES
    (
        'Jaula 6',
        galpon_c_id,
        13,
        'Activa',
        '2025-11-22'
    ) RETURNING id INTO jaula_6_id;

-- Insertar jaulas en Galpón D
INSERT INTO
    jaulas (
        numero,
        galpon_id,
        capacidad_maxima,
        estado,
        fecha_instalacion
    )
VALUES
    (
        'Jaula 7',
        galpon_d_id,
        40,
        'Activa',
        '2025-11-22'
    ) RETURNING id INTO jaula_7_id;

-- Insertar aves en Jaula 1: 10 Leghorn Blanca
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
    jaula_1_id,
    'Activa',
    1.50,
    24
FROM
    generate_series(1, 10);

-- Insertar aves en Jaula 2: 9 Rhode Island Red
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
    jaula_2_id,
    'Activa',
    1.50,
    24
FROM
    generate_series(1, 9);

-- Insertar aves en Jaula 3: 12 Avada, 6 Rhode Island Red
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
    jaula_3_id,
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
    jaula_3_id,
    'Activa',
    1.50,
    24
FROM
    generate_series(1, 6);

-- Insertar aves en Jaula 4: 30 Colorada
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
    jaula_4_id,
    'Activa',
    1.50,
    24
FROM
    generate_series(1, 30);

-- Insertar aves en Jaula 5: 15 Rhode Island Red
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
    jaula_5_id,
    'Activa',
    1.50,
    24
FROM
    generate_series(1, 15);

-- Insertar aves en Jaula 6: 13 Rhode Island Red
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
    jaula_6_id,
    'Activa',
    1.50,
    24
FROM
    generate_series(1, 13);

-- Insertar aves en Jaula 7: 6 Gris, 13 Rhode Island Red
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
    jaula_7_id,
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
    jaula_7_id,
    'Activa',
    1.50,
    24
FROM
    generate_series(1, 13);

END $ $;

-- Insertar gastos (sin referencias a otras tablas, UUID se genera automáticamente)
INSERT INTO
    gastos (fecha, categoria, descripcion, cantidad, monto)
VALUES
    (
        '2025-11-25',
        'Alimento',
        'Salvado Trimex 25kg',
        1.00,
        128.00
    ),
    (
        '2025-11-25',
        'Alimento',
        'Pasta de Soya 40kg',
        1.00,
        390.00
    ),
    (
        '2025-11-25',
        'Alimento',
        'Maiz Molido 40kg',
        3.00,
        735.00
    );

-- Insertar ventas (sin referencias a otras tablas, UUID se genera automáticamente)
INSERT INTO
    ventas (
        fecha,
        cliente_nombre,
        cantidad_kg,
        total,
        estado
    )
VALUES
    (
        '2025-11-26',
        'Tio Chato',
        2.00,
        100.00,
        'Pagado'
    ),
    ('2025-11-22', 'Tia Naye', 1.50, 75.00, 'Pagado'),
    ('2025-11-22', 'Caja', 10.50, 525.00, 'Pagado'),
    (
        '2025-11-24',
        'Tia Chilito',
        3.00,
        150.00,
        'Pagado'
    ),
    (
        '2025-11-24',
        'Juana Gomez',
        1.00,
        50.00,
        'Pagado'
    ),
    ('2025-11-24', 'Doña Cruz', 1.00, 50.00, 'Pagado'),
    ('2025-11-24', 'Doña Mago', 1.00, 50.00, 'Pagado'),
    (
        '2025-11-24',
        'Doña Mago',
        1.00,
        50.00,
        'Pendiente'
    ),
    ('2025-11-25', 'Leñero', 1.00, 50.00, 'Pagado'),
    (
        '2025-11-25',
        'Maestra Diana',
        2.00,
        100.00,
        'Pagado'
    ),
    (
        '2025-11-25',
        'Fer Amigo beny',
        2.00,
        100.00,
        'Pagado'
    ),
    (
        '2025-11-26',
        'Juana Gomez',
        1.00,
        50.00,
        'Pagado'
    ),
    ('2025-11-26', 'Judith', 1.00, 50.00, 'Pagado');