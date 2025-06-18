# Venta de productos Papelera

ALTER TABLE productos
  ALTER COLUMN imagen TYPE BYTEA USING imagen::BYTEA;
