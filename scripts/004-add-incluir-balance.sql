-- Migración para agregar campo incluir_en_balance a gastos
-- Ejecutar este script si ya tienes datos en la base de datos
-- Agregar la columna si no existe
ALTER TABLE
    gastos
ADD
    COLUMN IF NOT EXISTS incluir_en_balance BOOLEAN NOT NULL DEFAULT true;

-- Verificar que se agregó correctamente
SELECT
    column_name,
    data_type,
    column_default
FROM
    information_schema.columns
WHERE
    table_name = 'gastos'
    AND column_name = 'incluir_en_balance';